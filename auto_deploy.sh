#!/bin/bash
# 自动化部署脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
BLOG_URL="https://uwakeme.top"
BACKUP_DIR="backups"
LOG_FILE="deploy.log"

# 记录日志
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 错误处理
handle_error() {
    log "${RED}❌ 错误: $1${NC}"
    echo -e "${RED}部署失败，请检查错误信息${NC}"
    exit 1
}

# 检查环境
check_environment() {
    log "${BLUE}🔍 检查部署环境...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        handle_error "Node.js 未安装"
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        handle_error "npm 未安装"
    fi
    
    # 检查hexo-cli
    if ! command -v hexo &> /dev/null; then
        log "${YELLOW}⚠️ hexo-cli 未全局安装，使用本地版本${NC}"
    fi
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        handle_error "Git 未安装"
    fi
    
    # 检查配置文件
    if [ ! -f "_config.yml" ]; then
        handle_error "主配置文件 _config.yml 不存在"
    fi
    
    log "${GREEN}✅ 环境检查通过${NC}"
}

# 创建备份
create_backup() {
    log "${BLUE}📦 创建部署前备份...${NC}"
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 备份文件名
    local backup_name="backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # 创建备份
    mkdir -p "$backup_path"
    
    # 备份重要文件
    cp -r source "$backup_path/" 2>/dev/null || true
    cp -r themes "$backup_path/" 2>/dev/null || true
    cp _config*.yml "$backup_path/" 2>/dev/null || true
    cp package*.json "$backup_path/" 2>/dev/null || true
    
    # 压缩备份
    cd "$BACKUP_DIR"
    tar -czf "${backup_name}.tar.gz" "$backup_name"
    rm -rf "$backup_name"
    cd ..
    
    # 保留最近5个备份
    cd "$BACKUP_DIR"
    ls -t *.tar.gz | tail -n +6 | xargs -r rm --
    cd ..
    
    log "${GREEN}✅ 备份创建完成: $BACKUP_DIR/${backup_name}.tar.gz${NC}"
}

# 更新依赖
update_dependencies() {
    log "${BLUE}📦 检查并更新依赖...${NC}"
    
    # 检查package.json是否有变化
    if [ -f "package-lock.json" ]; then
        local package_hash=$(md5sum package.json | cut -d' ' -f1)
        local lock_hash=$(md5sum package-lock.json | cut -d' ' -f1)
        
        # 如果package.json更新了，重新安装依赖
        npm ci --silent || npm install --silent
    else
        npm install --silent
    fi
    
    log "${GREEN}✅ 依赖更新完成${NC}"
}

