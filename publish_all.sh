#!/bin/bash

# 多平台发布脚本
# 用法: ./publish_all.sh [文章文件名]

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 当前日期
TODAY=$(date +%Y-%m-%d)
LOG_FILE="logs/publish-$TODAY.log"
REPORT_DIR="temp/reports"

echo -e "${YELLOW}====== 博客多平台发布助手 ======${NC}"

# 检查命令行参数
if [ "$1" == "--log" ] || [ "$1" == "-l" ]; then
  # 查看日志
  if [ ! -d "logs" ]; then
    echo -e "${RED}错误: 日志目录不存在${NC}"
    exit 1
  fi
  
  if [ ! -f "$LOG_FILE" ]; then
    echo -e "${RED}错误: 今日的日志文件不存在${NC}"
    ls -lt logs/ | head -n 5
    exit 1
  fi
  
  echo -e "${BLUE}显示今日日志文件: $LOG_FILE${NC}"
  cat "$LOG_FILE"
  exit 0
elif [ "$1" == "--report" ] || [ "$1" == "-r" ]; then
  # 查看最新发布报告
  if [ ! -d "$REPORT_DIR" ]; then
    echo -e "${RED}错误: 报告目录不存在${NC}"
    exit 1
  fi
  
  LATEST_REPORT=$(ls -t "$REPORT_DIR" | head -n 1)
  
  if [ -z "$LATEST_REPORT" ]; then
    echo -e "${RED}错误: 未找到任何发布报告${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}显示最新发布报告: $REPORT_DIR/$LATEST_REPORT${NC}"
  cat "$REPORT_DIR/$LATEST_REPORT"
  exit 0
elif [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  # 显示帮助信息
  echo -e "${BLUE}使用方法:${NC}"
  echo -e "  ./publish_all.sh [文章文件名]    发布指定文章到多个平台"
  echo -e "  ./publish_all.sh --log          查看今日日志"
  echo -e "  ./publish_all.sh --report       查看最新发布报告"
  echo -e "  ./publish_all.sh --help         显示此帮助信息"
  exit 0
fi

# 检查是否输入了文章文件名
if [ -z "$1" ]; then
  echo -e "${YELLOW}请提供要发布的文章文件名，例如：${NC}"
  echo "./publish_all.sh my-new-post.md"
  
  # 列出最近的5篇文章供选择
  echo -e "\n${YELLOW}最近的文章:${NC}"
  ls -lt source/_posts | head -n 6 | tail -n 5 | awk '{print $9}'
  echo -e "\n${BLUE}其他选项:${NC}"
  echo -e "  ./publish_all.sh --log     查看今日日志"
  echo -e "  ./publish_all.sh --report  查看最新发布报告"
  exit 1
fi

POST_FILE=$1

# 检查文件是否存在
if [ ! -f "source/_posts/$POST_FILE" ]; then
  echo -e "${YELLOW}错误：文件 'source/_posts/$POST_FILE' 不存在${NC}"
  exit 1
fi

# 创建必要的目录
mkdir -p logs
mkdir -p temp/reports

# 1. 生成博客
echo -e "\n${GREEN}第1步：生成博客静态文件...${NC}"
hexo clean && hexo generate

# 2. 部署到GitHub Pages
echo -e "\n${GREEN}第2步：部署到GitHub Pages...${NC}"
hexo deploy

# 3. 多平台发布
echo -e "\n${GREEN}第3步：开始多平台发布...${NC}"
npm run publish -- "$POST_FILE"

# 4. 显示日志路径
echo -e "\n${GREEN}所有发布任务完成！${NC}"
echo -e "${BLUE}日志文件路径: ${LOG_FILE}${NC}"

# 5. 显示最新报告
LATEST_REPORT=$(ls -t "$REPORT_DIR" | head -n 1)
if [ ! -z "$LATEST_REPORT" ]; then
  echo -e "${BLUE}发布报告路径: $REPORT_DIR/$LATEST_REPORT${NC}"
  echo -e "\n${YELLOW}发布报告内容:${NC}"
  cat "$REPORT_DIR/$LATEST_REPORT"
fi 