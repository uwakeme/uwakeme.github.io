---
title: 【学习】doT.js模板引擎详解与实践
date: 2025-07-14
categories: 学习
tags:
  - JavaScript
  - 前端
  - 模板引擎
  - doT.js
---

# doT.js模板引擎详解与实践

## 一、前言

在前端开发中，模板引擎是一种将数据与HTML模板结合生成最终页面的工具。随着前端应用复杂度的提高，高效的模板引擎变得越来越重要。doT.js作为一款轻量级、高性能的JavaScript模板引擎，因其简洁的语法和卓越的性能表现，受到了众多开发者的青睐。本文将详细介绍doT.js的使用方法、特性以及实践技巧。

## 二、doT.js简介

### （一）什么是doT.js

doT.js是一个快速、小巧的JavaScript模板引擎，由Laura Doktorova开发，遵循MIT许可证开源。它的设计理念是"最快、最小的JavaScript模板引擎，适用于Node.js和浏览器"。doT.js的核心特点是使用了预编译技术，将模板编译成JavaScript函数，从而实现了极高的渲染性能。

### （二）doT.js的优势

1. **性能卓越**：在各种JavaScript模板引擎的性能测试中，doT.js通常名列前茅，渲染速度远超Handlebars、Mustache等传统模板引擎。

2. **体积小巧**：压缩后仅约2KB，非常适合对资源要求严格的项目。

3. **语法简洁**：采用简单易学的标记语法，学习成本低。

4. **功能丰富**：支持插值、条件语句、循环、自定义函数等多种功能。

5. **无依赖**：不依赖任何第三方库，可独立使用。

### （三）与其他模板引擎的对比

| 特性 | doT.js | Handlebars | EJS | Mustache |
|------|--------|------------|-----|----------|
| 文件大小 | ~2KB | ~65KB | ~10KB | ~20KB |
| 性能 | 极高 | 中等 | 高 | 中等 |
| 语法复杂度 | 简单 | 中等 | 中等 | 简单 |
| 逻辑表达能力 | 强 | 中等 | 强 | 弱 |
| 预编译支持 | 是 | 是 | 是 | 部分支持 |
| 学习曲线 | 平缓 | 中等 | 平缓 | 平缓 |

## 三、安装与基本使用

### （一）安装doT.js

1. **通过NPM安装（Node.js环境）**

```shell
npm install dot --save
```

2. **通过CDN引入（浏览器环境）**

```html
<script src="https://cdn.jsdelivr.net/npm/dot/doT.min.js"></script>
```

3. **直接下载引入**

```html
<script src="path/to/doT.min.js"></script>
```

### （二）基本语法

doT.js使用以下几种基本标记：

1. **插值（Interpolation）**：`{{= }}` - 输出变量值，HTML转义
2. **不转义插值**：`{{! }}` - 输出变量值，不进行HTML转义
3. **条件语句**：`{{? }}` - 用于条件判断
4. **循环语句**：`{{~ }}` - 用于迭代数组或对象
5. **定义变量**：`{{# }}` - 在模板中定义JavaScript变量或函数
6. **编码输出**：`{{= }}` - 编码HTML特殊字符后输出
7. **注释**：`{{## }}` - 模板中的注释，不会输出

### （三）基本使用示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>doT.js基本示例</title>
    <script src="https://cdn.jsdelivr.net/npm/dot/doT.min.js"></script>
</head>
<body>
    <div id="result"></div>
    
    <script id="template" type="text/x-dot-template">
        <h1>{{=it.title}}</h1>
        <p>{{=it.content}}</p>
        {{? it.showFooter }}
            <footer>{{=it.footer}}</footer>
        {{?}}
    </script>
    
    <script>
        // 准备数据
        const data = {
            title: "doT.js示例",
            content: "这是一个简单的doT.js模板示例",
            showFooter: true,
            footer: "页脚信息"
        };
        
        // 获取模板
        const templateText = document.getElementById("template").text;
        
        // 编译模板
        const templateFn = doT.template(templateText);
        
        // 渲染模板
        const result = templateFn(data);
        
        // 输出结果
        document.getElementById("result").innerHTML = result;
    </script>
