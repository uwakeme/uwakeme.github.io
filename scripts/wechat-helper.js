const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

// 微信公众号的Markdown处理器
hexo.extend.console.register('wechat', '准备微信公众号文章', {
  arguments: [
    { name: 'post', desc: '要处理的文章文件名 (相对于 _posts 目录)' }
  ]
}, function(args) {
  if (!args.post) {
    console.log('请指定要处理的文章文件名，例如: hexo wechat my-post.md');
    return;
  }
  
  const postPath = path.join(hexo.source_dir, '_posts', args.post);
  
  if (!fs.existsSync(postPath)) {
    console.log(`错误: 文件 '${postPath}' 不存在`);
    return;
  }
  
  // 读取文章内容
  const fileContent = fs.readFileSync(postPath, 'utf8');
  const { data, content } = matter(fileContent);
  
  // 为微信公众号格式化内容
  let wechatContent = formatForWechat(content, data);
  
  // 创建一个临时的微信版本文件
  const wechatDir = path.join(hexo.base_dir, 'temp', 'wechat');
  if (!fs.existsSync(wechatDir)) {
    fs.mkdirSync(wechatDir, { recursive: true });
  }
  
  const wechatFilePath = path.join(wechatDir, `${path.basename(args.post, '.md')}-wechat.md`);
  fs.writeFileSync(wechatFilePath, wechatContent);
  
  console.log(`微信公众号版本已创建: ${wechatFilePath}`);
  
  // 打开文件
  try {
    console.log('正在打开文件...');
    if (process.platform === 'win32') {
      execSync(`start ${wechatFilePath}`);
    } else if (process.platform === 'darwin') {
      execSync(`open ${wechatFilePath}`);
    } else {
      execSync(`xdg-open ${wechatFilePath}`);
    }
  } catch (error) {
    console.log('无法自动打开文件，请手动打开文件。');
  }
  
  console.log('提示: 将此内容复制到微信公众号编辑器中，并调整格式。');
});

// 为微信公众号格式化内容
function formatForWechat(content, frontMatter) {
  // 添加标题
  let wechatContent = `# ${frontMatter.title}\n\n`;
  
  // 处理内容
  let processedContent = content
    // 处理图片链接 (微信公众号不支持外部图片，需要手动上传)
    .replace(/!\[(.*?)\]\((.*?)\)/g, '【图片：$1】(需手动上传到公众号)')
    // 处理代码块，添加特定样式
    .replace(/```(\w+)([\s\S]*?)```/g, (match, lang, code) => {
      return `\`\`\`${lang}${code}\`\`\``;
    });
  
  wechatContent += processedContent;
  
  // 添加原文链接和标签
  const tags = frontMatter.tags ? frontMatter.tags.join('、') : '';
  
  wechatContent += '\n\n---\n\n';
  wechatContent += '> 本文首发于 [Uwakeme的博客](https://uwakeme.top)，转载请注明出处。\n\n';
  
  if (tags) {
    wechatContent += `**标签**: ${tags}\n\n`;
  }
  
  // 添加个人签名
  wechatContent += '感谢阅读，欢迎点赞、留言和分享！\n';
  
  return wechatContent;
} 