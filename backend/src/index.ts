import dotenv from "dotenv";
dotenv.config();

console.log("DEBUG ⛔ NETWORK_URL =", process.env.NETWORK_URL);

import express from "express";
import cors from "cors";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import ipfsRouter from "./routers/ipfsRouter.js";
import { initDB } from "./utils/db.js";
import morgan from "morgan";

async function main() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const ABI = JSON.parse(fs.readFileSync("./ReportRegistryABI.json", "utf8"));
  const {
    IPFS_API_URL,
    NETWORK_URL,
    PRIVATE_KEY,
    CONTRACT_ADDRESS,
    PORT = 3000,
  } = process.env;

  // 驗證環境變數
  if (!NETWORK_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("❌ 缺少必要的環境變數");
    process.exit(1);
  }

  // // 內存存儲檢舉內容 (生產環境建議使用數據庫)

  // v6 的写法：直接用 JsonRpcProvider、Wallet、Contract
  // const provider = new JsonRpcProvider(NETWORK_URL);
  // const wallet   = new Wallet(PRIVATE_KEY, provider);
  // const contract = new Contract(CONTRACT_ADDRESS, ABI, wallet);

  initDB().catch((err) => {
    console.error("❌ 初始化資料庫失敗:", err);
    process.exit(1);
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use("/", ipfsRouter);

  app.get("/", (req, res) => {
    res.status(200).send("Welcome to the Report");
  });

  app.get("/health", (req, res) => {
    res.status(200).send("health");
  });

  // // 新增獲取報告列表的 API
  // app.get('/reports', async (req, res) => {
  //   try {
  //     const count = await contract.getReportCount();
  //     const reports = [];

  //     for (let i = 0; i < Number(count); i++) {
  //       const [reporter, cid, timestamp] = await contract.getReport(i);

  //       // 從內存中獲取檢舉內容
  //       const contentData = reportContents.get(cid);

  //       // 為舊記錄提供預設標籤（如果沒有找到內容數據）
  //       let tags = [];
  //       let content = '內容不可用';
  //       let hasContent = false;

  //       if (contentData) {
  //         content = contentData.content;
  //         tags = contentData.tags || [];
  //         hasContent = true;
  //       } else {
  //         // 為舊記錄根據內容特徵推測標籤（簡單示例）
  //         if (cid.includes('QmTest')) {
  //           tags = ['測試記錄'];
  //         } else {
  //           // 為其他舊記錄提供預設標籤
  //           tags = ['歷史記錄'];
  //         }
  //       }

  //       reports.push({
  //         index: i,
  //         reporter,
  //         cid,
  //         timestamp: Number(timestamp),
  //         content: content,
  //         tags: tags,
  //         hasContent: hasContent
  //       });
  //     }

  //     res.json({ success: true, reports, total: Number(count) });
  //   } catch (e) {
  //     console.error('獲取報告錯誤:', e);
  //     res.status(500).json({ success: false, error: e.message });
  //   }
  // });

  // // 新增獲取檢舉內容的 API
  // app.get('/content/:cid', async (req, res) => {
  //   try {
  //     const { cid } = req.params;
  //     const contentData = reportContents.get(cid);

  //     if (!contentData) {
  //       return res.status(404).json({
  //         success: false,
  //         error: '找不到對應的檢舉內容'
  //       });
  //     }

  //     res.json({
  //       success: true,
  //       content: contentData.content,
  //       tags: contentData.tags || [],
  //       timestamp: contentData.timestamp,
  //       createdAt: contentData.createdAt
  //     });
  //   } catch (e) {
  //     console.error('獲取內容錯誤:', e);
  //     res.status(500).json({ success: false, error: e.message });
  //   }
  // });

  // // 獲取單筆檢舉詳細資訊
  // app.get('/reports/:index', async (req, res) => {
  //   try {
  //     const index = parseInt(req.params.index);
  //     if (isNaN(index) || index < 0) {
  //       return res.status(400).json({ success: false, error: '無效的索引' });
  //     }

  //     const count = await contract.getReportCount();
  //     if (index >= Number(count)) {
  //       return res.status(404).json({ success: false, error: '檢舉記錄不存在' });
  //     }

  //     const [reporter, cid, timestamp] = await contract.getReport(index);

  //     // 從內存中獲取檢舉內容
  //     const contentData = reportContents.get(cid);

  //     res.json({
  //       success: true,
  //       report: {
  //         index,
  //         reporter,
  //         cid,
  //         timestamp: Number(timestamp),
  //         date: new Date(Number(timestamp) * 1000).toISOString(),
  //         content: contentData ? contentData.content : '內容不可用',
  //         tags: contentData ? contentData.tags || [] : [],
  //         hasContent: !!contentData
  //       }
  //     });
  //   } catch (e) {
  //     console.error('獲取單筆報告錯誤:', e);
  //     res.status(500).json({ success: false, error: e.message });
  //   }
  // });

  // // 獲取統計資訊
  // app.get('/stats', async (req, res) => {
  //   try {
  //     const count = await contract.getReportCount();
  //     const total = Number(count);

  //     // 計算今日檢舉數
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  //     const todayTimestamp = Math.floor(today.getTime() / 1000);

  //     let todayCount = 0;
  //     for (let i = 0; i < total; i++) {
  //       const [, , timestamp] = await contract.getReport(i);
  //       if (Number(timestamp) >= todayTimestamp) {
  //         todayCount++;
  //       }
  //     }

  //     res.json({
  //       success: true,
  //       stats: {
  //         total,
  //         today: todayCount,
  //         lastUpdated: new Date().toISOString()
  //       }
  //     });
  //   } catch (e) {
  //     console.error('獲取統計錯誤:', e);
  //     res.status(500).json({ success: false, error: e.message });
  //   }
  // });

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.log(e);
});