# 清理和生成
clean_and_generate() {
    log "${BLUE}🧹 清理旧文件...${NC}"
    
    # 清理Hexo缓存
    rm -f db.json
    rm -rf public/*
    rm -rf .deploy_git
    
    # 使用生产环境配置生成
    log "${BLUE}🔨 生成静态文件（生产环境）...${NC}"
    
    # 设置环境变量
    export NODE_ENV=production
    
    # 生成静态文件
    if [ -f "_config.production.yml" ]; then
        hexo generate --config _config.yml,_config.production.yml
    else
        hexo generate
    fi
    
    # 检查生成结果
    if [ ! -d "public" ] || [ -z "$(ls -A public)" ]; then
        handle_error "静态文件生成失败"
    fi
    
    # 统计生成的文件
    local file_count=$(find public -type f | wc -l)
    local total_size=$(du -sh public | cut -f1)
    
    log "${GREEN}✅ 静态文件生成完成${NC}"
    log "${CYAN}📊 生成文件: ${file_count}个，总大小: ${total_size}${NC}"
}

# 优化静态文件
optimize_files() {
    log "${BLUE}⚡ 优化静态文件...${NC}"
    
    # 压缩HTML文件（如果安装了html-minifier）
    if command -v html-minifier &> /dev/null; then
        find public -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments --minify-css --minify-js {} -o {} \;
        log "${GREEN}✓ HTML文件压缩完成${NC}"
    fi
    
    # 压缩CSS文件（如果安装了cleancss）
    if command -v cleancss &> /dev/null; then
        find public -name "*.css" -exec cleancss {} -o {} \;
        log "${GREEN}✓ CSS文件压缩完成${NC}"
    fi
    
    # 压缩JS文件（如果安装了uglifyjs）
    if command -v uglifyjs &> /dev/null; then
        find public -name "*.js" -not -name "*.min.js" -exec uglifyjs {} -o {} \;
        log "${GREEN}✓ JS文件压缩完成${NC}"
    fi
    
    log "${GREEN}✅ 文件优化完成${NC}"
}

# 部署到远程
deploy_to_remote() {
    log "${BLUE}🚀 部署到远程服务器...${NC}"
    
    # 部署到GitHub Pages
    hexo deploy
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ 远程部署成功${NC}"
    else
        handle_error "远程部署失败"
    fi
}

# 备份源码到Git
backup_source() {
    log "${BLUE}💾 备份源码到Git仓库...${NC}"
    
    # 检查是否是Git仓库
    if [ ! -d ".git" ]; then
        log "${YELLOW}⚠️ 不是Git仓库，跳过源码备份${NC}"
        return
    fi
    
    # 添加所有文件
    git add -A
    
    # 检查是否有变化
    if git diff --staged --quiet; then
        log "${YELLOW}📝 没有文件变化，跳过提交${NC}"
        return
    fi
    
    # 提交变化
    local commit_msg="Auto deploy - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$commit_msg"
    
    # 推送到远程
    git push origin hexo
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ 源码备份成功${NC}"
    else
        log "${YELLOW}⚠️ 源码备份失败，但不影响部署${NC}"
    fi
}

# 验证部署
verify_deployment() {
    log "${BLUE}🔍 验证部署结果...${NC}"
    
    # 等待一段时间让CDN更新
    sleep 10
    
    # 检查网站是否可访问
    if command -v curl &> /dev/null; then
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BLOG_URL")
        
        if [ "$status_code" = "200" ]; then
            log "${GREEN}✅ 网站访问正常 (HTTP $status_code)${NC}"
        else
            log "${YELLOW}⚠️ 网站返回状态码: $status_code${NC}"
        fi
    else
        log "${YELLOW}⚠️ curl未安装，跳过网站验证${NC}"
    fi
}

# 发送通知
send_notification() {
    log "${BLUE}📢 发送部署通知...${NC}"
    
    local deploy_time=$(date '+%Y-%m-%d %H:%M:%S')
    local commit_hash=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    # 这里可以集成各种通知方式
    # 例如：企业微信、钉钉、邮件等
    
    log "${GREEN}✅ 部署完成通知${NC}"
    log "${CYAN}🕒 部署时间: $deploy_time${NC}"
    log "${CYAN}📝 提交哈希: $commit_hash${NC}"
    log "${CYAN}🌐 访问地址: $BLOG_URL${NC}"
}

# 清理临时文件
cleanup() {
    log "${BLUE}🧹 清理临时文件...${NC}"
    
    # 清理临时文件
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    
    # 清理旧的日志文件（保留最近10个）
    ls -t deploy*.log 2>/dev/null | tail -n +11 | xargs -r rm --
    
    log "${GREEN}✅ 清理完成${NC}"
}

# 显示部署摘要
show_summary() {
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}        部署摘要${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo -e "${GREEN}✅ 部署成功完成${NC}"
    echo -e "${CYAN}⏱️  总耗时: ${duration}秒${NC}"
    echo -e "${CYAN}🌐 网站地址: $BLOG_URL${NC}"
    echo -e "${CYAN}📝 日志文件: $LOG_FILE${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

# 主函数
main() {
    local start_time=$(date +%s)
    
    echo -e "${CYAN}🚀 开始自动化部署流程...${NC}"
    echo ""
    
    # 执行部署步骤
    check_environment
    create_backup
    update_dependencies
    clean_and_generate
    optimize_files
    deploy_to_remote
    backup_source
    verify_deployment
    send_notification
    cleanup
    
    # 显示摘要
    show_summary
    
    log "${GREEN}🎉 自动化部署流程完成！${NC}"
}

# 捕获中断信号
trap 'echo -e "\n${RED}部署被中断${NC}"; exit 1' INT TERM

# 运行主函数
main "$@"
