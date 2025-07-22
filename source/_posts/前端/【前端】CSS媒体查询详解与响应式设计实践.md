---
title: 【前端】CSS媒体查询详解与响应式设计实践
categories: 前端
tags:
  - CSS
  - Media Queries
  - 响应式设计
  - Web开发
---

# 前言

在现代Web开发中，用户通过各种不同尺寸和能力的设备访问网页，从桌面显示器到平板电脑再到智能手机。为了确保在所有这些设备上都能提供优秀的用户体验，响应式网页设计（Responsive Web Design, RWD）应运而生。CSS媒体查询（Media Queries）是实现响应式设计的核心技术之一，它允许我们根据设备的特性（如视口宽度、屏幕方向、分辨率等）来应用特定的CSS样式。本文将详细介绍CSS媒体查询的用法、重要概念以及如何在实践中应用它们来构建自适应的网页布局。

# 一、什么是媒体查询？

媒体查询是CSS3引入的一项重要功能，它允许内容的呈现根据用户设备的特定参数进行调整，例如屏幕分辨率、视口宽度、方向（横屏或竖屏）、色彩能力等。通过使用媒体查询，开发者可以为不同类型的设备和环境提供定制化的样式表，从而创建更加灵活和用户友好的界面。

媒体查询主要由两部分组成：

1.  **媒体类型（Media Type）**：指定样式适用的设备类型。
2.  **媒体特性（Media Feature）**：描述设备的具体特征，可以是一个或多个表达式，这些表达式会被解析为真或假。

当媒体类型与设备匹配，并且所有媒体特性表达式都为真时，媒体查询的结果才为真，其中定义的CSS规则就会被应用。

# 二、媒体查询的语法

媒体查询可以直接在CSS文件中使用 `@media` 规则，也可以在HTML的 `<link>` 或 `<style>` 标签中使用 `media` 属性。

## （一）基本语法

在CSS中，基本语法如下：

```css
@media [not|only] <media-type> [and (<media-feature-expression>)]* {
  /* CSS 规则 */
}
```

-   `@media`：声明一个媒体查询块。
-   `not` / `only`：逻辑操作符（可选）。
    -   `not`：用于排除某种媒体类型或条件。例如 `not print` 表示非打印设备。
    -   `only`：用于指定某种特定的媒体类型，主要目的是为了让不支持媒体查询但支持媒体类型的老旧浏览器忽略这些规则。现代浏览器中通常可以省略。
-   `<media-type>`：媒体类型（可选，如果省略，默认为 `all`）。
-   `and`：逻辑操作符，用于连接多个媒体特性表达式。
-   `(<media-feature-expression>)`：一个或多个媒体特性表达式，用于检测设备的具体属性。每个表达式必须用括号包裹。

**示例：**

```css
/* 当屏幕宽度最大为 600px 时应用这些样式 */
@media screen and (max-width: 600px) {
  body {
    background-color: lightblue;
  }
  .sidebar {
    display: none; /* 在小屏幕上隐藏侧边栏 */
  }
}

/* 当设备为打印机或打印预览模式时应用这些样式 */
@media print {
  body {
    font-family: serif;
    font-size: 12pt;
    color: black;
  }
  a::after {
    content: " (" attr(href) ")"; /* 打印时显示链接地址 */
  }
}
```

## （二）在HTML中使用

1.  **通过 `<link>` 标签引入外部样式表：**

    ```html
    <!-- 这个样式表只在屏幕宽度大于等于900px时应用 -->
    <link rel="stylesheet" media="screen and (min-width: 900px)" href="desktop-styles.css">

    <!-- 这个样式表只在屏幕宽度小于等于600px时应用 -->
    <link rel="stylesheet" media="screen and (max-width: 600px)" href="mobile-styles.css">

    <!-- 这个样式表用于打印 -->
    <link rel="stylesheet" media="print" href="print-styles.css">
    ```

2.  **通过 `<style>` 标签内嵌样式：**

    ```html
    <style media="screen and (orientation: landscape)">
      /* 当屏幕方向为横向时应用的样式 */
      .container {
        display: flex;
      }
    </style>
    ```

