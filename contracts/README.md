# 智能合約部署指南

## 📋 概述

本資料夾包含詐騙舉報平台的智能合約檔案。**請注意：您必須自行部署智能合約才能使用平台功能。**

## 📁 檔案說明

- `ReportRegistry.sol` - 詐騙舉報智能合約主檔案

## 🚀 部署說明

### 前置需求

- **MetaMask 錢包** - 已安裝並設置完成
- **測試網 ETH** - 用於支付 Gas 費用
- **Remix IDE** - 線上 Solidity 開發環境

### 部署步驟

#### 1. 開啟 Remix IDE
前往 [Remix IDE](https://remix.ethereum.org/)

#### 2. 建立新檔案
- 在左側文件瀏覽器中，點擊「新建檔案」圖示
- 命名為 `ReportRegistry.sol`

#### 3. 複製合約程式碼
- 開啟本地的 `ReportRegistry.sol` 檔案
- 複製全部內容
- 貼上到 Remix IDE 的新檔案中

#### 4. 選擇編譯器版本
- 點擊左側的 「Solidity Compiler」 標籤
- 確保編譯器版本與合約中指定的版本相符（通常為 ^0.8.0）
- 點擊 「Compile ReportRegistry.sol」

#### 5. 連接 MetaMask
- 點擊左側的 「Deploy & Run Transactions」 標籤
- 在 Environment 下拉選單中選擇 「Injected Provider - MetaMask」
- MetaMask 會彈出連接請求，點擊「連接」

#### 6. 選擇測試網路
- 在 MetaMask 中切換到 **Sepolia 測試網路**
- 確保您的錢包中有足夠的測試 ETH

#### 7. 部署合約
- 在 「Contract」 下拉選單中選擇 `ReportRegistry`
- 點擊橘色的 「Deploy」 按鈕
- MetaMask 會彈出交易確認，點擊「確認」
- 等待交易確認完成

#### 8. 記錄合約地址
- 部署成功後，在 「Deployed Contracts」 區域會顯示您的合約
- **重要：複製並保存合約地址**，您稍後需要將此地址配置到後端和前端

## 🌐 推薦測試網路

### Sepolia Testnet（推薦）
- **網路名稱**: Sepolia
- **RPC URL**: `https://eth-sepolia.public.blastapi.io`
- **Chain ID**: 11155111
- **符號**: ETH
- **區塊瀏覽器**: https://sepolia.etherscan.io/

### Goerli Testnet
- **網路名稱**: Goerli
- **RPC URL**: `https://goerli.infura.io/v3/YOUR_PROJECT_ID`
- **Chain ID**: 5
- **符號**: ETH
- **區塊瀏覽器**: https://goerli.etherscan.io/

## 💰 獲取測試幣

### Sepolia Faucet
- [Sepolia Faucet](https://sepoliafaucet.com/) - 每日可領取少量測試 ETH
- [Alchemy Faucet](https://sepoliafaucet.com/) - 需要 Alchemy 帳號
- [Infura Faucet](https://www.infura.io/faucet) - 需要 Infura 帳號

### Goerli Faucet
- [Goerli Faucet](https://goerlifaucet.com/) - 每日可領取少量測試 ETH

## ⚙️ 部署後配置

### 1. 更新後端配置
在 `backend/.env` 文件中更新合約地址：
```env
CONTRACT_ADDRESS=您的合約地址
```

### 2. 更新前端配置
前端頁面通常會自動偵測，但您可能需要在前端介面中手動輸入合約地址。

## 🔧 合約功能說明

### 主要函數

- `submitReport(string memory cid)` - 提交檢舉記錄
- `getReport(uint256 index)` - 獲取特定檢舉記錄
- `getReportCount()` - 獲取檢舉總數

### 事件

- `ReportSubmitted(address indexed reporter, uint256 indexed reportId, string cid, uint256 timestamp)` - 檢舉提交事件

## 🔍 驗證部署

部署完成後，您可以在區塊鏈瀏覽器中驗證：

1. 前往 [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. 搜尋您的合約地址
3. 確認合約已成功部署
4. 查看合約的 ABI 和原始碼

## ⚠️ 注意事項

1. **僅用於測試**: 這些是測試網路，請勿在主網部署
2. **私鑰安全**: 切勿分享您的私鑰或助記詞
3. **Gas 費用**: 測試網路交易仍需支付 Gas 費用（測試 ETH）
4. **合約地址**: 每次部署都會產生新的合約地址
5. **數據保存**: 測試網路的數據可能會被重置

## 🆘 常見問題

### Q: 部署失敗怎麼辦？
A: 檢查以下項目：
- MetaMask 是否連接到正確的測試網路
- 錢包中是否有足夠的測試 ETH
- 合約程式碼是否編譯成功

### Q: 如何獲取更多測試 ETH？
A: 使用上述提到的測試幣水龍頭，通常每天可以領取一次

### Q: 合約地址在哪裡找？
A: 部署成功後，在 Remix IDE 的 「Deployed Contracts」 區域可以看到合約地址

### Q: 可以重複部署嗎？
A: 可以，但每次部署都會產生新的合約地址，需要更新配置

## 📞 技術支援

如果您在部署過程中遇到問題，請：

1. 查看 [Remix IDE 文檔](https://remix-ide.readthedocs.io/)
2. 檢查 [MetaMask 說明](https://metamask.io/support/)
3. 在專案 GitHub 上提交 Issue

---

🎯 **部署完成後，請記得將合約地址更新到後端的 `.env` 文件中！**
