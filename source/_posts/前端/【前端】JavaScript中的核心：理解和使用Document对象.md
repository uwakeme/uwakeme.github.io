---
title: 【前端】JavaScript中的核心：理解和使用Document对象
categories: 前端
tags:
  - JavaScript
  - DOM
  - 前端基础
  - Document对象
---

# 前言

在Web前端开发中，JavaScript扮演着至关重要的角色，而`document`对象则是JavaScript与HTML文档进行交互的核心桥梁。无论是动态修改页面内容、响应用户操作，还是创建新的页面元素，都离不开对`document`对象的理解和运用。本文将作为一篇技术笔记，详细介绍`document`对象的概念、常用属性和方法，帮助开发者更好地掌握这一Web开发的基石。

# 一、什么是Document对象？

当浏览器加载一个HTML页面时，它会创建一个表示该页面的树状结构，这个结构被称为文档对象模型（Document Object Model，简称DOM）。`document`对象就是这个DOM树的根节点，它代表了整个HTML文档。

我们可以将`document`对象视为：

1.  **DOM的入口点**：通过`document`对象，我们可以访问和操作HTML文档中的任何元素、属性和文本内容。
2.  **`window`对象的属性**：`document`对象是全局`window`对象的一个属性，因此我们可以直接在JavaScript代码中使用`document`（或者`window.document`）来访问它。

理解`document`对象是进行任何DOM操作的前提。

# 二、获取HTML元素

`document`对象提供了多种方法来查找和获取HTML文档中的特定元素。这些方法是进行后续操作（如修改内容、样式或绑定事件）的基础。

## （一）通过ID获取元素

`getElementById()`方法是最常用且最高效的获取单个元素的方式。它接收一个元素的ID作为参数，并返回具有该ID的元素对象。如果找不到对应ID的元素，则返回`null`。

```javascript
// 假设HTML中有一个 <div id="myDiv"></div>
const myDiv = document.getElementById('myDiv');
if (myDiv) {
    console.log('找到了元素:', myDiv);
} else {
    console.log('未找到指定ID的元素');
}
```

## （二）通过类名获取元素

`getElementsByClassName()`方法返回一个动态的HTMLCollection（类数组对象），包含文档中所有具有指定类名的元素。

```javascript
// 假设HTML中有多个 <p class="info"></p>
const infoElements = document.getElementsByClassName('info');
for (let i = 0; i < infoElements.length; i++) {
    console.log('找到的类名为info的元素:', infoElements[i]);
}
```
**注意**：HTMLCollection是动态的，意味着当文档中的元素发生变化时，它也会自动更新。

## （三）通过标签名获取元素

`getElementsByTagName()`方法返回一个动态的HTMLCollection，包含文档中所有具有指定标签名的元素。

```javascript
// 获取文档中所有的 <p> 元素
const paragraphs = document.getElementsByTagName('p');
console.log(`文档中共有 ${paragraphs.length} 个段落。`);
```

## （四）通过CSS选择器获取元素

现代浏览器提供了更强大的选择器API，允许我们使用CSS选择器来获取元素。

1.  **`querySelector()`**：返回文档中匹配指定CSS选择器的第一个元素。如果找不到匹配的元素，则返回`null`。
    ```javascript
    // 获取第一个class为 "highlight" 的 <li> 元素
    const highlightedItem = document.querySelector('li.highlight');
    if (highlightedItem) {
        highlightedItem.style.backgroundColor = 'yellow';
    }

    // 获取ID为 "main-content" 的元素下的第一个 <p> 元素
    const firstParagraphInMain = document.querySelector('#main-content p');
    ```

2.  **`querySelectorAll()`**：返回一个静态的NodeList（类数组对象），包含文档中所有匹配指定CSS选择器的元素。
    ```javascript
    // 获取所有class为 "item" 或 "product" 的 <div> 元素
    const itemsAndProducts = document.querySelectorAll('div.item, div.product');
    itemsAndProducts.forEach(element => {
        console.log('找到的元素:', element.tagName, element.className);
    });
    ```
    **注意**：NodeList虽然也是类数组，但`querySelectorAll()`返回的是静态的NodeList，它不会像HTMLCollection那样在文档变化时自动更新。