虽然可以在HTML中通过 `<link>` 标签根据媒体查询加载不同的CSS文件，但这可能会增加HTTP请求次数。更常见的做法是将所有样式写在一个CSS文件中，并使用 `@media` 规则来组织不同条件下的样式。

# 三、媒体类型（Media Types）

媒体类型用于指定CSS规则所适用的设备类别。以下是一些常见的媒体类型：

-   `all`：适用于所有设备（默认值）。
-   `screen`：适用于彩色电脑屏幕、平板电脑、智能手机等。
-   `print`：适用于打印机和打印预览模式。
-   `speech`：适用于屏幕阅读器等语音合成设备。

过去还有一些如 `handheld`, `tv`, `projection` 等媒体类型，但很多已被废弃或不被广泛支持，目前最常用的是 `all`, `screen`, 和 `print`。

```css
@media screen {
  /* 只在屏幕上应用的样式 */
  body {
    font-family: Arial, sans-serif;
  }
}

@media print {
  /* 只在打印时应用的样式 */
  header, footer, nav, .sidebar {
    display: none; /* 打印时隐藏导航、页眉页脚和侧边栏 */
  }
  article {
    width: 100%;
  }
}
```

# 四、媒体特性（Media Features）

媒体特性是媒体查询的核心，它们允许我们检测设备的具体特征。每个特性都可以有一个值，并且很多特性可以带有 `min-` 或 `max-` 前缀来表示范围。

## （一）视口尺寸相关

这是响应式设计中最常用的特性。

1.  **`width` / `height`**
    -   描述：视口（viewport）的宽度/高度。
    -   可加前缀：`min-width`, `max-width`, `min-height`, `max-height`。
    -   示例：
        ```css
        /* 视口宽度小于等于 768px */
        @media (max-width: 768px) { /* ... */ }

        /* 视口宽度大于等于 1024px */
        @media (min-width: 1024px) { /* ... */ }

        /* 视口宽度在 600px 到 900px 之间 */
        @media (min-width: 600px) and (max-width: 900px) { /* ... */ }

        /* 视口高度大于等于 400px */
        @media (min-height: 400px) { /* ... */ }
        ```

2.  **`device-width` / `device-height` (已不推荐)**
    -   描述：设备屏幕的实际渲染宽度/高度。与 `width`/`height` 不同，后者指的是浏览器视口。
    -   **注意**：这些特性已从 Media Queries Level 4 中移除，推荐使用 `width` 和 `height` 结合视口单位（vw, vh）。在早期的响应式设计中较为常见，但现在应避免使用。

3.  **`aspect-ratio`**
    -   描述：视口的宽高比 (宽度/高度)。
    -   可加前缀：`min-aspect-ratio`, `max-aspect-ratio`。
    -   示例：
        ```css
        /* 视口宽高比为 16/9 */
        @media (aspect-ratio: 16/9) { /* ... */ }

        /* 视口宽高比最小为 4/3 */
        @media (min-aspect-ratio: 4/3) { /* ... */ }
        ```

4.  **`orientation`**
    -   描述：设备的方向。
    -   值：`portrait` (高大于等于宽), `landscape` (宽大于高)。
    -   示例：
        ```css
        @media (orientation: portrait) {
          /* 设备处于纵向模式时的样式 */
          .logo { max-width: 80%; }
        }
        @media (orientation: landscape) {
          /* 设备处于横向模式时的样式 */
          nav ul { display: flex; }
        }
        ```

## （二）显示质量相关

1.  **`resolution`**
    -   描述：输出设备的分辨率（像素密度）。
    -   单位：`dpi` (dots per inch), `dpcm` (dots per centimeter), `dppx` (dots per pixel unit, 1dppx = 96dpi)。
    -   可加前缀：`min-resolution`, `max-resolution`。
    -   示例：
        ```css
        /* 针对高分屏 (Retina) 设备 */
        @media (min-resolution: 2dppx),
               (-webkit-min-device-pixel-ratio: 2), /* 兼容旧版 WebKit */
               (min-resolution: 192dpi) {
          .icon {
            background-image: url('icon@2x.png');
            background-size: cover;
          }
        }
        ```
    -   **`-webkit-device-pixel-ratio`**: 这是一个早期的、非标准的WebKit内核特有的媒体特性，用于检测设备像素比。现在推荐使用标准的 `resolution`。

