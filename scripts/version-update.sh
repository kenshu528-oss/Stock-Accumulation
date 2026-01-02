#!/bin/bash

# 版本號自動更新腳本
# Version Auto Update Script

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 顯示使用說明
show_usage() {
    echo -e "${BLUE}版本號自動更新腳本${NC}"
    echo ""
    echo "使用方法："
    echo "  $0 <新版本號> [更新類型]"
    echo ""
    echo "參數："
    echo "  新版本號    格式：1.2.2.0018"
    echo "  更新類型    可選：major|minor|patch|build (預設：build)"
    echo ""
    echo "範例："
    echo "  $0 1.2.2.0018"
    echo "  $0 1.2.3.0001 patch"
    echo "  $0 1.3.0.0001 minor"
}

# 檢查參數
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

NEW_VERSION=$1
UPDATE_TYPE=${2:-build}

# 驗證版本號格式
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}❌ 版本號格式錯誤！應為：主版本.次版本.修訂版本.建置號${NC}"
    echo "例如：1.2.2.0018"
    exit 1
fi

echo -e "${BLUE}🚀 開始更新版本號到 v${NEW_VERSION}${NC}"
echo ""

# 定義需要更新的檔案和對應的更新規則
declare -A FILES_TO_UPDATE=(
    ["src/script.js"]="multiple"
    ["src/version.js"]="version_file"
    ["index.html"]="html_title"
    ["README.md"]="readme"
    ["netlify-upload/index.html"]="html_title"
    ["netlify-upload/src/version.js"]="version_file"
)

# 備份原始檔案
backup_files() {
    echo -e "${YELLOW}📦 備份原始檔案...${NC}"
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    for file in "${!FILES_TO_UPDATE[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            echo "  ✓ 已備份 $file"
        fi
    done
    echo -e "${GREEN}✅ 備份完成：$BACKUP_DIR${NC}"
    echo ""
}

# 更新 src/script.js
update_script_js() {
    local file="src/script.js"
    echo -e "${YELLOW}📝 更新 $file...${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 檔案不存在：$file${NC}"
        return 1
    fi
    
    # 更新註釋中的版本號
    sed -i.bak "s/Stock Portfolio System - Clean Version [0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+/Stock Portfolio System - Clean Version $NEW_VERSION/g" "$file"
    
    # 更新 showVersionInfo 中的版本號
    sed -i.bak "s/版本: v[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+/版本: v$NEW_VERSION/g" "$file"
    
    # 更新 console.log 中的版本號
    sed -i.bak "s/Version [0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+/Version $NEW_VERSION/g" "$file"
    
    rm -f "$file.bak"
    echo "  ✓ 已更新 $file"
}

# 更新 version.js 檔案
update_version_js() {
    local file="$1"
    echo -e "${YELLOW}📝 更新 $file...${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 檔案不存在：$file${NC}"
        return 1
    fi
    
    # 更新 currentVersion
    sed -i.bak "s/this\.currentVersion = '[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+'/this.currentVersion = '$NEW_VERSION'/g" "$file"
    
    rm -f "$file.bak"
    echo "  ✓ 已更新 $file"
}

# 更新 HTML 檔案
update_html() {
    local file="$1"
    echo -e "${YELLOW}📝 更新 $file...${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 檔案不存在：$file${NC}"
        return 1
    fi
    
    # 更新頁面標題中的版本號
    sed -i.bak "s/v[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+/v$NEW_VERSION/g" "$file"
    
    rm -f "$file.bak"
    echo "  ✓ 已更新 $file"
}

# 更新 README.md
update_readme() {
    local file="README.md"
    echo -e "${YELLOW}📝 更新 $file...${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 檔案不存在：$file${NC}"
        return 1
    fi
    
    # 更新版本號
    sed -i.bak "s/- \*\*版本\*\*：v[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+/- **版本**：v$NEW_VERSION/g" "$file"
    
    # 更新日期
    TODAY=$(date +%Y-%m-%d)
    sed -i.bak "s/- \*\*更新日期\*\*：[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/- **更新日期**：$TODAY/g" "$file"
    
    rm -f "$file.bak"
    echo "  ✓ 已更新 $file"
}

# 執行更新
update_files() {
    echo -e "${YELLOW}🔄 開始更新檔案...${NC}"
    
    for file in "${!FILES_TO_UPDATE[@]}"; do
        update_type="${FILES_TO_UPDATE[$file]}"
        
        case $update_type in
            "multiple")
                update_script_js
                ;;
            "version_file")
                update_version_js "$file"
                ;;
            "html_title")
                update_html "$file"
                ;;
            "readme")
                update_readme
                ;;
        esac
    done
    
    echo ""
    echo -e "${GREEN}✅ 所有檔案更新完成！${NC}"
}

# 驗證更新結果
verify_updates() {
    echo -e "${YELLOW}🔍 驗證更新結果...${NC}"
    
    local errors=0
    
    for file in "${!FILES_TO_UPDATE[@]}"; do
        if [ -f "$file" ]; then
            local count=$(grep -c "$NEW_VERSION" "$file" 2>/dev/null || echo "0")
            if [ "$count" -gt 0 ]; then
                echo -e "  ✓ $file: 找到 $count 處版本號"
            else
                echo -e "  ${RED}❌ $file: 未找到新版本號${NC}"
                ((errors++))
            fi
        else
            echo -e "  ${YELLOW}⚠️  $file: 檔案不存在${NC}"
        fi
    done
    
    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}✅ 驗證通過！所有檔案都已正確更新${NC}"
    else
        echo -e "${RED}❌ 發現 $errors 個錯誤，請手動檢查${NC}"
        return 1
    fi
}

# 顯示下一步操作
show_next_steps() {
    echo ""
    echo -e "${BLUE}📋 下一步操作：${NC}"
    echo ""
    echo "1. 📝 更新版本歷史記錄"
    echo "   編輯 src/version.js 和 README.md 添加版本更新說明"
    echo ""
    echo "2. 🧪 執行測試"
    echo "   開啟 scripts/pre-release-check.html 進行完整測試"
    echo ""
    echo "3. 📤 提交變更"
    echo "   git add ."
    echo "   git commit -m \"chore: bump version to v$NEW_VERSION\""
    echo "   git tag v$NEW_VERSION"
    echo ""
    echo "4. 🚀 部署發布"
    echo "   推送到遠端倉庫並部署"
    echo ""
}

# 主執行流程
main() {
    backup_files
    update_files
    verify_updates
    
    if [ $? -eq 0 ]; then
        show_next_steps
        echo -e "${GREEN}🎉 版本更新完成！新版本：v$NEW_VERSION${NC}"
    else
        echo -e "${RED}💥 版本更新失敗！請檢查錯誤訊息${NC}"
        exit 1
    fi
}

# 執行主程序
main