name=''
echo "请输入文件名"
read name
hexo new $name
echo "成功创建笔记：$name"
