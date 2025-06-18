#!/bin/bash

# 同步前後端的合約地址設置

echo "🔧 同步前後端 ABI 和合約地址設置..."
echo "================================"

# 獲取後端 .env 中的合約地址
BACKEND_DIR="$(dirname "$0")/backend"
FRONTEND_DIR="$(dirname "$0")/frontend"

if [ -f "$BACKEND_DIR/.env" ]; then
    CONTRACT_ADDRESS=$(grep "^CONTRACT_ADDRESS=" "$BACKEND_DIR/.env" | cut -d '=' -f2)
    echo "📋 後端合約地址: $CONTRACT_ADDRESS"
    
    # 更新前端的預設合約地址
    if [ -f "$FRONTEND_DIR/contract-abi.js" ]; then
        sed -i.bak "s/const DEFAULT_CONTRACT_ADDRESS = \".*\"/const DEFAULT_CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/" "$FRONTEND_DIR/contract-abi.js"
        echo "✅ 前端合約地址已同步"
    else
        echo "❌ 找不到前端 ABI 檔案"
    fi
else
    echo "❌ 找不到後端 .env 檔案"
fi

echo ""
echo "📊 當前配置:"
echo "   後端 .env 合約地址: $CONTRACT_ADDRESS"
echo "   前端預設合約地址: $(grep 'DEFAULT_CONTRACT_ADDRESS' "$FRONTEND_DIR/contract-abi.js" | cut -d '"' -f2)"
echo ""
echo "🎯 確認事項："
echo "   ✓ 智能合約已部署到 Sepolia 測試網"
echo "   ✓ 合約地址已更新到 .env 檔案"
echo "   ✓ MetaMask 已連接到 Sepolia 測試網"
echo "   ✓ 錢包有足夠的 Sepolia ETH"