2.  **`scan` (主要用于TV)**
    -   描述：电视等设备的扫描方式。
    -   值：`progressive` (逐行扫描), `interlace` (隔行扫描)。

3.  **`grid`**
    -   描述：设备是否使用基于网格的屏幕（如TTY终端）。
    -   值：`0` (非网格), `1` (网格)。

4.  **`update` (Media Queries Level 4)**
    -   描述：设备更新屏幕内容的能力和频率。
    -   值：`none` (无法更新，如打印纸张), `slow` (更新慢，如电子墨水屏), `fast` (正常屏幕刷新率)。
    -   示例：
        ```css
        @media (update: slow) {
          /* 为电子墨水屏等慢刷新设备优化，减少动画 */
          .animated-element { animation: none; }
        }
        ```

5.  **`overflow-block` / `overflow-inline` (Media Queries Level 4)**
    -   描述：内容溢出视口时，在块方向/内联方向的处理方式。
    -   值：`none`, `scroll`, `optional-paged`, `paged`。

## （三）颜色相关

1.  **`color`**
    -   描述：设备颜色的位深度（每种颜色的比特数）。如果值为0，表示设备是灰度屏。
    -   可加前缀：`min-color`, `max-color`。
    -   示例：
        ```css
        @media (color >= 8) {
          /* 至少支持8位颜色的设备 */
        }
        @media (color: 0) {
          /* 灰度屏幕 */
        }
        ```

2.  **`color-index`**
    -   描述：设备颜色查询表中的条目数。如果设备不使用颜色查询表，则值为0。
    -   可加前缀：`min-color-index`, `max-color-index`。

3.  **`monochrome`**
    -   描述：单色设备中每像素的位数。值为0表示非单色设备。
    -   可加前缀：`min-monochrome`, `max-monochrome`。

4.  **`color-gamut` (Media Queries Level 4)**
    -   描述：浏览器和输出设备支持的近似色域范围。
    -   值：`srgb`, `p3`, `rec2020`。
    -   示例：
        ```css
        @media (color-gamut: p3) {
          /* 支持 Display P3 色域的设备，可以使用更鲜艳的颜色 */
          .highlight { color: color(display-p3 1 0.5 0); }
        }
        ```

5.  **`dynamic-range` (Media Queries Level 5)**
    -   描述：视频平面支持的亮度、色深和对比度的组合。
    -   值： `standard`, `high`。

6.  **`inverted-colors` (Media Queries Level 5)**
    -   描述：用户是否在系统或浏览器层面启用了颜色反转。
    -   值：`none`, `inverted`。
    -   示例：
        ```css
        @media (inverted-colors: inverted) {
          img, video {
            filter: invert(100%); /* 将图片和视频反转回来，避免显示异常 */
          }
        }
        ```

## （四）交互相关 (Media Queries Level 4 & 5)

这些特性帮助检测用户的输入方式。

1.  **`hover`**
    -   描述：主要输入机制是否允许用户在元素上悬停。
    -   值：`none` (无法悬停，如触摸屏), `hover` (可以悬停，如鼠标)。
    -   示例：
        ```css
        @media (hover: hover) {
          .tooltip:hover .tooltip-text {
            display: block; /* 鼠标用户悬停显示提示 */
          }
        }
        @media (hover: none) {
          .tooltip .tooltip-text {
            display: none; /* 触摸设备上默认不显示，可能需要点击触发 */
          }
        }
        ```

2.  **`any-hover`**
    -   描述：是否有任何可用的输入机制允许用户悬停。

