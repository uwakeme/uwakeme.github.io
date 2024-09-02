name=''
echo "请输入文件名"
read name
hexo new draft $name
echo "成功创建草稿：$name"
