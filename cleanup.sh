#!/bin/bash

# 清理專案中不需要的檔案

echo "🧹 清理專案檔案..."
echo "================================"

# 移除日誌檔案
echo "📋 移除日誌檔案..."
find . -name "*.log" -type f -delete
echo "✅ 日誌檔案已清理"

# 移除備份檔案
echo "📋 移除備份檔案..."
find . -name "*.bak" -type f -delete
find . -name "*.backup" -type f -delete
echo "✅ 備份檔案已清理"

# 移除臨時檔案
echo "📋 移除臨時檔案..."
find . -name "*.tmp" -type f -delete
find . -name ".DS_Store" -type f -delete
echo "✅ 臨時檔案已清理"

# 移除測試檔案 (保留 test-reports.html，因為它是實際功能)
echo "📋 移除測試檔案..."
find . -name "test-*.js" -type f -delete
find . -name "test-*.cjs" -type f -delete
find . -name "debug-*.html" -type f -delete
echo "✅ 測試檔案已清理"

echo ""
echo "✨ 專案清理完成！"
echo "🚫 以下類型的檔案已被移除："
echo "   - *.log (日誌檔案)"
echo "   - *.bak (備份檔案)"
echo "   - *.tmp (臨時檔案)"
echo "   - .DS_Store (macOS 系統檔案)"
echo "   - test-*.js, test-*.cjs (測試腳本)"
echo "   - debug-*.html (調試頁面)"
echo ""
echo "✅ 以下檔案已保留："
echo "   - frontend/test-reports.html (實際功能頁面)"
echo "   - 所有核心程式碼檔案"
echo "   - 文檔檔案"