3.  **`pointer`**
    -   描述：主要输入机制的精确度。
    -   值：`none` (无指针), `coarse` (不精确，如手指触摸), `fine` (精确，如鼠标、触控笔)。
    -   示例：
        ```css
        @media (pointer: coarse) {
          /* 触摸设备，增大按钮点击区域 */
          .button {
            padding: 15px 25px;
            font-size: 1.2em;
          }
        }
        ```

4.  **`any-pointer`**
    -   描述：是否有任何可用的输入机制是指针设备，及其精确度。

## （五）用户偏好相关 (Media Queries Level 5)

这些特性允许网页响应用户的系统级辅助功能或偏好设置。

1.  **`prefers-reduced-motion`**
    -   描述：用户是否希望减少页面上的动画和过渡效果。
    -   值：`no-preference`, `reduce`。
    -   示例：
        ```css
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        ```

2.  **`prefers-color-scheme`**
    -   描述：用户偏好的颜色主题（亮色或暗色）。
    -   值：`no-preference`, `light`, `dark`。
    -   示例（实现暗黑模式）：
        ```css
        body {
          --text-color: black;
          --background-color: white;
        }
        @media (prefers-color-scheme: dark) {
          body {
            --text-color: white;
            --background-color: #121212;
          }
        }
        body {
          color: var(--text-color);
          background-color: var(--background-color);
        }
        ```

3.  **`prefers-contrast`**
    -   描述：用户是否偏好更高或更低的对比度。
    -   值：`no-preference`, `high`, `low`, `forced` (Windows高对比度模式)。

4.  **`prefers-reduced-transparency`**
    -   描述：用户是否希望减少透明效果。
    -   值： `no-preference`, `reduce`。

5.  **`forced-colors`**
    -   描述：浏览器是否强制使用用户选择的有限调色板。
    -   值： `none`, `active`。

6.  **`prefers-reduced-data`**
    -   描述：用户是否希望减少数据使用量。
    -   值： `no-preference`, `reduce`。
        ```css
        @media (prefers-reduced-data: reduce) {
          .hero-image {
            background-image: url('low-res-hero.jpg'); /* 加载低分辨率图片 */
          }
          video {
            preload: metadata; /* 仅预加载元数据 */
          }
        }
        ```

# 五、逻辑操作符

媒体查询可以使用逻辑操作符来创建更复杂的条件。

1.  **`and`**
    -   用于组合多个媒体特性，所有特性都必须为真，整个查询才为真。
    -   示例：
        ```css
        /* 屏幕宽度在400px到600px之间，并且是横屏 */
        @media screen and (min-width: 400px) and (max-width: 600px) and (orientation: landscape) {
          /* ... */
        }
        ```

2.  **`,` (逗号，相当于 `or`)**
    -   用于将多个媒体查询组合起来，只要其中任何一个查询为真，样式就会应用。
    -   示例：
        ```css
        /* 屏幕宽度小于等于 600px，或者设备是打印机 */
        @media screen and (max-width: 600px), print {
          .main-content {
            width: 100%;
          }
        }
        ```

3.  **`not`**
    -   用于否定一个媒体查询。它会反转整个查询的真假值。
    -   **注意**：`not` 操作符必须放在媒体查询的开头，并且如果使用 `not`，则必须指定媒体类型（如 `screen`, `print`）。
    -   示例：
        ```css
        /* 不是彩色打印设备 */
        @media not print and (color) {
          /* ... */
        }

        /* 不是横屏的屏幕设备 */
        @media not screen and (orientation: landscape) {
          /* ... */
        }
        ```
    -   `not` 也可以用于否定单个媒体特性（Media Queries Level 4规范的较新语法，但浏览器支持可能不一致，更安全的做法是否定整个查询或使用 `min-/max-` 组合）。

4.  **`only`**
    -   用于向后兼容，确保不支持媒体查询完整语法的旧版浏览器不会错误地应用样式。现代浏览器会忽略 `only` 关键字。
    -   如果使用 `only`，也必须指定媒体类型。
    -   示例：
        ```css
        @media only screen and (min-width: 768px) {
          /* ... */
        }
        ```
        这个查询对于不支持媒体查询的浏览器是不可见的。对于支持的浏览器，`only` 被忽略，查询等同于 `screen and (min-width: 768px)`。