</body>
</html>
```

## 四、doT.js高级特性

### （一）条件语句

doT.js支持复杂的条件判断，包括if-else结构：

```javascript
{{? it.user.isAdmin }}
    <div class="admin-panel">管理员面板</div>
{{?? it.user.isEditor }}
    <div class="editor-panel">编辑者面板</div>
{{??}}
    <div class="user-panel">普通用户面板</div>
{{?}}
```

### （二）循环语句

doT.js提供了强大的循环功能，可以遍历数组或对象：

```javascript
<ul>
{{~it.items :item:index}}
    <li>{{=index+1}}. {{=item.name}} - {{=item.price}}元</li>
{{~}}
</ul>
```

对象遍历：

```javascript
<dl>
{{~it.user :value:key}}
    <dt>{{=key}}:</dt>
    <dd>{{=value}}</dd>
{{~}}
</dl>
```

### （三）自定义函数

可以在模板中定义和使用JavaScript函数：

```javascript
{{##
    function formatDate(date) {
        return new Date(date).toLocaleDateString();
    }
#}}

<p>发布日期：{{=formatDate(it.publishDate)}}</p>
```

### （四）子模板和模板复用

doT.js支持模板的嵌套和复用：

```javascript
{{##def.header:
    <header>
        <h1>{{=it.title}}</h1>
        <nav>{{=it.navigation}}</nav>
    </header>
#}}

{{##def.footer:
    <footer>
        <p>{{=it.copyright}}</p>
    </footer>
#}}

<div class="container">
    {{#def.header}}
    <main>
        {{=it.content}}
    </main>
    {{#def.footer}}
</div>
```

### （五）自定义分隔符

如果默认的`{{`和`}}`与其他框架冲突，可以自定义分隔符：

```javascript
doT.templateSettings = {
    evaluate:    /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    encode:      /\{\{!([\s\S]+?)\}\}/g,
    use:         /\{\{#([\s\S]+?)\}\}/g,
    define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
    conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
    iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
    varname: 'it',
    strip: true,
    append: true,
    selfcontained: false
};
```

## 五、实际应用场景

### （一）动态列表渲染

```javascript
// 数据
const products = [
    { id: 1, name: "笔记本电脑", price: 5999, inStock: true },
    { id: 2, name: "智能手机", price: 3999, inStock: false },
    { id: 3, name: "无线耳机", price: 999, inStock: true }
];

// 模板
const template = `
<table class="product-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>产品名称</th>
            <th>价格</th>
            <th>库存状态</th>
        </tr>
    </thead>
    <tbody>
        {{~it:product:index}}
            <tr class="{{? index % 2 === 0}}even{{??}}odd{{?}}">
                <td>{{=product.id}}</td>
                <td>{{=product.name}}</td>
                <td>¥{{=product.price.toFixed(2)}}</td>
                <td>
                    {{? product.inStock}}
                        <span class="in-stock">有货</span>
                    {{??}}
                        <span class="out-of-stock">缺货</span>
                    {{?}}
                </td>
            </tr>
        {{~}}
    </tbody>
</table>
`;

// 编译和渲染
const renderFn = doT.template(template);
document.getElementById("product-list").innerHTML = renderFn(products);
```

### （二）表单生成器

```javascript
// 表单配置数据
const formConfig = {
    title: "用户注册",
    fields: [
        { type: "text", name: "username", label: "用户名", required: true },
        { type: "email", name: "email", label: "电子邮件", required: true },
        { type: "password", name: "password", label: "密码", required: true },
        { type: "select", name: "role", label: "角色", options: [
            { value: "user", text: "普通用户" },
            { value: "admin", text: "管理员" }
        ]}
    ],
    submitText: "注册"
};

// 表单模板
const formTemplate = `
<form class="dynamic-form">
    <h2>{{=it.title}}</h2>
    
    {{~it.fields:field}}
        <div class="form-group">
            <label for="{{=field.name}}">{{=field.label}}{{? field.required}} <span class="required">*</span>{{?}}</label>
            
            {{? field.type === 'select'}}
                <select id="{{=field.name}}" name="{{=field.name}}" {{? field.required}}required{{?}}>
                    <option value="">请选择</option>
                    {{~field.options:option}}
                        <option value="{{=option.value}}">{{=option.text}}</option>
                    {{~}}
                </select>
            {{??}}
                <input type="{{=field.type}}" id="{{=field.name}}" name="{{=field.name}}" {{? field.required}}required{{?}}>
            {{?}}
        </div>
    {{~}}
    
    <button type="submit">{{=it.submitText}}</button>
</form>
`;

// 编译和渲染
const renderForm = doT.template(formTemplate);
document.getElementById("form-container").innerHTML = renderForm(formConfig);
```

### （三）客户端与服务端共用模板

doT.js可以在Node.js和浏览器环境中使用相同的模板，实现前后端模板共享：

**服务端 (Node.js)**:

```javascript
const doT = require('dot');
const fs = require('fs');

// 读取模板文件
const templateStr = fs.readFileSync('./templates/article.dot', 'utf-8');

// 编译模板
const template = doT.template(templateStr);

// 数据
const articleData = {
    title: "Node.js与doT.js结合使用",
    content: "这是文章内容...",
    author: "张三",
    publishDate: "2025-07-10"
};

// 渲染模板
const html = template(articleData);

// 输出或发送给客户端
console.log(html);
```

**客户端 (浏览器)**:

```javascript
// 假设模板已通过AJAX加载或内联在页面中
const templateStr = document.getElementById('article-template').innerHTML;

// 编译模板
const template = doT.template(templateStr);

// 数据（可能通过API获取）
const articleData = {
    title: "浏览器中使用doT.js",
    content: "这是文章内容...",
    author: "李四",
    publishDate: "2025-07-14"
};

// 渲染模板
const html = template(articleData);

// 插入到DOM
document.getElementById('article-container').innerHTML = html;
```

## 六、性能优化技巧

### （一）预编译模板

在生产环境中，可以预先编译模板以提高性能：

```javascript
// 开发时
const template = doT.template('<h1>{{=it.title}}</h1>');

// 生产环境（预编译）
const template = function(it) {
    return '<h1>' + it.title + '</h1>';
};
```

可以使用构建工具（如Webpack）结合插件自动完成这一过程。

### （二）缓存模板函数

避免重复编译相同的模板：

```javascript
// 缓存模板函数
const templateCache = {};

function getTemplate(id) {
    if (!templateCache[id]) {
        const templateStr = document.getElementById(id).innerHTML;
        templateCache[id] = doT.template(templateStr);
    }
    return templateCache[id];
}

// 使用
const userTemplate = getTemplate('user-template');
const html = userTemplate(userData);
```

### （三）减少模板中的逻辑

尽量将复杂的逻辑处理放在JavaScript代码中，而不是模板中：

```javascript
// 不推荐
const template = `
    {{~it.items:item}}
        {{? item.price > 1000 && item.discount > 0.1}}
            <div>{{=item.name}} (优惠价: {{=(item.price * (1 - item.discount)).toFixed(2)}})</div>
        {{??}}
            <div>{{=item.name}} (原价: {{=item.price.toFixed(2)}})</div>
        {{?}}
    {{~}}
`;

// 推荐：预处理数据
const processedItems = items.map(item => {
    return {
        name: item.name,
        price: item.price.toFixed(2),
        isDiscounted: item.price > 1000 && item.discount > 0.1,
        discountPrice: (item.price * (1 - item.discount)).toFixed(2)
    };
});

const template = `
    {{~it:item}}
        <div>
            {{=item.name}} 
            {{? item.isDiscounted}}
                (优惠价: {{=item.discountPrice}})
            {{??}}
                (原价: {{=item.price}})
            {{?}}
        </div>
    {{~}}
`;

const html = doT.template(template)(processedItems);
```

## 七、常见问题与解决方案

### （一）HTML转义问题

默认情况下，`{{=}}`会对HTML进行转义，如果需要输出HTML，应使用`{{!}}`：

```javascript
const data = {
    title: "标题",
    content: "<p>这是一段<strong>HTML</strong>内容</p>"
};

// 模板
const template = `
    <h1>{{=it.title}}</h1>
    <div>{{!it.content}}</div>  <!-- 不转义HTML -->
`;
```

### （二）undefined或null值处理

处理可能为undefined或null的值：

```javascript
// 使用条件判断
const template = `
    {{? it.user && it.user.name}}
        <h1>欢迎, {{=it.user.name}}</h1>
    {{??}}
        <h1>欢迎, 访客</h1>
    {{?}}
`;

// 或使用默认值
const template = `
    <h1>欢迎, {{=it.user && it.user.name || '访客'}}</h1>
`;
```

### （三）模板加载问题

在大型应用中管理多个模板：

```javascript
// 使用AJAX加载模板
function loadTemplate(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(doT.template(xhr.responseText));
                } else {
                    reject(new Error(`Failed to load template: ${url}`));
                }
            }
        };
        xhr.send();
    });
}

// 使用
loadTemplate('/templates/user-profile.dot')
    .then(template => {
        const html = template(userData);
        document.getElementById('user-container').innerHTML = html;
    })
    .catch(error => console.error(error));
```

## 八、doT.js与现代前端框架的结合

### （一）与React结合

虽然React有自己的JSX语法，但在某些场景下，结合doT.js可能会有优势：

```javascript
import React, { useEffect, useState } from 'react';
import doT from 'dot';

const DotTemplate = ({ template, data }) => {
    const [html, setHtml] = useState('');
    
    useEffect(() => {
        try {
            const templateFn = doT.template(template);
            setHtml(templateFn(data));
        } catch (error) {
            console.error('Template rendering error:', error);
        }
    }, [template, data]);
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// 使用
function App() {
    const template = '<h1>{{=it.title}}</h1><p>{{=it.content}}</p>';
    const data = { title: 'Hello', content: 'World' };
    
    return <DotTemplate template={template} data={data} />;
}
```

### （二）与Vue结合

Vue也可以与doT.js结合使用：

```javascript
Vue.component('dot-template', {
    props: ['template', 'data'],
    data() {
        return {
            renderedHtml: ''
        };
    },
    watch: {
        template() {
            this.renderTemplate();
        },
        data: {
            deep: true,
            handler() {
                this.renderTemplate();
            }
        }
    },
    mounted() {
        this.renderTemplate();
    },
    methods: {
        renderTemplate() {
            try {
                const templateFn = doT.template(this.template);
                this.renderedHtml = templateFn(this.data);
            } catch (error) {
                console.error('Template rendering error:', error);
            }
        }
    },
    template: '<div v-html="renderedHtml"></div>'
});

// 使用
new Vue({
    el: '#app',
    data: {
        dotTemplate: '<h1>{{=it.title}}</h1><p>{{=it.content}}</p>',
        templateData: { title: 'Hello', content: 'World' }
    },
    template: `
        <div>
            <dot-template :template="dotTemplate" :data="templateData"></dot-template>
        </div>
    `
});
```

## 九、总结

doT.js作为一款高性能、轻量级的JavaScript模板引擎，具有语法简洁、体积小巧、性能卓越等优点，适用于各种前端模板渲染场景。它不仅可以在浏览器环境中使用，也可以在Node.js服务端环境中发挥作用，实现前后端模板共享。

在实际项目中，doT.js可以用于动态列表渲染、表单生成、内容展示等多种场景，通过预编译、缓存模板函数等优化手段，可以进一步提升其性能。虽然在现代前端框架盛行的今天，专用模板引擎的使用场景有所减少，但doT.js仍然在特定场景下具有不可替代的优势，特别是在对性能要求极高或资源受限的环境中。

通过本文的介绍，相信读者已经对doT.js有了全面的了解，可以在实际项目中灵活运用这一强大的模板引擎工具。

## 参考资料

1. doT.js官方文档：https://github.com/olado/doT
2. JavaScript模板引擎性能比较：https://github.com/jonschlinkert/template-benchmarks
3. 《JavaScript模板引擎原理》 - JavaScript高级程序设计
4. doT.js使用最佳实践：https://medium.com/@laura.doktorova/dot-js-templates-for-better-performance-and-easy-maintenance-8eb770c1b995
5. 《前端工程化实践》- 模板引擎篇 