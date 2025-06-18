/**
 * ZKP 認證 UI 模組
 * 處理 ZKP 認證的使用者介面
 */

class ZKPAuthUI {
  constructor() {
    this.modal = null;
    this.isShowing = false;
  }

  /**
   * 顯示 ZKP 認證模態框
   */
  showAuthModal() {
    if (this.isShowing) return;
    
    this.isShowing = true;
    this.createModal();
    document.body.appendChild(this.modal);
    
    // 添加動畫效果
    setTimeout(() => {
      this.modal.style.opacity = '1';
      this.modal.querySelector('.zkp-modal-content').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
  }

  /**
   * 隱藏模態框
   */
  hideModal() {
    if (!this.modal) return;
    
    this.modal.style.opacity = '0';
    this.modal.querySelector('.zkp-modal-content').style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
      this.isShowing = false;
    }, 300);
  }

  /**
   * 建立模態框 HTML
   */
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'zkp-modal';
    this.modal.innerHTML = `
      <style>
        .zkp-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .zkp-modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 90%;
          transition: transform 0.3s ease;
        }
        
        .zkp-modal h2 {
          color: #333;
          margin-bottom: 20px;
          text-align: center;
          font-size: 1.5rem;
        }
        
        .zkp-modal .description {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .zkp-modal .form-group {
          margin-bottom: 20px;
        }
        
        .zkp-modal label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #555;
        }
        
        .zkp-modal input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        .zkp-modal input:focus {
          border-color: #007bff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        }
        
        .zkp-modal .button-group {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .zkp-modal button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .zkp-modal .btn-primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
        }
        
        .zkp-modal .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        
        .zkp-modal .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .zkp-modal .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .zkp-modal .btn-secondary:hover {
          background: #5a6268;
        }
        
        .zkp-modal .loading {
          text-align: center;
          color: #007bff;
          margin: 10px 0;
        }
        
        .zkp-modal .error {
          color: #dc3545;
          background: #f8d7da;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
          border: 1px solid #f5c6cb;
        }
        
        .zkp-modal .success {
          color: #155724;
          background: #d4edda;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
          border: 1px solid #c3e6cb;
        }
      </style>
      
      <div class="zkp-modal-content">
        <h2>🔐 Zero Knowledge 身分認證</h2>
        
        <div class="description">
          <strong>🛡️ 隱私保護說明：</strong><br>
          • 我們使用 Zero Knowledge Proof 技術保護您的隱私<br>
          • 系統只會記錄您「通過認證」，不會儲存您的個人資訊<br>
          • 如有惡意行為，我們可以撤銷您的認證權限<br>
          • 完成認證後即可使用 MetaMask 登入檢舉系統
        </div>
        
        <div id="zkp-auth-form">
          <div class="form-group">
            <label for="zkp-phone">� 電話號碼（用於身分驗證）:</label>
            <input type="tel" id="zkp-phone" placeholder="請輸入您的電話號碼" required>
            <small style="color: #6c757d; font-size: 0.8rem;">
              * 電話號碼僅用於生成匿名憑證，不會被儲存或公開
            </small>
          </div>
          
          <div id="zkp-message" style="display: none;"></div>
          
          <div class="button-group">
            <button type="button" class="btn-secondary" onclick="zkpAuthUI.hideModal()">
              取消
            </button>
            <button type="button" class="btn-primary" id="zkp-auth-btn">
              🚀 開始認證
            </button>
          </div>
        </div>
        
        <div id="zkp-success" style="display: none;">
          <div class="success">
            ✅ ZKP 認證完成！您現在可以安全地使用 MetaMask 登入系統。
          </div>
          <div class="button-group">
            <button type="button" class="btn-primary" onclick="zkpAuthUI.proceedToWallet()">
              繼續登入 MetaMask
            </button>
          </div>
        </div>
      </div>
    `;

    // 綁定事件
    this.bindEvents();
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    const authBtn = this.modal.querySelector('#zkp-auth-btn');
    const phoneInput = this.modal.querySelector('#zkp-phone');
    
    authBtn.addEventListener('click', () => this.handleAuth());
    
    phoneInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAuth();
      }
    });
    
    // 點擊背景關閉
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });
  }

  /**
   * 處理認證
   */
  async handleAuth() {
    const phoneInput = this.modal.querySelector('#zkp-phone');
    const authBtn = this.modal.querySelector('#zkp-auth-btn');
    const messageDiv = this.modal.querySelector('#zkp-message');
    const formDiv = this.modal.querySelector('#zkp-auth-form');
    const successDiv = this.modal.querySelector('#zkp-success');
    
    const phone = phoneInput.value.trim();
    
    if (!phone) {
      this.showMessage('請輸入電話號碼', 'error');
      return;
    }
    
    if (!this.isValidPhone(phone)) {
      this.showMessage('請輸入有效的電話號碼', 'error');
      return;
    }

    try {
      authBtn.disabled = true;
      authBtn.textContent = '認證中...';
      this.showMessage('🔄 正在生成 Zero Knowledge Proof...', 'loading');

      // 初始化 ZKP
      this.showMessage('🔄 初始化 ZKP 系統...', 'loading');
      await window.zkpAuth.initialize();
      
      // 執行認證
      this.showMessage('🔄 正在向後端註冊身分...', 'loading');
      const success = await window.zkpAuth.authenticate(phone);
      
      if (success) {
        this.showMessage('🔄 檢查認證狀態...', 'loading');
        
        // 檢查是否被撤銷
        const revoked = await window.zkpAuth.checkRevocation();
        if (revoked) {
          throw new Error('您的認證已被撤銷，無法使用系統');
        }
        
        this.showMessage('✅ ZKP 認證完成！準備進入檢舉系統...', 'success');
        
        // 延遲一下讓用戶看到成功消息
        setTimeout(() => {
          formDiv.style.display = 'none';
          successDiv.style.display = 'block';
        }, 1000);
        
      } else {
        throw new Error('認證失敗，請稍後再試');
      }
      
    } catch (error) {
      console.error('ZKP 認證錯誤:', error);
      this.showMessage('❌ ' + error.message, 'error');
      authBtn.disabled = false;
      authBtn.textContent = '🚀 開始認證';
    }
  }

  /**
   * 顯示訊息
   */
  showMessage(message, type) {
    const messageDiv = this.modal.querySelector('#zkp-message');
    messageDiv.style.display = 'block';
    messageDiv.className = type;
    messageDiv.textContent = message;
  }

  /**
   * 驗證電話號碼格式
   */
  isValidPhone(phone) {
    // 簡易驗證：至少有8位數字，可能含有+、-、空格等分隔符
    return /^[+]?[\d\s-]{8,}$/.test(phone.replace(/\s+/g, ''));
  }

  /**
   * 繼續到錢包登入
   */
  proceedToWallet() {
    this.hideModal();
    
    // 直接調用 MetaMask 連接函數
    setTimeout(async () => {
      try {
        if (window.connectMetaMask) {
          await window.connectMetaMask();
        } else {
          // 如果函數不在全域範圍，則觸發按鈕點擊
          const connectBtn = document.getElementById('connectBtn');
          if (connectBtn) {
            connectBtn.click();
          }
        }
      } catch (error) {
        console.error('連接 MetaMask 失敗:', error);
        alert('連接 MetaMask 失敗: ' + error.message);
      }
    }, 300);
  }
}

// 全域 ZKP UI 實例
window.zkpAuthUI = new ZKPAuthUI();
