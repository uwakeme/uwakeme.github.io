---
title: 404 - 页面未找到
date: 2023-01-01
layout: 404
permalink: /404.html
---

<div style="text-align:center; padding: 30px 0;">
    <div style="font-size: 62px; color: #49b1f5; font-weight: 700; margin-bottom: 20px;">404</div>
    <div style="font-size: 24px; margin-bottom: 20px;">抱歉，您访问的页面不存在或已被删除</div>
    <div style="font-size: 16px; color: #666; margin-bottom: 30px;">
        您可以尝试以下方法：
        <ul style="list-style: none; padding: 0; margin-top: 15px;">
            <li>检查网址是否输入正确</li>
            <li>返回上一页</li>
            <li>前往首页寻找您需要的内容</li>
        </ul>
    </div>
    <div>
        <a href="/" style="display: inline-block; padding: 10px 25px; background-color: #49b1f5; color: #fff; border-radius: 5px; text-decoration: none; font-weight: bold;">返回首页</a>
    </div>
</div>

<script>
// 添加5秒后自动跳转到首页
let seconds = 5;
setInterval(() => {
    seconds--;
    if (seconds <= 0) {
        window.location.href = '/';
    }
}, 1000);
</script> 