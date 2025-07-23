#!/bin/bash
# Hexo博客部署脚本 - 增强版本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Hexo博客部署工具${NC}"
echo -e "${CYAN}========================${NC}"
echo ""
echo -e "${YELLOW}请选择部署方式:${NC}"
echo -e "  ${BLUE}1${NC}) 🚀 快速部署 (推荐)"
echo -e "  ${BLUE}2${NC}) 🔧 自动化部署 (完整流程)"
echo -e "  ${BLUE}3${NC}) 🧹 仅清理缓存"
echo -e "  ${BLUE}4${NC}) 🔨 仅生成静态文件"
echo -e "  ${BLUE}5${NC}) 📤 仅部署到远程"
echo ""
echo -e "${YELLOW}请输入选项 (1-5):${NC}"
read -r choice

case $choice in
    1)
        echo -e "${GREEN}🚀 开始快速部署...${NC}"
        echo ""

        # 清理旧数据
        echo -e "${BLUE}🧹 清理旧数据...${NC}"
        hexo clean
        echo -e "${GREEN}✅ 清理完成${NC}"
        echo ""

        # 生成静态文件
        echo -e "${BLUE}🔨 生成静态文件...${NC}"
        if [ -f "_config.production.yml" ]; then
            hexo generate --config _config.yml,_config.production.yml
        else
            hexo generate
        fi
        echo -e "${GREEN}✅ 静态文件生成完成${NC}"
        echo ""

        # 部署到远程
        echo -e "${BLUE}🚀 部署到远程服务器...${NC}"
        hexo deploy
        echo -e "${GREEN}✅ 部署完成${NC}"
        echo ""

        echo -e "${GREEN}🎉 快速部署完成！${NC}"
        echo -e "${CYAN}📊 访问 https://uwakeme.top 查看效果${NC}"
        ;;
    2)
        echo -e "${GREEN}🔧 启动自动化部署流程...${NC}"
        if [ -f "auto_deploy.sh" ]; then
            chmod +x auto_deploy.sh
            ./auto_deploy.sh
        else
            echo -e "${RED}❌ 自动化部署脚本不存在${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${BLUE}🧹 清理缓存...${NC}"
        hexo clean
        rm -f db.json
        echo -e "${GREEN}✅ 缓存清理完成${NC}"
        ;;
    4)
        echo -e "${BLUE}🔨 生成静态文件...${NC}"
        if [ -f "_config.production.yml" ]; then
            hexo generate --config _config.yml,_config.production.yml
        else
            hexo generate
        fi
        echo -e "${GREEN}✅ 静态文件生成完成${NC}"
        ;;
    5)
        echo -e "${BLUE}📤 部署到远程...${NC}"
        hexo deploy
        echo -e "${GREEN}✅ 部署完成${NC}"
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

echo -e "${CYAN}========================${NC}"