# 六、响应式设计中的断点 (Breakpoints)

在响应式设计中，**断点**是指媒体查询中设定的特定视口尺寸值，当视口宽度达到这些值时，页面布局会发生改变以适应新的屏幕尺寸。

## （一）如何选择断点？

选择断点的最佳实践是：**基于内容，而非特定设备**。

-   **内容驱动**：不要盲目地为iPhone、iPad、各种Android设备设置固定的断点。设备种类繁多，尺寸各异，这种方法难以维护且不灵活。正确的做法是，在浏览器中调整窗口大小，观察你的内容在何时开始显得拥挤、拉伸过度或布局不佳，就在那个临界点设置断点。
-   **从小屏幕开始 (Mobile First)**：推荐采用"移动优先"的策略。首先为小屏幕（如手机）设计基础布局和样式，然后通过 `min-width` 媒体查询逐渐为更大的屏幕增加复杂性和布局调整。这种方法通常能产生更简洁、性能更好的代码。
-   **主要断点**：通常，你可能只需要2-4个主要断点来覆盖从小屏幕到大屏幕的过渡。例如：
    -   小屏幕 (手机): 默认样式，或 `max-width: 600px` 左右
    -   中等屏幕 (平板): `min-width: 601px` and `max-width: 900px` 左右
    -   大屏幕 (桌面): `min-width: 901px` 左右
    -   超大屏幕 (可选): `min-width: 1200px` 或 `1400px` 左右
-   **使用相对单位 (em/rem)**：如果你的布局和字体大小使用相对单位（如 `em` 或 `rem`），那么在媒体查询中使用 `em` 单位可以使断点也响应用户的字体大小偏好设置，从而提供更好的可访问性。

## （二）示例：移动优先的断点

```css
/* 默认样式 (Mobile First - 适用于所有设备，尤其是小屏幕) */
.container {
  width: 90%;
  margin: 0 auto;
  padding: 10px;
}
nav ul li {
  display: block; /* 手机上垂直排列导航项 */
  margin-bottom: 10px;
}
.main-content {
  width: 100%;
}
.sidebar {
  display: none; /* 手机上默认隐藏侧边栏 */
}

/* 中等屏幕 (例如：平板电脑) */
@media (min-width: 600px) {
  nav ul {
    display: flex; /* 平板上水平排列导航项 */
  }
  nav ul li {
    margin-right: 20px;
    margin-bottom: 0;
  }
  .sidebar {
    display: block; /* 平板上显示侧边栏 */
    width: 30%;
    float: right; /* 或者使用 Flexbox/Grid */
  }
  .main-content {
    width: 68%; /* 调整主内容宽度 */
    float: left;
  }
}

/* 大屏幕 (例如：桌面显示器) */
@media (min-width: 992px) {
  .container {
    max-width: 960px; /* 限制最大宽度 */
  }
  nav {
    /* 更复杂的导航样式 */
  }
  .main-content {
    width: 70%;
  }
  .sidebar {
    width: 28%;
  }
}
```

# 七、视口元标签 (Viewport Meta Tag)

为了让媒体查询在移动设备上按预期工作，必须在HTML文档的 `<head>` 部分添加视口元标签。移动浏览器通常会尝试以桌面宽度（如980px）渲染页面，然后缩小以适应屏幕，这会导致媒体查询失效。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

-   `width=device-width`：将视口的宽度设置为设备的实际宽度。
-   `initial-scale=1.0`：设置页面初始加载时的缩放级别为100%，不进行缩放。

其他常用参数：

-   `minimum-scale=1.0`：允许用户缩小的最小比例。
-   `maximum-scale=1.0`：允许用户放大的最大比例。
-   `user-scalable=no`：禁止用户手动缩放（通常不推荐，影响可访问性）。

# 八、CSS媒体查询的最佳实践

