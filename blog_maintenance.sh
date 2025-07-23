#!/bin/bash
# 博客维护脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志文件
LOG_FILE="maintenance.log"

# 记录日志
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo -e "$1"
}

# 显示菜单
show_menu() {
    clear
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}      博客维护工具 v1.0${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
    echo -e "${YELLOW}请选择操作:${NC}"
    echo -e "  ${BLUE}1${NC}) 🧹 清理缓存和临时文件"
    echo -e "  ${BLUE}2${NC}) 📊 生成博客统计报告"
    echo -e "  ${BLUE}3${NC}) 🔍 检查死链和图片"
    echo -e "  ${BLUE}4${NC}) 📦 备份博客数据"
    echo -e "  ${BLUE}5${NC}) 🔄 更新依赖包"
    echo -e "  ${BLUE}6${NC}) 🚀 一键部署"
    echo -e "  ${BLUE}7${NC}) 📈 性能分析"
    echo -e "  ${BLUE}8${NC}) 🔧 修复常见问题"
    echo -e "  ${BLUE}9${NC}) 📝 查看维护日志"
    echo -e "  ${BLUE}0${NC}) 🚪 退出"
    echo ""
    echo -e "${YELLOW}请输入选项 (0-9):${NC}"
}

# 清理缓存和临时文件
clean_cache() {
    log "${GREEN}🧹 开始清理缓存和临时文件...${NC}"
    
    # 清理Hexo缓存
    if [ -d "db.json" ]; then
        rm -f db.json
        log "${GREEN}✓ 清理 db.json${NC}"
    fi
    
    # 清理public目录
    if [ -d "public" ]; then
        rm -rf public/*
        log "${GREEN}✓ 清理 public 目录${NC}"
    fi
    
    # 清理.deploy_git目录
    if [ -d ".deploy_git" ]; then
        rm -rf .deploy_git
        log "${GREEN}✓ 清理 .deploy_git 目录${NC}"
    fi
    
    # 清理node_modules缓存
    if [ -d "node_modules" ]; then
        npm cache clean --force 2>/dev/null
        log "${GREEN}✓ 清理 npm 缓存${NC}"
    fi
    
    # 清理临时文件
    find . -name "*.tmp" -delete 2>/dev/null
    find . -name "*.log" -not -name "$LOG_FILE" -delete 2>/dev/null
    
    log "${GREEN}✅ 缓存清理完成！${NC}"
    read -p "按回车键继续..."
}

# 生成博客统计报告
generate_stats() {
    log "${GREEN}📊 生成博客统计报告...${NC}"
    
    local stats_file="blog_stats_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "博客统计报告 - $(date)"
        echo "================================"
        echo ""
        
        # 文章统计
        echo "📝 文章统计:"
        total_posts=$(find source/_posts -name "*.md" | wc -l)
        echo "  总文章数: $total_posts"
        
        # 分类统计
        echo ""
        echo "📁 分类统计:"
        for dir in source/_posts/*/; do
            if [ -d "$dir" ]; then
                category=$(basename "$dir")
                count=$(find "$dir" -name "*.md" | wc -l)
                echo "  $category: $count篇"
            fi
        done
        
        # 文件大小统计
        echo ""
        echo "💾 存储统计:"
        echo "  source目录大小: $(du -sh source 2>/dev/null | cut -f1)"
        echo "  themes目录大小: $(du -sh themes 2>/dev/null | cut -f1)"
        echo "  node_modules大小: $(du -sh node_modules 2>/dev/null | cut -f1)"
        
        # 最近更新的文章
        echo ""
        echo "🕒 最近更新的文章 (前10篇):"
        find source/_posts -name "*.md" -exec ls -lt {} + | head -10 | while read line; do
            filename=$(echo "$line" | awk '{print $NF}' | xargs basename)
            date=$(echo "$line" | awk '{print $6, $7, $8}')
            echo "  $filename ($date)"
        done
        
    } > "$stats_file"
    
    cat "$stats_file"
    log "${GREEN}✅ 统计报告已保存到: $stats_file${NC}"
    read -p "按回车键继续..."
}

# 检查死链和图片
check_links() {
    log "${GREEN}🔍 检查死链和图片...${NC}"
    
    local check_file="link_check_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "链接检查报告 - $(date)"
        echo "================================"
        echo ""
        
        # 检查markdown文件中的链接
        echo "🔗 检查文章中的链接:"
        find source/_posts -name "*.md" -exec grep -l "http" {} \; | while read file; do
            echo "检查文件: $file"
            grep -n "http[s]*://[^)]*" "$file" | head -5
            echo ""
        done
        
        # 检查图片引用
        echo "🖼️ 检查图片引用:"
        find source/_posts -name "*.md" -exec grep -l "!\[.*\]" {} \; | while read file; do
            echo "检查文件: $file"
            grep -n "!\[.*\]" "$file" | head -3
            echo ""
        done
        
    } > "$check_file"
    
    echo -e "${GREEN}✅ 链接检查完成，报告保存到: $check_file${NC}"
    read -p "按回车键继续..."
}

# 备份博客数据
backup_blog() {
    log "${GREEN}📦 开始备份博客数据...${NC}"
    
    local backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    local backup_file="${backup_dir}.tar.gz"
    
    # 创建备份目录
    mkdir -p "$backup_dir"
    
    # 备份重要文件和目录
    cp -r source "$backup_dir/"
    cp -r themes "$backup_dir/"
    cp _config*.yml "$backup_dir/" 2>/dev/null
    cp package*.json "$backup_dir/" 2>/dev/null
    cp *.sh "$backup_dir/" 2>/dev/null
    
    # 创建压缩包
    tar -czf "$backup_file" "$backup_dir"
    rm -rf "$backup_dir"
    
    log "${GREEN}✅ 备份完成: $backup_file${NC}"
    log "${CYAN}💡 备份大小: $(du -sh "$backup_file" | cut -f1)${NC}"
    read -p "按回车键继续..."
}