# 三、操作HTML元素

获取到HTML元素后，`document`对象（或更准确地说，通过`document`获取到的元素对象）允许我们对其进行各种操作。

## （一）读写元素内容

1.  **`innerHTML`**：获取或设置一个元素的HTML内容（包括HTML标签）。
    ```javascript
    const myDiv = document.getElementById('myDiv');
    // 读取HTML内容
    console.log(myDiv.innerHTML); 
    // 设置HTML内容 (会覆盖原有内容，且解析HTML字符串)
    myDiv.innerHTML = '<strong>这是新的内容！</strong><p>包含一个段落。</p>'; 
    ```
    **安全警告**：直接将用户输入的内容设置为`innerHTML`可能导致跨站脚本攻击（XSS），因为会执行其中的`<script>`标签。应谨慎使用或对内容进行净化。

2.  **`textContent`**：获取或设置一个元素的文本内容（忽略HTML标签，只返回纯文本）。
    ```javascript
    const myDiv = document.getElementById('myDiv');
    // 读取文本内容
    console.log(myDiv.textContent);
    // 设置文本内容 (HTML特殊字符会被转义)
    myDiv.textContent = '这是纯文本内容，<strong>标签不会被解析</strong>。';
    ```
    `textContent`通常比`innerHTML`更安全且性能更好（如果只是操作文本）。

## （二）修改元素属性

可以使用`getAttribute()`、`setAttribute()`和`removeAttribute()`方法来操作元素的HTML属性。

```javascript
const myImage = document.getElementById('myImage'); // 假设是一个 <img> 元素

// 获取属性
const src = myImage.getAttribute('src');
console.log('图片源:', src);

// 设置属性
myImage.setAttribute('alt', '一张美丽的风景图');
myImage.setAttribute('width', '300');

// 移除属性
// myImage.removeAttribute('width'); 

// 对于一些常用属性，也可以直接通过点表示法访问和修改
myImage.src = 'new_image.jpg';
console.log(myImage.id); // 直接访问id属性
```

## （三）修改元素样式

可以直接通过元素的`style`属性来修改其内联CSS样式。`style`属性本身是一个对象，其属性对应CSS属性（通常使用驼峰命名法，如`backgroundColor`对应`background-color`）。

```javascript
const myElement = document.getElementById('myElement');

// 设置样式
myElement.style.color = 'blue';
myElement.style.fontSize = '20px';
myElement.style.backgroundColor = '#f0f0f0';
myElement.style.border = '1px solid black';

// 读取样式 (只能读取内联样式，不能读取CSS文件或<style>标签中定义的样式)
console.log(myElement.style.color); 

// 要获取计算后的样式（包括所有来源的样式），应使用 window.getComputedStyle()
const computedStyle = window.getComputedStyle(myElement);
console.log('计算后的字体大小:', computedStyle.fontSize);
```

更推荐的做法是通过修改元素的`class`来改变样式，这样可以保持CSS和JavaScript的分离。

```javascript
// CSS:
// .active { background-color: yellow; font-weight: bold; }

const myElement = document.getElementById('myElement');
// 添加class
myElement.classList.add('active');
// 移除class
// myElement.classList.remove('active');
// 切换class (如果存在则移除，不存在则添加)
// myElement.classList.toggle('active');
// 检查是否包含某个class
// console.log(myElement.classList.contains('active'));
```

# 四、创建和插入HTML元素

`document`对象也提供了创建新HTML元素和文本节点，并将它们插入到DOM树中的方法。

## （一）创建元素和文本节点

1.  **`createElement(tagName)`**：创建一个指定标签名的新元素节点。
    ```javascript
    const newDiv = document.createElement('div');
    const newParagraph = document.createElement('p');
    const newImage = document.createElement('img');
    ```
