import dotenv from 'dotenv';
dotenv.config();

console.log('DEBUG ⛔ NETWORK_URL =', process.env.NETWORK_URL);

import express    from 'express';
import cors       from 'cors';
import bodyParser from 'body-parser';
import { create } from 'ipfs-http-client';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import fs         from 'fs';
import path       from 'path';
import crypto     from 'crypto';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const ABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'ReportRegistryABI.json'), 'utf8')
);

const {
  IPFS_API_URL,
  NETWORK_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS,
  PORT = 3000
} = process.env;

// 驗證環境變數
if (!NETWORK_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error('❌ 缺少必要的環境變數');
  process.exit(1);
}

// 簡化的 IPFS 處理 - 直接生成模擬 CID 用於 demo
const generateMockCID = (content) => {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return `Qm${hash.substring(0, 44)}`; // 模擬 IPFS CID 格式
};

// 內存存儲檢舉內容 (生產環境建議使用數據庫)
const reportContents = new Map();

console.log('⚠️ 使用模擬 IPFS 模式 (適用於 Demo)');

// v6 的写法：直接用 JsonRpcProvider、Wallet、Contract
const provider = new JsonRpcProvider(NETWORK_URL);
const wallet   = new Wallet(PRIVATE_KEY, provider);
const contract = new Contract(CONTRACT_ADDRESS, ABI, wallet);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {
  try {
    const { content, tags = [], zkProof } = req.body;
    if (!content) throw new Error('請提供 content 欄位');

    console.log('📝 處理檢舉內容:', content.substring(0, 50) + '...');
    console.log('🏷️ 檢舉標籤:', tags);
    
    // 檢查是否有 ZKP 資訊
    let reporterCommitment = null;
    let nullifierHash = null;
    
    if (zkProof) {
      reporterCommitment = zkProof.commitment;
      nullifierHash = zkProof.nullifierHash;
      console.log('🔐 ZKP 檢舉人身分:', reporterCommitment ? reporterCommitment.substring(0, 16) + '...' : '無');
      console.log('🎯 ZKP Nullifier:', nullifierHash ? nullifierHash.substring(0, 16) + '...' : '無');
    }
    
    // 生成模擬 IPFS CID (適用於 Demo)
    const cidString = generateMockCID(content + JSON.stringify(tags));
    console.log('📎 生成 CID:', cidString);

    // 將檢舉內容、標籤和匿名檢舉人資訊存儲在內存中，以CID為鍵
    reportContents.set(cidString, {
      content: content,
      tags: Array.isArray(tags) ? tags : [],
      timestamp: Math.floor(Date.now() / 1000),
      createdAt: new Date().toISOString(),
      // ZKP 匿名檢舉人資訊
      reporterCommitment: reporterCommitment, // 匿名身分識別碼
      nullifierHash: nullifierHash, // 此次檢舉的唯一標識
      zkpVerified: !!zkProof // 是否通過 ZKP 驗證
    });

    console.log('💾 檢舉內容、標籤和匿名檢舉人資訊已存儲，CID:', cidString);

    // 只返回 CID，讓前端直接調用智能合約
    res.json({ success: true, cid: cidString });
  } catch (e) {
    console.error('處理請求錯誤:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 新增獲取報告列表的 API
app.get('/reports', async (req, res) => {
  try {
    const count = await contract.getReportCount();
    const reports = [];
    
    for (let i = 0; i < Number(count); i++) {
      // 使用新的 getReport 方法（返回完整的 ZKP 資訊）
      const [reportId, reporter, cid, timestamp, reporterCommitment, nullifierHash, zkpVerified] = await contract.getReport(i);
      
      // 從內存中獲取檢舉內容
      const contentData = reportContents.get(cid);
      
      // 為舊記錄提供預設標籤（如果沒有找到內容數據）
      let tags = [];
      let content = '內容不可用';
      let hasContent = false;
      
      if (contentData) {
        content = contentData.content;
        tags = contentData.tags || [];
        hasContent = true;
      } else {
        // 為舊記錄根據內容特徵推測標籤（簡單示例）
        if (cid.includes('QmTest')) {
          tags = ['測試記錄'];
        } else {
          // 為其他舊記錄提供預設標籤
          tags = ['歷史記錄'];
        }
      }
      
      reports.push({
        index: i,
        reportId: Number(reportId),
        reporter,
        cid,
        timestamp: Number(timestamp),
        content: content,
        tags: tags,
        hasContent: hasContent,
        // 從智能合約獲取 ZKP 資訊（優先於內存數據）
        reporterCommitment: reporterCommitment || (contentData ? contentData.reporterCommitment : null),
        nullifierHash: nullifierHash || (contentData ? contentData.nullifierHash : null),
        zkpVerified: zkpVerified || (contentData ? contentData.zkpVerified || false : false)
      });
    }
    
    res.json({ success: true, reports, total: Number(count) });
  } catch (e) {
    console.error('獲取報告錯誤:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 新增獲取檢舉內容的 API
app.get('/content/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const contentData = reportContents.get(cid);
    
    if (!contentData) {
      return res.status(404).json({ 
        success: false, 
        error: '找不到對應的檢舉內容' 
      });
    }
    
    res.json({ 
      success: true, 
      content: contentData.content,
      tags: contentData.tags || [],
      timestamp: contentData.timestamp,
      createdAt: contentData.createdAt
    });
  } catch (e) {
    console.error('獲取內容錯誤:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 獲取單筆檢舉詳細資訊
app.get('/reports/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ success: false, error: '無效的索引' });
    }

    const count = await contract.getReportCount();
    if (index >= Number(count)) {
      return res.status(404).json({ success: false, error: '檢舉記錄不存在' });
    }

    // 使用新的 getReport 方法（返回完整的 ZKP 資訊）
    const [reportId, reporter, cid, timestamp, reporterCommitment, nullifierHash, zkpVerified] = await contract.getReport(index);
    
    // 從內存中獲取檢舉內容
    const contentData = reportContents.get(cid);
    
    res.json({ 
      success: true, 
      report: {
        index,
        reportId: Number(reportId),
        reporter,
        cid,
        timestamp: Number(timestamp),
        date: new Date(Number(timestamp) * 1000).toISOString(),
        content: contentData ? contentData.content : '內容不可用',
        tags: contentData ? contentData.tags || [] : [],
        hasContent: !!contentData,
        // 從智能合約獲取 ZKP 資訊（優先於內存數據）
        reporterCommitment: reporterCommitment || (contentData ? contentData.reporterCommitment : null),
        nullifierHash: nullifierHash || (contentData ? contentData.nullifierHash : null),
        zkpVerified: zkpVerified || (contentData ? contentData.zkpVerified || false : false)
      }
    });
  } catch (e) {
    console.error('獲取單筆報告錯誤:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 獲取統計資訊
app.get('/stats', async (req, res) => {
  try {
    const count = await contract.getReportCount();
    const total = Number(count);
    
    // 計算今日檢舉數
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);
    
    let todayCount = 0;
    let zkpVerifiedCount = 0;
    
    for (let i = 0; i < total; i++) {
      // 使用新的 getReport 方法
      const [reportId, reporter, cid, timestamp, reporterCommitment, nullifierHash, zkpVerified] = await contract.getReport(i);
      
      if (Number(timestamp) >= todayTimestamp) {
        todayCount++;
      }
      
      if (zkpVerified) {
        zkpVerifiedCount++;
      }
    }
    
    res.json({ 
      success: true, 
      stats: {
        total,
        today: todayCount,
        zkpVerified: zkpVerifiedCount,
        zkpPercentage: total > 0 ? Math.round((zkpVerifiedCount / total) * 100) : 0,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (e) {
    console.error('獲取統計錯誤:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 新增管理員查詢匿名檢舉人記錄的 API
app.get('/admin/reporter-records', async (req, res) => {
  try {
    const records = [];
    
    // 遍歷所有檢舉記錄，整理匿名檢舉人資訊
    for (const [cid, contentData] of reportContents.entries()) {
      if (contentData.reporterCommitment) {
        records.push({
          cid: cid,
          reporterCommitment: contentData.reporterCommitment,
          nullifierHash: contentData.nullifierHash,
          zkpVerified: contentData.zkpVerified,
          timestamp: contentData.timestamp,
          createdAt: contentData.createdAt,
          tags: contentData.tags,
          contentPreview: contentData.content.substring(0, 100) + '...'
        });
      }
    }
    
    // 按時間倒序排列
    records.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json({ 
      success: true, 
      records: records,
      total: records.length
    });
  } catch (e) {
    console.error('獲取檢舉人記錄錯誤:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 新增根據 commitment 查詢檢舉記錄的 API
app.get('/admin/reporter/:commitment', async (req, res) => {
  try {
    const { commitment } = req.params;
    const records = [];
    
    // 查找所有此檢舉人的記錄
    for (const [cid, contentData] of reportContents.entries()) {
      if (contentData.reporterCommitment === commitment) {
        records.push({
          cid: cid,
          nullifierHash: contentData.nullifierHash,
          timestamp: contentData.timestamp,
          createdAt: contentData.createdAt,
          tags: contentData.tags,
          contentPreview: contentData.content.substring(0, 100) + '...'
        });
      }
    }
    
    // 按時間倒序排列
    records.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json({ 
      success: true, 
      commitment: commitment,
      records: records,
      total: records.length
    });
  } catch (e) {
    console.error('查詢特定檢舉人記錄錯誤:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});