# 更新依赖包
update_dependencies() {
    log "${GREEN}🔄 更新依赖包...${NC}"
    
    # 检查package.json是否存在
    if [ ! -f "package.json" ]; then
        log "${RED}❌ 未找到 package.json 文件${NC}"
        read -p "按回车键继续..."
        return
    fi
    
    # 备份package-lock.json
    if [ -f "package-lock.json" ]; then
        cp package-lock.json package-lock.json.backup
        log "${YELLOW}📋 已备份 package-lock.json${NC}"
    fi
    
    # 更新依赖
    log "${BLUE}🔄 正在更新依赖包...${NC}"
    npm update
    
    # 检查安全漏洞
    log "${BLUE}🔒 检查安全漏洞...${NC}"
    npm audit
    
    log "${GREEN}✅ 依赖包更新完成${NC}"
    read -p "按回车键继续..."
}

# 一键部署
deploy_blog() {
    log "${GREEN}🚀 开始一键部署...${NC}"
    
    # 清理
    log "${BLUE}1/4 清理旧文件...${NC}"
    hexo clean
    
    # 生成
    log "${BLUE}2/4 生成静态文件...${NC}"
    hexo generate
    
    # 检查生成结果
    if [ ! -d "public" ] || [ -z "$(ls -A public)" ]; then
        log "${RED}❌ 静态文件生成失败${NC}"
        read -p "按回车键继续..."
        return
    fi
    
    # 部署
    log "${BLUE}3/4 部署到远程...${NC}"
    hexo deploy
    
    # 备份源码
    log "${BLUE}4/4 备份源码...${NC}"
    if [ -d ".git" ]; then
        git add -A
        git commit -m "Auto backup - $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin hexo
    fi
    
    log "${GREEN}✅ 部署完成！${NC}"
    log "${CYAN}🌐 访问: https://uwakeme.top${NC}"
    read -p "按回车键继续..."
}

# 性能分析
performance_analysis() {
    log "${GREEN}📈 开始性能分析...${NC}"
    
    local perf_file="performance_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "性能分析报告 - $(date)"
        echo "================================"
        echo ""
        
        # 文件数量统计
        echo "📁 文件统计:"
        echo "  Markdown文件: $(find source/_posts -name "*.md" | wc -l)"
        echo "  图片文件: $(find source -name "*.jpg" -o -name "*.png" -o -name "*.gif" | wc -l)"
        echo "  CSS文件: $(find source -name "*.css" | wc -l)"
        echo "  JS文件: $(find source -name "*.js" | wc -l)"
        echo ""
        
        # 大文件检查
        echo "📊 大文件检查 (>1MB):"
        find source -type f -size +1M -exec ls -lh {} \; | awk '{print $5, $9}'
        echo ""
        
        # 生成时间测试
        echo "⏱️ 生成时间测试:"
        start_time=$(date +%s)
        hexo generate --silent
        end_time=$(date +%s)
        generation_time=$((end_time - start_time))
        echo "  生成时间: ${generation_time}秒"
        
    } > "$perf_file"
    
    cat "$perf_file"
    log "${GREEN}✅ 性能分析完成，报告保存到: $perf_file${NC}"
    read -p "按回车键继续..."
}

# 修复常见问题
fix_common_issues() {
    log "${GREEN}🔧 修复常见问题...${NC}"
    
    # 修复权限问题
    log "${BLUE}🔐 修复文件权限...${NC}"
    find . -name "*.sh" -exec chmod +x {} \;
    
    # 重新安装依赖
    if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
        log "${BLUE}📦 重新安装依赖...${NC}"
        npm install
    fi
    
    # 检查配置文件
    log "${BLUE}⚙️ 检查配置文件...${NC}"
    if [ ! -f "_config.yml" ]; then
        log "${RED}❌ 缺少主配置文件 _config.yml${NC}"
    else
        log "${GREEN}✓ 主配置文件存在${NC}"
    fi
    
    # 检查主题配置
    if [ ! -f "_config.butterfly.yml" ]; then
        log "${YELLOW}⚠️ 缺少主题配置文件${NC}"
    else
        log "${GREEN}✓ 主题配置文件存在${NC}"
    fi
    
    log "${GREEN}✅ 常见问题修复完成${NC}"
    read -p "按回车键继续..."
}

# 查看维护日志
view_logs() {
    log "${GREEN}📝 查看维护日志...${NC}"
    
    if [ -f "$LOG_FILE" ]; then
        echo -e "${CYAN}最近20条日志:${NC}"
        tail -20 "$LOG_FILE"
    else
        echo -e "${YELLOW}暂无维护日志${NC}"
    fi
    
    read -p "按回车键继续..."
}

# 主循环
main() {
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1) clean_cache ;;
            2) generate_stats ;;
            3) check_links ;;
            4) backup_blog ;;
            5) update_dependencies ;;
            6) deploy_blog ;;
            7) performance_analysis ;;
            8) fix_common_issues ;;
            9) view_logs ;;
            0) 
                log "${GREEN}👋 感谢使用博客维护工具！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选择，请重新输入${NC}"
                sleep 1
                ;;
        esac
    done
}

# 运行主程序
main