2.  **`createTextNode(text)`**：创建一个包含指定文本的文本节点。
    ```javascript
    const textNode = document.createTextNode('这是一段新的文本。');
    ```

## （二）插入节点

创建节点后，需要将它们插入到DOM中才能显示。

1.  **`appendChild(node)`**：将一个节点追加到指定父节点的子节点列表的末尾。
    ```javascript
    const parentElement = document.getElementById('parentElement');
    const newChildElement = document.createElement('div');
    newChildElement.textContent = '我是新添加的子元素';
    parentElement.appendChild(newChildElement); // 将新元素添加到父元素的末尾
    ```
2.  **`insertBefore(newNode, referenceNode)`**：在指定的已有子节点`referenceNode`之前插入`newNode`。如果`referenceNode`为`null`，则`newNode`会被插入到子节点列表的末尾（行为类似`appendChild`）。
    ```javascript
    const parentElement = document.getElementById('parentElement');
    const newElement = document.createElement('span');
    newElement.textContent = '我是新插入的span';
    const referenceElement = parentElement.firstChild; // 获取父元素的第一个子节点
    
    if (referenceElement) {
        parentElement.insertBefore(newElement, referenceElement);
    } else {
        parentElement.appendChild(newElement); // 如果没有子节点，则直接追加
    }
    ```

## （三）移除节点

**`removeChild(childNode)`**：从父节点中移除指定的子节点。该方法在父节点上调用。

```javascript
const parentElement = document.getElementById('parentElement');
const childToRemove = document.getElementById('childToRemove');

if (parentElement && childToRemove && childToRemove.parentNode === parentElement) {
    parentElement.removeChild(childToRemove);
}
```
或者更简单地，如果知道要移除的节点：
```javascript
const elementToRemove = document.getElementById('elementToRemove');
if (elementToRemove && elementToRemove.parentNode) {
    elementToRemove.parentNode.removeChild(elementToRemove);
}
```

# 五、事件处理

`document`对象或通过它获取的元素是事件处理的核心。我们可以为元素添加事件监听器来响应用户的交互（如点击、鼠标悬停、键盘输入等）。

```javascript
const myButton = document.getElementById('myButton');

function handleClick() {
    alert('按钮被点击了！');
}

// 添加事件监听器
myButton.addEventListener('click', handleClick);

// 移除事件监听器 (需要传入与添加时相同的函数引用)
// myButton.removeEventListener('click', handleClick);

// 也可以使用on<eventname>属性，但不推荐，因为它只能绑定一个处理函数
// myButton.onclick = function() {
//   console.log('按钮被点击了（通过onclick属性）');
// };
// myButton.onclick = handleClick; // 这会覆盖上面的处理函数
```
常见的事件包括 `click`, `mouseover`, `mouseout`, `keydown`, `keyup`, `submit`, `load`, `DOMContentLoaded` 等。

# 六、Document对象的其他常用属性和方法

除了上述核心功能外，`document`对象还有许多其他有用的属性和方法：

*   **`document.title`**: 获取或设置文档的标题（显示在浏览器标签页或窗口标题栏）。
    ```javascript
    console.log('当前页面标题:', document.title);
    document.title = '新的页面标题';
    ```
*   **`document.URL`**: 返回当前文档的完整URL。
    ```javascript
    console.log('当前页面URL:', document.URL);
    ```
*   **`document.cookie`**: 获取或设置与当前文档关联的cookie。操作cookie比较复杂，通常会使用封装好的库。
    ```javascript
    // 获取所有cookie (一个字符串，需要解析)
    console.log(document.cookie); 
    // 设置cookie (有特定格式和限制)
    // document.cookie = "username=John Doe; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/";
    ```
