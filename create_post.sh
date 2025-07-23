#!/bin/bash
# 增强版文章创建脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 显示标题
echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}    Hexo 博客文章创建工具${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# 预定义分类和标签
declare -A CATEGORIES=(
    ["1"]="AI"
    ["2"]="Java"
    ["3"]="前端"
    ["4"]="后端"
    ["5"]="数据库"
    ["6"]="LINUX"
    ["7"]="学习"
    ["8"]="BUG解决"
    ["9"]="工具"
    ["10"]="其他"
)

declare -A COMMON_TAGS=(
    ["AI"]="AI,机器学习,深度学习,人工智能"
    ["Java"]="Java,后端,编程,开发"
    ["前端"]="前端,JavaScript,HTML,CSS,Vue,React"
    ["后端"]="后端,服务器,API,微服务"
    ["数据库"]="数据库,MySQL,Redis,MongoDB"
    ["LINUX"]="LINUX,服务器,运维,系统管理"
    ["学习"]="学习,笔记,教程,技术"
    ["BUG解决"]="BUG,调试,问题解决,故障排查"
    ["工具"]="工具,效率,开发工具"
    ["其他"]="其他,杂谈,经验分享"
)

# 获取文章标题
get_title() {
    echo -e "${YELLOW}请输入文章标题:${NC}"
    read -r title
    
    if [ -z "$title" ]; then
        echo -e "${RED}标题不能为空！${NC}"
        get_title
    fi
    
    echo -e "${GREEN}✓ 标题: $title${NC}"
}

# 选择分类
select_category() {
    echo -e "${YELLOW}请选择文章分类:${NC}"
    for key in $(echo ${!CATEGORIES[@]} | tr ' ' '\n' | sort -n); do
        echo -e "  ${BLUE}$key${NC}) ${CATEGORIES[$key]}"
    done
    echo -e "  ${BLUE}0${NC}) 自定义分类"
    
    read -r category_choice
    
    if [ "$category_choice" = "0" ]; then
        echo -e "${YELLOW}请输入自定义分类:${NC}"
        read -r custom_category
        category="$custom_category"
    elif [[ -n "${CATEGORIES[$category_choice]}" ]]; then
        category="${CATEGORIES[$category_choice]}"
    else
        echo -e "${RED}无效选择，请重新选择！${NC}"
        select_category
    fi
    
    echo -e "${GREEN}✓ 分类: $category${NC}"
}

# 选择标签
select_tags() {
    echo -e "${YELLOW}请选择标签 (多个标签用逗号分隔):${NC}"
    
    if [[ -n "${COMMON_TAGS[$category]}" ]]; then
        echo -e "${CYAN}推荐标签: ${COMMON_TAGS[$category]}${NC}"
        echo -e "${YELLOW}1) 使用推荐标签${NC}"
        echo -e "${YELLOW}2) 自定义标签${NC}"
        echo -e "${YELLOW}3) 推荐标签 + 自定义标签${NC}"
        
        read -r tag_choice
        
        case $tag_choice in
            1)
                tags="${COMMON_TAGS[$category]}"
                ;;
            2)
                echo -e "${YELLOW}请输入自定义标签 (用逗号分隔):${NC}"
                read -r custom_tags
                tags="$custom_tags"
                ;;
            3)
                echo -e "${YELLOW}请输入额外标签 (用逗号分隔):${NC}"
                read -r additional_tags
                tags="${COMMON_TAGS[$category]},$additional_tags"
                ;;
            *)
                tags="${COMMON_TAGS[$category]}"
                ;;
        esac
    else
        echo -e "${YELLOW}请输入标签 (用逗号分隔):${NC}"
        read -r tags
    fi
    
    echo -e "${GREEN}✓ 标签: $tags${NC}"
}

# 生成文件名
generate_filename() {
    # 移除特殊字符，替换空格为连字符
    filename=$(echo "$title" | sed 's/[【】\[\]()（）]//g' | sed 's/ /-/g' | sed 's/[^a-zA-Z0-9\u4e00-\u9fa5-]//g')
    
    # 如果分类不为空，添加分类前缀
    if [ -n "$category" ]; then
        filename="【${category}】${filename}"
    fi
    
    filename="${filename}.md"
    echo -e "${GREEN}✓ 文件名: $filename${NC}"
}

