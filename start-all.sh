#!/bin/bash

# 啟動詐騙檢舉平台的所有服務

echo "🚀 啟動詐騙檢舉平台..."
echo "================================"

# 檢查 Node.js 版本
echo "📋 檢查環境..."
node --version

# 切換到 backend 目錄
cd "$(dirname "$0")/backend"

echo "📦 安裝/檢查依賴..."
npm install

echo "🔧 啟動主要後端服務 (Port 3000)..."
npm run dev &
MAIN_PID=$!

sleep 3

echo "🔐 啟動 ZKP 認證服務 (Port 3001)..."
npm run zkp-dev &
ZKP_PID=$!

sleep 3

echo "✅ 服務啟動完成！"
echo "================================"
echo "📱 主要後端服務: http://localhost:3000"
echo "🔐 ZKP 認證服務: http://localhost:3001"
echo ""
echo "🌐 前端頁面:"
echo "   主要平台: file://$(pwd)/../frontend/improved-index.html"
echo "   ZKP 管理: file://$(pwd)/../frontend/zkp-admin.html"
echo "   測試報告: file://$(pwd)/../frontend/test-reports.html"
echo ""
echo "按 Ctrl+C 停止所有服務"

# 等待用戶中斷
trap 'echo "🛑 停止服務..."; kill $MAIN_PID $ZKP_PID; exit' INT

# 保持腳本運行
wait