1.  **移动优先 (Mobile First)**：从小屏幕开始设计，逐步增强到大屏幕。
2.  **内容驱动断点**：根据内容和布局的自然断裂点来设置断点，而不是特定设备尺寸。
3.  **保持简洁**：尽量减少断点的数量，避免过度复杂的媒体查询规则。
4.  **使用相对单位**：在媒体查询中使用 `em` 单位，可以使断点响应用户的字体大小设置。
5.  **模块化和组件化**：设计可复用的组件，并考虑它们在不同视口尺寸下的表现。
6.  **测试，测试，再测试**：在多种设备和浏览器（或使用开发者工具的设备模拟功能）上彻底测试你的响应式设计。
7.  **性能考虑**：
    -   避免在 `<link>` 标签中通过媒体查询加载大量不同的CSS文件，这会增加HTTP请求。首选将所有样式放在一个文件中，用 `@media` 组织。
    -   对于背景图片，可以使用 `<picture>` 元素或 `image-set()` (CSS) 为不同分辨率和视口提供合适的图片资源。
8.  **可访问性 (Accessibility)**：确保响应式变化不会损害可访问性。例如，不要仅仅为了适应小屏幕而隐藏重要内容，确保所有交互元素在触摸设备上都有足够大的点击区域。
9.  **不要过度依赖媒体查询**：现代CSS布局技术如 Flexbox 和 Grid 自身就具备很多响应式能力，可以创建灵活的组件而无需媒体查询。优先考虑这些技术，媒体查询作为补充。

# 九、媒体查询与现代CSS布局

虽然媒体查询是响应式设计的基石，但现代CSS布局技术（如Flexbox和CSS Grid）提供了更强大的工具来创建本质上就具有响应性的组件。

-   **Flexbox**：非常适合一维布局（行或列），可以轻松实现项目间的空间分配、对齐和排序，这些特性在不同屏幕尺寸下非常有用。
-   **CSS Grid**：专为二维布局设计，可以创建复杂的网格结构。结合 `fr` 单位、`minmax()`、`auto-fit`、`auto-fill` 等特性，可以在不使用媒体查询的情况下实现很多响应式效果。

**示例：使用CSS Grid实现响应式卡片布局，无需媒体查询**

```html
<div class="card-container">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
  <div class="card">Card 5</div>
</div>
```

```css
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* 核心 */
  gap: 20px;
  padding: 20px;
}

.card {
  background-color: #f0f0f0;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
```
在这个例子中，`grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));` 会自动根据容器宽度调整列数。每列的最小宽度是 `250px`，如果空间允许，它们会平均分配剩余空间（`1fr`）。当容器宽度变化时，卡片会自动换行和调整，实现了响应式效果。

媒体查询仍然非常重要，尤其是在需要根据视口宽度对整体页面结构、组件显隐、或特定样式进行较大调整时。最佳策略通常是将现代CSS布局的内在灵活性与媒体查询的宏观控制结合起来。

# 十、总结

CSS媒体查询是构建现代响应式网站不可或缺的工具。通过理解其语法、各种媒体特性和逻辑操作符，并遵循最佳实践（如移动优先和内容驱动的断点），开发者可以为各种设备和屏幕尺寸创建美观且功能完善的用户体验。结合Flexbox和CSS Grid等现代布局技术，媒体查询能帮助我们打造出真正自适应和面向未来的Web界面。

# 十一、参考资料

-   MDN Web Docs: CSS Media Queries ([https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries))
-   MDN Web Docs: Media query syntax ([https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Syntax))
-   CSS-Tricks: A Complete Guide to CSS Media Queries ([https://css-tricks.com/a-complete-guide-to-css-media-queries/](https://css-tricks.com/a-complete-guide-to-css-media-queries/))
-   W3C Recommendation: Media Queries Level 4 ([https://www.w3.org/TR/mediaqueries-4/](https://www.w3.org/TR/mediaqueries-4/))
-   Google Developers: Responsive Web Design Basics ([https://developers.google.com/web/fundamentals/design-and-ux/responsive](https://developers.google.com/web/fundamentals/design-and-ux/responsive))

--- 