*   **`document.forms`**: 返回一个HTMLCollection，包含文档中所有的`<form>`元素。
    ```javascript
    const forms = document.forms;
    console.log(`文档中有 ${forms.length} 个表单。`);
    if (forms.length > 0) {
        console.log('第一个表单的名称:', forms[0].name);
    }
    ```
*   **`document.images`**: 返回一个HTMLCollection，包含文档中所有的`<img>`元素。
*   **`document.links`**: 返回一个HTMLCollection，包含文档中所有具有`href`属性的`<a>`和`<area>`元素。
*   **`document.head`**: 返回文档的`<head>`元素。
*   **`document.body`**: 返回文档的`<body>`元素。
*   **`document.documentElement`**: 返回文档的根元素，即`<html>`元素。
*   **`document.readyState`**: 返回文档的加载状态 (`loading`, `interactive`, `complete`)。
*   **`document.write()` / `document.writeln()`**: 向文档流写入HTML表达式或JavaScript代码。**强烈不推荐在文档加载完成后使用`document.write()`**，因为它会覆盖整个文档。主要用于非常早期的HTML生成或在特定情况下（如`document.open()`之后）。

# 七、注意事项

## （一）脚本位置和DOM加载

如果在HTML文档的`<head>`部分或`<body>`部分的早期执行JavaScript代码来操作DOM元素，可能会因为元素尚未被浏览器解析和创建而导致错误。

**推荐的做法是**：

1.  将`<script>`标签放在`</body>`标签闭合之前。这样可以确保在脚本执行时，大部分HTML元素已经被加载。
    ```html
    <body>
        <!-- 页面内容 -->
        <div id="myDiv"></div>

        <script>
            // 此时 myDiv 已经存在
            const myDiv = document.getElementById('myDiv');
            if (myDiv) {
                myDiv.textContent = '内容已修改！';
            }
        </script>
    </body>
    ```
2.  使用`DOMContentLoaded`事件。这个事件在HTML文档被完全加载和解析完成之后触发，无需等待样式表、图像和子框架的完成加载。这是执行DOM操作的理想时机。
    ```javascript
    document.addEventListener('DOMContentLoaded', function() {
        // 这里的代码会在DOM完全加载后执行
        const myDiv = document.getElementById('myDiv');
        if (myDiv) {
            myDiv.textContent = 'DOM加载完毕，内容已修改！';
        }
    });
    ```
    或者对于`window.onload`事件，它会在所有资源（包括图片、样式表等）都加载完毕后才触发，通常比`DOMContentLoaded`晚。

## （二）性能考虑

频繁地直接操作DOM可能会导致页面重绘（repaint）和回流（reflow），这会影响页面性能。

*   **批量修改**：如果需要对DOM进行多次修改，最好将它们组合在一起，或者操作离线的DOM片段（通过`DocumentFragment`），然后一次性添加到主DOM树中。
*   **缓存DOM查询结果**：如果多次需要访问同一个DOM元素，应将其存储在变量中，而不是每次都重新查询。
*   **谨慎使用`innerHTML`**：虽然方便，但大量或频繁使用`innerHTML`来构建复杂DOM结构可能效率不高，且有安全风险。

# 总结

`document`对象是JavaScript在浏览器环境中进行一切页面交互的基础。通过它，开发者可以精确地查找、创建、修改和删除HTML元素，动态地改变页面内容和样式，以及响应用户的各种操作。熟练掌握`document`对象的各种属性和方法，并理解其工作原理和最佳实践，对于编写高效、健壮的前端JavaScript代码至关重要。希望本篇笔记能为您提供有益的参考。

# 参考资料

*   MDN Web Docs - Document: [https://developer.mozilla.org/zh-CN/docs/Web/API/Document](https://developer.mozilla.org/zh-CN/docs/Web/API/Document)
*   MDN Web Docs - Document Object Model (DOM): [https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model)
*   W3Schools - HTML DOM Document Object: [https://www.w3schools.com/jsref/dom_obj_document.asp](https://www.w3schools.com/jsref/dom_obj_document.asp)

--- 