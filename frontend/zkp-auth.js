/**
 * ZKP 認證模組 - 使用 Semaphore 實現匿名可撤銷認證
 * 這是一個外掛模組，不會修改原有程式碼
 */

class ZKPAuth {
  constructor() {
    this.identity = null;
    this.commitment = null;
    this.nullifier = null;
    this.isAuthenticated = false;
    this.groupId = 1; // Semaphore 群組 ID
    this.API_BASE = 'http://localhost:3001/api/zkp'; // 後端 ZKP API
  }

  /**
   * 初始化 ZKP 認證
   */
  async initialize() {
    try {
      // 檢查是否已有儲存的身分
      const savedIdentity = localStorage.getItem('zkp_identity');
      if (savedIdentity) {
        this.identity = JSON.parse(savedIdentity);
        this.commitment = this.identity.commitment;
        console.log('載入已存在的 ZKP 身分');
      }
      return true;
    } catch (error) {
      console.error('ZKP 初始化失敗:', error);
      return false;
    }
  }

  /**
   * 用戶認證流程（模擬電話號碼認證）
   */
  async authenticate(phone) {
    try {
      // 1. 生成 Semaphore 身分
      if (!this.identity) {
        // 這裡使用簡化版本，實際應使用 @semaphore-protocol/identity
        this.identity = this.generateIdentity(phone);
        this.commitment = this.identity.commitment;
        
        // 儲存身分到本地（實際應用中可能需要更安全的儲存方式）
        localStorage.setItem('zkp_identity', JSON.stringify(this.identity));
      }

      // 2. 向後端註冊身分
      const response = await fetch(`${this.API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          commitment: this.commitment,
          groupId: this.groupId
        })
      });

      if (!response.ok) {
        throw new Error('認證註冊失敗');
      }

      const result = await response.json();
      this.isAuthenticated = true;
      
      console.log('ZKP 認證成功');
      return true;
    } catch (error) {
      console.error('ZKP 認證失敗:', error);
      return false;
    }
  }

  /**
   * 生成 ZK Proof（用於檢舉等操作）
   */
  async generateProof(action, data) {
    if (!this.isAuthenticated || !this.identity) {
      throw new Error('請先完成 ZKP 認證');
    }

    try {
      // 生成 nullifier（每次操作都不同，但同一身分可追蹤）
      this.nullifier = this.generateNullifier(action, data);

      // 簡化版 proof 生成（實際應使用 @semaphore-protocol/proof）
      const proof = {
        nullifierHash: this.nullifier,
        commitment: this.commitment,
        groupId: this.groupId,
        signal: this.hashData(action + JSON.stringify(data)),
        proof: this.generateMockProof() // 模擬 zk-SNARK proof
      };

      return proof;
    } catch (error) {
      console.error('生成 ZK Proof 失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證 Proof（後端會再次驗證）
   */
  async verifyProof(proof) {
    try {
      const response = await fetch(`${this.API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof)
      });

      if (!response.ok) {
        throw new Error('Proof 驗證失敗');
      }

      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error('Proof 驗證錯誤:', error);
      return false;
    }
  }

  /**
   * 檢查是否被撤銷
   */
  async checkRevocation() {
    if (!this.commitment) return false;

    try {
      const response = await fetch(`${this.API_BASE}/check-revocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitment: this.commitment })
      });

      const result = await response.json();
      return result.revoked;
    } catch (error) {
      console.error('檢查撤銷狀態失敗:', error);
      return false;
    }
  }

  /**
   * 清除認證狀態
   */
  logout() {
    this.identity = null;
    this.commitment = null;
    this.nullifier = null;
    this.isAuthenticated = false;
    localStorage.removeItem('zkp_identity');
  }

  // ========== 輔助方法 ==========

  /**
   * 生成身分（簡化版）
   */
  generateIdentity(phone) {
    const secret = this.hashData(phone + Date.now());
    const commitment = this.hashData('commitment_' + secret);
    return {
      secret: secret,
      commitment: commitment,
      createdAt: Date.now()
    };
  }

  /**
   * 生成 nullifier（每次操作的唯一標識）
   */
  generateNullifier(action, data) {
    const message = this.identity.secret + action + JSON.stringify(data) + Date.now();
    return this.hashData('nullifier_' + message);
  }

  /**
   * 生成模擬 proof
   */
  generateMockProof() {
    return {
      pi_a: [this.randomHex(64), this.randomHex(64)],
      pi_b: [[this.randomHex(64), this.randomHex(64)], [this.randomHex(64), this.randomHex(64)]],
      pi_c: [this.randomHex(64), this.randomHex(64)]
    };
  }

  /**
   * 雜湊函數
   */
  hashData(data) {
    // 簡化版雜湊（實際應使用 crypto.subtle 或 keccak256）
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32位整數
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * 生成隨機 hex
   */
  randomHex(length) {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// 全域 ZKP 認證實例
window.zkpAuth = new ZKPAuth();