# 创建文章内容
create_post_content() {
    local current_date=$(date +"%Y-%m-%d")
    
    # 处理标签格式
    local formatted_tags=""
    if [ -n "$tags" ]; then
        IFS=',' read -ra TAG_ARRAY <<< "$tags"
        for tag in "${TAG_ARRAY[@]}"; do
            tag=$(echo "$tag" | xargs) # 去除前后空格
            formatted_tags="${formatted_tags}  - ${tag}\n"
        done
    fi
    
    # 生成文章模板
    cat > "source/_posts/${category}/${filename}" << EOF
---
title: ${title}
categories: ${category}
date: ${current_date}
tags:
$(echo -e "$formatted_tags")
---

# ${title}

## 前言

在这里写文章的前言和背景介绍...

## 一、主要内容

### （一）小节标题

正文内容...

\`\`\`bash
# 代码示例
echo "Hello World"
\`\`\`

### （二）小节标题

更多内容...

## 二、总结

总结文章的主要内容...

## 参考资料

- [参考链接1](https://example.com)
- [参考链接2](https://example.com)

EOF
}

# 创建分类目录
create_category_dir() {
    local category_dir="source/_posts/${category}"
    if [ ! -d "$category_dir" ]; then
        mkdir -p "$category_dir"
        echo -e "${GREEN}✓ 创建分类目录: $category_dir${NC}"
    fi
}

# 打开编辑器
open_editor() {
    local file_path="source/_posts/${category}/${filename}"
    
    echo -e "${YELLOW}是否要打开编辑器编辑文章? (y/n)${NC}"
    read -r open_choice
    
    if [ "$open_choice" = "y" ] || [ "$open_choice" = "Y" ]; then
        # 尝试不同的编辑器
        if command -v code &> /dev/null; then
            code "$file_path"
            echo -e "${GREEN}✓ 已在 VS Code 中打开文章${NC}"
        elif command -v vim &> /dev/null; then
            vim "$file_path"
        elif command -v nano &> /dev/null; then
            nano "$file_path"
        else
            echo -e "${YELLOW}未找到合适的编辑器，请手动打开文件编辑${NC}"
        fi
    fi
}

# 显示统计信息
show_statistics() {
    echo ""
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}        博客统计信息${NC}"
    echo -e "${PURPLE}================================${NC}"
    
    # 统计各分类文章数量
    for cat_dir in source/_posts/*/; do
        if [ -d "$cat_dir" ]; then
            cat_name=$(basename "$cat_dir")
            count=$(find "$cat_dir" -name "*.md" | wc -l)
            echo -e "${CYAN}$cat_name: ${count}篇文章${NC}"
        fi
    done
    
    # 总文章数
    total_posts=$(find source/_posts -name "*.md" | wc -l)
    echo -e "${GREEN}总计: ${total_posts}篇文章${NC}"
    echo ""
}

# 主函数
main() {
    get_title
    select_category
    select_tags
    generate_filename
    
    echo ""
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}        确认信息${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo -e "${CYAN}标题: $title${NC}"
    echo -e "${CYAN}分类: $category${NC}"
    echo -e "${CYAN}标签: $tags${NC}"
    echo -e "${CYAN}文件: source/_posts/${category}/${filename}${NC}"
    echo ""
    
    echo -e "${YELLOW}确认创建文章? (y/n)${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        create_category_dir
        create_post_content
        
        echo ""
        echo -e "${GREEN}✅ 文章创建成功！${NC}"
        echo -e "${GREEN}📝 文件路径: source/_posts/${category}/${filename}${NC}"
        
        open_editor
        show_statistics
        
        echo -e "${CYAN}💡 提示: 记得运行 'hexo generate' 生成静态文件${NC}"
    else
        echo -e "${YELLOW}❌ 已取消创建${NC}"
    fi
}

# 运行主函数
main
