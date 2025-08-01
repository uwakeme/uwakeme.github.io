---
title: 【前端】uni-app跨平台开发完全指南：一套代码多端运行的最佳实践
categories: 前端
date: 2025-01-29
tags:
  - uni-app
  - 跨平台开发
  - Vue.js
  - 小程序
  - 移动开发
  - 混合开发
cover: https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vuedotjs.svg
---

# 前言

uni-app是DCloud推出的一个使用Vue.js开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/飞书/QQ/快手/钉钉/淘宝）、快应用等多个平台。就像Java的"一次编写，到处运行"理念一样，uni-app实现了"一套代码，多端运行"的跨平台开发模式。本文将详细介绍uni-app的核心概念、开发实践和最佳实践，帮助开发者快速掌握这个强大的跨平台开发框架。

# 一、uni-app概述

## （一）什么是uni-app

**uni-app的核心特点：**
uni-app是一个基于Vue.js的跨平台应用开发框架，采用了类似于微信小程序的开发规范，但扩展了更多的功能和平台支持。

**技术架构：**
```
uni-app技术栈：

开发语言层：
├── 模板语法：类Vue.js模板语法，兼容小程序语法
├── 样式语言：CSS/SCSS/LESS/Stylus
├── 脚本语言：JavaScript/TypeScript
└── 组件系统：Vue组件 + uni-app扩展组件

编译层：
├── 编译器：基于webpack的多端编译器
├── 运行时：各平台的运行时适配层
├── 条件编译：#ifdef 平台特定代码
└── 自动优化：代码分割、摇树优化等

目标平台：
├── 移动端：iOS App、Android App
├── 小程序：微信、支付宝、百度、头条等
├── Web端：H5响应式网页
├── 桌面端：Windows、macOS、Linux
└── 快应用：华为、小米、OPPO等厂商快应用
```

**与其他跨平台方案对比：**

| 特性 | uni-app | React Native | Flutter | 原生开发 |
|------|---------|--------------|---------|----------|
| **开发语言** | Vue.js/JS | React/JS | Dart | Swift/Kotlin |
| **学习成本** | 低 | 中等 | 中等 | 高 |
| **性能表现** | 中等 | 中等 | 高 | 最高 |
| **平台支持** | 全平台 | 移动端为主 | 移动端为主 | 单平台 |
| **包体积** | 小 | 中等 | 较大 | 最小 |
| **开发效率** | 高 | 中等 | 中等 | 低 |
| **社区生态** | 中等 | 丰富 | 快速增长 | 最丰富 |

## （二）uni-app的优势与适用场景

**核心优势：**
```javascript
// uni-app的核心优势体现在代码复用上
// 一套Vue.js代码可以编译到多个平台

// 1. 统一的开发体验：类似于Vue.js的开发方式
export default {
    data() {
        return {
            title: 'Hello uni-app',  // 数据绑定，类似于Vue.js
            userInfo: {}
        }
    },
    onLoad() {
        // 页面加载时执行，类似于小程序的生命周期
        this.getUserInfo();
    },
    methods: {
        // 方法定义，完全兼容Vue.js语法
        getUserInfo() {
            // uni-app提供统一的API，自动适配各平台
            uni.getUserInfo({
                success: (res) => {
                    this.userInfo = res.userInfo;
                }
            });
        },
        
        // 跨平台的事件处理
        handleClick() {
            // 统一的提示API，在不同平台有不同表现
            uni.showToast({
                title: '点击成功',
                icon: 'success'
            });
        }
    }
}
```

**适用场景分析：**
1. **中小型企业应用**：快速开发，降低成本
2. **内容展示类应用**：新闻、电商、社交等
3. **工具类应用**：计算器、天气、记账等
4. **企业内部应用**：OA系统、CRM、ERP等
5. **快速原型验证**：MVP产品快速上线

**不适用场景：**
1. **高性能游戏**：需要原生性能优化
2. **复杂动画应用**：原生动画性能更好
3. **硬件深度集成**：需要调用特殊硬件功能
4. **大型复杂应用**：可能遇到性能瓶颈

# 二、uni-app开发环境搭建

## （一）开发工具选择

**HBuilderX（推荐）：**
```bash
# HBuilderX是DCloud官方IDE，专为uni-app优化
# 下载地址：https://www.dcloud.io/hbuilderx.html

特点：
├── 内置uni-app项目模板和代码提示
├── 可视化界面设计器
├── 内置模拟器和真机调试
├── 一键发布到各个平台
└── 插件生态丰富

安装步骤：
1. 下载HBuilderX安装包
2. 安装并启动HBuilderX
3. 安装uni-app插件（通常已内置）
4. 创建uni-app项目
```

**VS Code + 插件：**
```bash
# 对于习惯VS Code的开发者，可以使用插件方式开发

必装插件：
├── uni-app-schemas：uni-app语法提示
├── uni-app-snippets：代码片段
├── Vetur：Vue.js语法支持
├── uni-helper：uni-app开发助手
└── Prettier：代码格式化

# 安装uni-app CLI工具
npm install -g @dcloudio/uni-cli

# 创建项目
uni create -t default my-uni-app
cd my-uni-app
npm install
```

## （二）项目结构解析

**标准项目结构：**
```
uni-app项目结构：

my-uni-app/
├── pages/                    # 页面文件夹
│   ├── index/               # 首页
│   │   ├── index.vue        # 页面组件
│   │   └── index.scss       # 页面样式（可选）
│   └── detail/              # 详情页
│       └── detail.vue
├── components/              # 组件文件夹
│   ├── common/              # 公共组件
│   │   ├── header.vue       # 头部组件
│   │   └── footer.vue       # 底部组件
│   └── business/            # 业务组件
│       └── product-card.vue # 商品卡片组件
├── static/                  # 静态资源
│   ├── images/              # 图片资源
│   ├── fonts/               # 字体文件
│   └── icons/               # 图标文件
├── common/                  # 公共文件
│   ├── utils.js             # 工具函数
│   ├── config.js            # 配置文件
│   └── api.js               # API接口
├── store/                   # 状态管理（Vuex）
│   ├── index.js             # store入口
│   ├── modules/             # 模块化store
│   └── mutations.js         # 状态变更
├── uni_modules/             # uni-app插件
├── platforms/               # 平台特定代码
│   ├── app-plus/            # App平台代码
│   ├── h5/                  # H5平台代码
│   └── mp-weixin/           # 微信小程序代码
├── pages.json               # 页面路由配置
├── manifest.json            # 应用配置
├── App.vue                  # 应用入口组件
├── main.js                  # 应用入口文件
├── uni.scss                 # 全局样式变量
└── package.json             # 项目依赖配置
```

**核心配置文件详解：**
```json
// pages.json - 页面路由和窗口表现配置
{
    "pages": [
        {
            "path": "pages/index/index",
            "style": {
                "navigationBarTitleText": "首页",
                "enablePullDownRefresh": true,
                "backgroundColor": "#f8f8f8"
            }
        },
        {
            "path": "pages/detail/detail",
            "style": {
                "navigationBarTitleText": "详情页",
                "navigationBarBackgroundColor": "#007AFF"
            }
        }
    ],
    "globalStyle": {
        "navigationBarTextStyle": "black",
        "navigationBarTitleText": "uni-app应用",
        "navigationBarBackgroundColor": "#F8F8F8",
        "backgroundColor": "#F8F8F8"
    },
    "tabBar": {
        "color": "#7A7E83",
        "selectedColor": "#3cc51f",
        "borderStyle": "black",
        "backgroundColor": "#ffffff",
        "list": [
            {
                "pagePath": "pages/index/index",
                "iconPath": "static/tab-home.png",
                "selectedIconPath": "static/tab-home-active.png",
                "text": "首页"
            },
            {
                "pagePath": "pages/profile/profile",
                "iconPath": "static/tab-profile.png",
                "selectedIconPath": "static/tab-profile-active.png",
                "text": "我的"
            }
        ]
    }
}
```

```json
// manifest.json - 应用配置文件
{
    "name": "my-uni-app",
    "appid": "__UNI__XXXXXXX",
    "description": "我的uni-app应用",
    "versionName": "1.0.0",
    "versionCode": "100",
    "transformPx": false,
    "app-plus": {
        "usingComponents": true,
        "nvueStyleCompiler": "uni-app",
        "compilerVersion": 3,
        "splashscreen": {
            "alwaysShowBeforeRender": true,
            "waiting": true,
            "autoclose": true,
            "delay": 0
        },
        "modules": {},
        "distribute": {
            "android": {
                "permissions": [
                    "<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\" />",
                    "<uses-permission android:name=\"android.permission.MOUNT_UNMOUNT_FILESYSTEMS\" />",
                    "<uses-permission android:name=\"android.permission.VIBRATE\" />",
                    "<uses-permission android:name=\"android.permission.READ_LOGS\" />",
                    "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\" />",
                    "<uses-feature android:name=\"android.hardware.camera.autofocus\" />",
                    "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />",
                    "<uses-permission android:name=\"android.permission.CAMERA\" />",
                    "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\" />",
                    "<uses-permission android:name=\"android.permission.READ_PHONE_STATE\" />",
                    "<uses-permission android:name=\"android.permission.CHANGE_WIFI_STATE\" />",
                    "<uses-permission android:name=\"android.permission.WAKE_LOCK\" />",
                    "<uses-permission android:name=\"android.permission.FLASHLIGHT\" />",
                    "<uses-permission android:name=\"android.device.permission.ACCESS_CHECKIN_PROPERTIES\" />",
                    "<uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\" />",
                    "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />",
                    "<uses-permission android:name=\"android.permission.ACCESS_LOCATION_EXTRA_COMMANDS\" />",
                    "<uses-permission android:name=\"android.permission.CHANGE_CONFIGURATION\" />",
                    "<uses-permission android:name=\"android.permission.SYSTEM_ALERT_WINDOW\" />",
                    "<uses-permission android:name=\"android.permission.WRITE_CONTACTS\" />",
                    "<uses-permission android:name=\"android.permission.WRITE_SETTINGS\" />"
                ]
            },
            "ios": {},
            "sdkConfigs": {}
        }
    },
    "quickapp": {},
    "mp-weixin": {
        "appid": "wxXXXXXXXXXXXXXXXX",
        "setting": {
            "urlCheck": false
        },
        "usingComponents": true
    },
    "mp-alipay": {
        "usingComponents": true
    },
    "mp-baidu": {
        "usingComponents": true
    },
    "mp-toutiao": {
        "usingComponents": true
    },
    "h5": {
        "title": "my-uni-app",
        "template": "index.html"
    }
}
```

# 三、uni-app核心开发概念

## （一）页面和组件开发

**页面结构：**
```vue
<!-- pages/index/index.vue - 标准页面结构 -->
<template>
    <!-- 模板部分：类似于Vue.js，但支持小程序语法 -->
    <view class="container">
        <!-- uni-app内置组件：view相当于div，但跨平台兼容性更好 -->
        <view class="header">
            <text class="title">{{title}}</text>
            <!-- text组件：跨平台的文本显示，类似于span但性能更好 -->
        </view>

        <!-- 列表渲染：完全兼容Vue.js语法 -->
        <scroll-view scroll-y="true" class="scroll-area">
            <view
                v-for="(item, index) in dataList"
                :key="item.id"
                class="list-item"
                @click="handleItemClick(item, index)"
            >
                <!-- 图片组件：自动适配各平台的图片加载 -->
                <image
                    :src="item.image"
                    class="item-image"
                    mode="aspectFill"
                    @error="handleImageError"
                    lazy-load
                ></image>

                <view class="item-content">
                    <text class="item-title">{{item.title}}</text>
                    <text class="item-desc">{{item.description}}</text>

                    <!-- 条件渲染：支持v-if/v-show -->
                    <view v-if="item.isHot" class="hot-tag">热门</view>
                </view>
            </view>
        </scroll-view>

        <!-- 按钮组件：统一的按钮样式和交互 -->
        <button
            class="load-more-btn"
            :loading="isLoading"
            @click="loadMore"
            :disabled="!hasMore"
        >
            {{isLoading ? '加载中...' : (hasMore ? '加载更多' : '没有更多了')}}
        </button>
    </view>
</template>

<script>
// 脚本部分：完全兼容Vue.js语法，扩展了uni-app特有的生命周期
export default {
    data() {
        return {
            title: '首页',
            dataList: [],           // 数据列表
            isLoading: false,       // 加载状态
            hasMore: true,          // 是否还有更多数据
            page: 1,                // 当前页码
            pageSize: 10            // 每页数量
        }
    },

    // uni-app页面生命周期：类似于小程序生命周期
    onLoad(options) {
        // 页面加载时触发，类似于Vue的created
        console.log('页面加载，参数：', options);
        this.initData();
    },

    onShow() {
        // 页面显示时触发，每次进入页面都会执行
        console.log('页面显示');
        this.refreshData();
    },

    onReady() {
        // 页面初次渲染完成时触发，类似于Vue的mounted
        console.log('页面渲染完成');
    },

    onHide() {
        // 页面隐藏时触发
        console.log('页面隐藏');
    },

    onUnload() {
        // 页面卸载时触发，类似于Vue的destroyed
        console.log('页面卸载');
        this.cleanup();
    },

    // 下拉刷新：需要在pages.json中配置enablePullDownRefresh
    onPullDownRefresh() {
        console.log('下拉刷新');
        this.refreshData();
    },

    // 上拉加载：触底时自动调用
    onReachBottom() {
        console.log('触底加载');
        if (this.hasMore && !this.isLoading) {
            this.loadMore();
        }
    },

    // 页面滚动：可以监听页面滚动事件
    onPageScroll(e) {
        // console.log('页面滚动：', e.scrollTop);
        // 可以在这里实现滚动相关的交互，如返回顶部按钮显示/隐藏
    },

    methods: {
        // 初始化数据
        async initData() {
            this.isLoading = true;
            try {
                // 调用API获取数据
                const response = await this.$api.getDataList({
                    page: this.page,
                    pageSize: this.pageSize
                });

                this.dataList = response.data.list;
                this.hasMore = response.data.hasMore;
            } catch (error) {
                console.error('数据加载失败：', error);
                // uni-app统一的错误提示API
                uni.showToast({
                    title: '数据加载失败',
                    icon: 'none',
                    duration: 2000
                });
            } finally {
                this.isLoading = false;
            }
        },

        // 刷新数据
        async refreshData() {
            this.page = 1;
            this.hasMore = true;
            await this.initData();

            // 停止下拉刷新动画
            uni.stopPullDownRefresh();
        },

        // 加载更多数据
        async loadMore() {
            if (this.isLoading || !this.hasMore) return;

            this.page++;
            this.isLoading = true;

            try {
                const response = await this.$api.getDataList({
                    page: this.page,
                    pageSize: this.pageSize
                });

                // 追加新数据
                this.dataList.push(...response.data.list);
                this.hasMore = response.data.hasMore;
            } catch (error) {
                console.error('加载更多失败：', error);
                this.page--; // 回退页码
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
            } finally {
                this.isLoading = false;
            }
        },

        // 列表项点击事件
        handleItemClick(item, index) {
            console.log('点击项目：', item, index);

            // uni-app统一的页面跳转API
            uni.navigateTo({
                url: `/pages/detail/detail?id=${item.id}&title=${encodeURIComponent(item.title)}`
            });
        },

        // 图片加载错误处理
        handleImageError(e) {
            console.log('图片加载失败：', e);
            // 可以设置默认图片
        },

        // 页面清理
        cleanup() {
            // 清理定时器、取消网络请求等
            console.log('页面清理');
        }
    }
}
</script>

<style lang="scss" scoped>
/* 样式部分：支持CSS/SCSS/LESS等预处理器 */
/* uni-app使用upx单位，类似于小程序的rpx，自动适配不同屏幕尺寸 */

.container {
    display: flex;
    flex-direction: column;
    height: 100vh;                 /* 视窗高度 */
    background-color: #f8f8f8;
}

.header {
    padding: 20upx 30upx;          /* upx单位：750upx = 屏幕宽度 */
    background-color: #ffffff;
    border-bottom: 1upx solid #e5e5e5;

    .title {
        font-size: 36upx;          /* 字体大小，自动适配 */
        font-weight: bold;
        color: #333333;
    }
}

.scroll-area {
    flex: 1;                       /* 占用剩余空间 */
    padding: 20upx;
}

.list-item {
    display: flex;
    padding: 20upx;
    margin-bottom: 20upx;
    background-color: #ffffff;
    border-radius: 12upx;
    box-shadow: 0 2upx 10upx rgba(0, 0, 0, 0.1);

    /* 点击态样式：uni-app自动处理 */
    &:active {
        background-color: #f5f5f5;
    }

    .item-image {
        width: 120upx;
        height: 120upx;
        border-radius: 8upx;
        margin-right: 20upx;
        background-color: #f0f0f0;  /* 占位背景色 */
    }

    .item-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .item-title {
            font-size: 32upx;
            font-weight: 500;
            color: #333333;
            margin-bottom: 10upx;

            /* 文本溢出处理 */
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .item-desc {
            font-size: 28upx;
            color: #666666;
            line-height: 1.4;

            /* 多行文本溢出 */
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
        }

        .hot-tag {
            align-self: flex-start;
            padding: 4upx 12upx;
            background-color: #ff4757;
            color: #ffffff;
            font-size: 20upx;
            border-radius: 20upx;
            margin-top: 10upx;
        }
    }
}

.load-more-btn {
    margin: 20upx;
    padding: 24upx;
    background-color: #007aff;
    color: #ffffff;
    border: none;
    border-radius: 8upx;
    font-size: 32upx;

    /* 禁用状态样式 */
    &[disabled] {
        background-color: #cccccc;
        color: #999999;
    }
}

/* 条件编译：平台特定样式 */
/* #ifdef H5 */
.container {
    max-width: 750upx;             /* H5端限制最大宽度 */
    margin: 0 auto;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.header {
    padding-top: 40upx;            /* 微信小程序适配 */
}
/* #endif */

/* #ifdef APP-PLUS */
.list-item {
    /* App端可以使用更复杂的阴影效果 */
    box-shadow: 0 4upx 20upx rgba(0, 0, 0, 0.15);
}
/* #endif */
</style>
```

## （二）组件开发

**自定义组件示例：**
```vue
<!-- components/product-card/product-card.vue -->
<template>
    <view class="product-card" @click="handleClick">
        <!-- 商品图片 -->
        <view class="image-container">
            <image
                :src="product.image"
                class="product-image"
                mode="aspectFill"
                @error="handleImageError"
            ></image>

            <!-- 标签：使用插槽支持自定义 -->
            <view v-if="product.tags && product.tags.length" class="tags">
                <text
                    v-for="tag in product.tags"
                    :key="tag"
                    class="tag"
                >{{tag}}</text>
            </view>
        </view>

        <!-- 商品信息 -->
        <view class="product-info">
            <text class="product-title">{{product.title}}</text>
            <text class="product-desc">{{product.description}}</text>

            <!-- 价格信息 -->
            <view class="price-container">
                <text class="current-price">¥{{product.price}}</text>
                <text
                    v-if="product.originalPrice && product.originalPrice > product.price"
                    class="original-price"
                >¥{{product.originalPrice}}</text>
            </view>

            <!-- 操作按钮：使用插槽支持自定义 -->
            <view class="actions">
                <slot name="actions">
                    <!-- 默认操作按钮 -->
                    <button
                        class="add-cart-btn"
                        size="mini"
                        @click.stop="handleAddCart"
                    >加入购物车</button>
                </slot>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'ProductCard',

    // 组件属性：定义组件接收的参数
    props: {
        // 商品数据
        product: {
            type: Object,
            required: true,
            default: () => ({})
        },

        // 卡片模式：list列表模式/grid网格模式
        mode: {
            type: String,
            default: 'list',
            validator: (value) => ['list', 'grid'].includes(value)
        },

        // 是否显示操作按钮
        showActions: {
            type: Boolean,
            default: true
        }
    },

    // 组件事件：定义组件向父组件发送的事件
    emits: ['click', 'add-cart', 'image-error'],

    computed: {
        // 计算属性：动态计算卡片样式类
        cardClass() {
            return [
                'product-card',
                `product-card--${this.mode}`,
                {
                    'product-card--no-actions': !this.showActions
                }
            ];
        }
    },

    methods: {
        // 卡片点击事件
        handleClick() {
            this.$emit('click', this.product);
        },

        // 加入购物车
        handleAddCart() {
            this.$emit('add-cart', this.product);

            // 显示成功提示
            uni.showToast({
                title: '已加入购物车',
                icon: 'success'
            });
        },

        // 图片加载错误
        handleImageError(e) {
            this.$emit('image-error', e);
            console.log('商品图片加载失败：', this.product.id);
        }
    }
}
</script>

<style lang="scss" scoped>
.product-card {
    background-color: #ffffff;
    border-radius: 12upx;
    overflow: hidden;
    box-shadow: 0 2upx 10upx rgba(0, 0, 0, 0.1);

    /* 列表模式样式 */
    &--list {
        display: flex;
        margin-bottom: 20upx;

        .image-container {
            width: 200upx;
            height: 200upx;
            flex-shrink: 0;
        }

        .product-info {
            flex: 1;
            padding: 20upx;
        }
    }

    /* 网格模式样式 */
    &--grid {
        display: flex;
        flex-direction: column;

        .image-container {
            width: 100%;
            height: 300upx;
        }

        .product-info {
            padding: 20upx;
        }
    }
}

.image-container {
    position: relative;

    .product-image {
        width: 100%;
        height: 100%;
        background-color: #f0f0f0;
    }

    .tags {
        position: absolute;
        top: 10upx;
        left: 10upx;
        display: flex;
        flex-wrap: wrap;
        gap: 8upx;

        .tag {
            padding: 4upx 8upx;
            background-color: rgba(255, 71, 87, 0.9);
            color: #ffffff;
            font-size: 20upx;
            border-radius: 4upx;
        }
    }
}

.product-info {
    display: flex;
    flex-direction: column;

    .product-title {
        font-size: 32upx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 8upx;

        /* 文本溢出处理 */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .product-desc {
        font-size: 28upx;
        color: #666666;
        line-height: 1.4;
        margin-bottom: 12upx;

        /* 多行文本溢出 */
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }

    .price-container {
        display: flex;
        align-items: baseline;
        margin-bottom: 12upx;

        .current-price {
            font-size: 36upx;
            font-weight: bold;
            color: #ff4757;
            margin-right: 12upx;
        }

        .original-price {
            font-size: 28upx;
            color: #999999;
            text-decoration: line-through;
        }
    }

    .actions {
        margin-top: auto;

        .add-cart-btn {
            background-color: #007aff;
            color: #ffffff;
            border: none;
            border-radius: 6upx;
            font-size: 28upx;
            padding: 12upx 24upx;
        }
    }
}

/* 无操作按钮时的样式调整 */
.product-card--no-actions {
    .product-info {
        .actions {
            display: none;
        }
    }
}
</style>
```

# 四、uni-app API和功能开发

## （一）网络请求和API调用

**统一的网络请求封装：**
```javascript
// common/api.js - API请求封装
class ApiService {
    constructor() {
        // 基础配置
        this.baseURL = 'https://api.example.com';
        this.timeout = 10000;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    // 统一请求方法：类似于axios的封装，但使用uni.request
    request(options) {
        return new Promise((resolve, reject) => {
            // 显示加载提示
            if (options.showLoading !== false) {
                uni.showLoading({
                    title: options.loadingText || '加载中...',
                    mask: true
                });
            }

            // 构建完整的请求配置
            const requestConfig = {
                url: this.baseURL + options.url,
                method: options.method || 'GET',
                data: options.data || {},
                header: {
                    ...this.defaultHeaders,
                    ...options.headers,
                    // 添加认证token
                    'Authorization': this.getToken()
                },
                timeout: options.timeout || this.timeout,

                success: (response) => {
                    uni.hideLoading();

                    // 统一的响应处理
                    if (response.statusCode === 200) {
                        const data = response.data;

                        // 业务逻辑判断
                        if (data.code === 0) {
                            resolve(data);
                        } else {
                            // 业务错误处理
                            this.handleBusinessError(data);
                            reject(new Error(data.message || '请求失败'));
                        }
                    } else {
                        // HTTP状态码错误
                        this.handleHttpError(response);
                        reject(new Error(`HTTP ${response.statusCode}`));
                    }
                },

                fail: (error) => {
                    uni.hideLoading();
                    console.error('网络请求失败：', error);

                    // 网络错误处理
                    this.handleNetworkError(error);
                    reject(error);
                }
            };

            // 发送请求
            uni.request(requestConfig);
        });
    }

    // GET请求
    get(url, params = {}, options = {}) {
        return this.request({
            url,
            method: 'GET',
            data: params,
            ...options
        });
    }

    // POST请求
    post(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'POST',
            data,
            ...options
        });
    }

    // PUT请求
    put(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'PUT',
            data,
            ...options
        });
    }

    // DELETE请求
    delete(url, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            ...options
        });
    }

    // 文件上传：uni-app的文件上传API
    uploadFile(filePath, options = {}) {
        return new Promise((resolve, reject) => {
            uni.showLoading({
                title: '上传中...',
                mask: true
            });

            uni.uploadFile({
                url: this.baseURL + (options.url || '/upload'),
                filePath: filePath,
                name: options.name || 'file',
                formData: options.formData || {},
                header: {
                    'Authorization': this.getToken(),
                    ...options.headers
                },

                success: (response) => {
                    uni.hideLoading();

                    try {
                        const data = JSON.parse(response.data);
                        if (data.code === 0) {
                            resolve(data);
                        } else {
                            reject(new Error(data.message || '上传失败'));
                        }
                    } catch (error) {
                        reject(new Error('响应解析失败'));
                    }
                },

                fail: (error) => {
                    uni.hideLoading();
                    console.error('文件上传失败：', error);
                    reject(error);
                }
            });
        });
    }

    // 获取认证token
    getToken() {
        // 从本地存储获取token
        return uni.getStorageSync('token') || '';
    }

    // 设置token
    setToken(token) {
        uni.setStorageSync('token', token);
    }

    // 清除token
    clearToken() {
        uni.removeStorageSync('token');
    }

    // 业务错误处理
    handleBusinessError(data) {
        switch (data.code) {
            case 401:
                // 未授权，跳转到登录页
                this.clearToken();
                uni.reLaunch({
                    url: '/pages/login/login'
                });
                break;
            case 403:
                // 权限不足
                uni.showToast({
                    title: '权限不足',
                    icon: 'none'
                });
                break;
            default:
                // 其他业务错误
                uni.showToast({
                    title: data.message || '操作失败',
                    icon: 'none'
                });
        }
    }

    // HTTP错误处理
    handleHttpError(response) {
        let message = '网络错误';

        switch (response.statusCode) {
            case 404:
                message = '请求的资源不存在';
                break;
            case 500:
                message = '服务器内部错误';
                break;
            case 502:
                message = '网关错误';
                break;
            case 503:
                message = '服务不可用';
                break;
            default:
                message = `网络错误 ${response.statusCode}`;
        }

        uni.showToast({
            title: message,
            icon: 'none'
        });
    }

    // 网络错误处理
    handleNetworkError(error) {
        let message = '网络连接失败';

        if (error.errMsg) {
            if (error.errMsg.includes('timeout')) {
                message = '请求超时';
            } else if (error.errMsg.includes('fail')) {
                message = '网络连接失败';
            }
        }

        uni.showToast({
            title: message,
            icon: 'none'
        });
    }
}

// 创建API实例
const api = new ApiService();

// 具体的API方法定义
export default {
    // 用户相关API
    user: {
        // 用户登录
        login(username, password) {
            return api.post('/auth/login', {
                username,
                password
            });
        },

        // 获取用户信息
        getUserInfo() {
            return api.get('/user/info');
        },

        // 更新用户信息
        updateUserInfo(userInfo) {
            return api.put('/user/info', userInfo);
        },

        // 用户注册
        register(userData) {
            return api.post('/auth/register', userData);
        }
    },

    // 商品相关API
    product: {
        // 获取商品列表
        getProductList(params) {
            return api.get('/products', params);
        },

        // 获取商品详情
        getProductDetail(id) {
            return api.get(`/products/${id}`);
        },

        // 搜索商品
        searchProducts(keyword, filters = {}) {
            return api.get('/products/search', {
                keyword,
                ...filters
            });
        }
    },

    // 订单相关API
    order: {
        // 创建订单
        createOrder(orderData) {
            return api.post('/orders', orderData);
        },

        // 获取订单列表
        getOrderList(params) {
            return api.get('/orders', params);
        },

        // 获取订单详情
        getOrderDetail(id) {
            return api.get(`/orders/${id}`);
        },

        // 取消订单
        cancelOrder(id) {
            return api.put(`/orders/${id}/cancel`);
        }
    },

    // 文件上传
    upload: {
        // 上传图片
        uploadImage(filePath) {
            return api.uploadFile(filePath, {
                url: '/upload/image',
                name: 'image'
            });
        },

        // 上传文件
        uploadFile(filePath, fileName) {
            return api.uploadFile(filePath, {
                url: '/upload/file',
                name: 'file',
                formData: {
                    fileName
                }
            });
        }
    }
};
```

## （二）状态管理（Vuex）

**Vuex状态管理配置：**
```javascript
// store/index.js - Vuex状态管理入口
import { createStore } from 'vuex'
import user from './modules/user'
import cart from './modules/cart'
import app from './modules/app'

const store = createStore({
    modules: {
        user,
        cart,
        app
    },

    // 全局状态
    state: {
        // 应用版本信息
        version: '1.0.0',
        // 网络状态
        networkType: 'unknown',
        // 设备信息
        systemInfo: {}
    },

    mutations: {
        // 设置网络状态
        SET_NETWORK_TYPE(state, networkType) {
            state.networkType = networkType;
        },

        // 设置设备信息
        SET_SYSTEM_INFO(state, systemInfo) {
            state.systemInfo = systemInfo;
        }
    },

    actions: {
        // 初始化应用状态
        async initApp({ commit, dispatch }) {
            try {
                // 获取设备信息
                const systemInfo = await new Promise((resolve) => {
                    uni.getSystemInfo({
                        success: resolve
                    });
                });
                commit('SET_SYSTEM_INFO', systemInfo);

                // 获取网络状态
                const networkInfo = await new Promise((resolve) => {
                    uni.getNetworkType({
                        success: resolve
                    });
                });
                commit('SET_NETWORK_TYPE', networkInfo.networkType);

                // 初始化用户状态
                await dispatch('user/initUserState');

            } catch (error) {
                console.error('应用初始化失败：', error);
            }
        }
    }
});

export default store;
```

```javascript
// store/modules/user.js - 用户状态管理模块
import api from '@/common/api'

const state = {
    // 用户信息
    userInfo: null,
    // 登录状态
    isLoggedIn: false,
    // 用户token
    token: '',
    // 用户权限
    permissions: []
};

const mutations = {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
        state.userInfo = userInfo;
        state.isLoggedIn = !!userInfo;
    },

    // 设置token
    SET_TOKEN(state, token) {
        state.token = token;
        // 同步到本地存储
        if (token) {
            uni.setStorageSync('token', token);
        } else {
            uni.removeStorageSync('token');
        }
    },

    // 设置用户权限
    SET_PERMISSIONS(state, permissions) {
        state.permissions = permissions;
    },

    // 清除用户状态
    CLEAR_USER_STATE(state) {
        state.userInfo = null;
        state.isLoggedIn = false;
        state.token = '';
        state.permissions = [];
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
    }
};

const actions = {
    // 用户登录
    async login({ commit }, { username, password }) {
        try {
            const response = await api.user.login(username, password);
            const { token, userInfo } = response.data;

            // 保存token和用户信息
            commit('SET_TOKEN', token);
            commit('SET_USER_INFO', userInfo);

            // 保存到本地存储
            uni.setStorageSync('userInfo', userInfo);

            return response;
        } catch (error) {
            console.error('登录失败：', error);
            throw error;
        }
    },

    // 用户登出
    async logout({ commit }) {
        try {
            // 调用登出API（可选）
            // await api.user.logout();

            // 清除用户状态
            commit('CLEAR_USER_STATE');

            // 跳转到登录页
            uni.reLaunch({
                url: '/pages/login/login'
            });
        } catch (error) {
            console.error('登出失败：', error);
            // 即使API调用失败，也要清除本地状态
            commit('CLEAR_USER_STATE');
        }
    },

    // 初始化用户状态
    async initUserState({ commit }) {
        try {
            // 从本地存储恢复token和用户信息
            const token = uni.getStorageSync('token');
            const userInfo = uni.getStorageSync('userInfo');

            if (token && userInfo) {
                commit('SET_TOKEN', token);
                commit('SET_USER_INFO', userInfo);

                // 验证token有效性（可选）
                try {
                    const response = await api.user.getUserInfo();
                    commit('SET_USER_INFO', response.data);
                } catch (error) {
                    // token无效，清除状态
                    console.warn('Token验证失败，清除用户状态');
                    commit('CLEAR_USER_STATE');
                }
            }
        } catch (error) {
            console.error('用户状态初始化失败：', error);
        }
    },

    // 更新用户信息
    async updateUserInfo({ commit }, userInfo) {
        try {
            const response = await api.user.updateUserInfo(userInfo);
            commit('SET_USER_INFO', response.data);
            uni.setStorageSync('userInfo', response.data);
            return response;
        } catch (error) {
            console.error('更新用户信息失败：', error);
            throw error;
        }
    }
};

const getters = {
    // 获取用户头像
    userAvatar: (state) => {
        return state.userInfo?.avatar || '/static/default-avatar.png';
    },

    // 获取用户昵称
    userNickname: (state) => {
        return state.userInfo?.nickname || '未设置昵称';
    },

    // 检查用户权限
    hasPermission: (state) => (permission) => {
        return state.permissions.includes(permission);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
```

## （三）条件编译

**平台差异化处理：**
```javascript
// common/platform.js - 平台差异化处理
export default {
    // 获取当前平台信息
    getPlatformInfo() {
        const platform = {
            // 基础平台判断
            isApp: false,
            isH5: false,
            isMp: false,

            // 具体平台判断
            isAppPlus: false,
            isAppPlusNvue: false,
            isMpWeixin: false,
            isMpAlipay: false,
            isMpBaidu: false,
            isMpToutiao: false,
            isMpQq: false,

            // 平台名称
            platformName: 'unknown'
        };

        // 条件编译：根据不同平台设置标识
        // #ifdef APP-PLUS
        platform.isApp = true;
        platform.isAppPlus = true;
        platform.platformName = 'app-plus';
        // #endif

        // #ifdef APP-PLUS-NVUE
        platform.isAppPlusNvue = true;
        platform.platformName = 'app-plus-nvue';
        // #endif

        // #ifdef H5
        platform.isH5 = true;
        platform.platformName = 'h5';
        // #endif

        // #ifdef MP-WEIXIN
        platform.isMp = true;
        platform.isMpWeixin = true;
        platform.platformName = 'mp-weixin';
        // #endif

        // #ifdef MP-ALIPAY
        platform.isMp = true;
        platform.isMpAlipay = true;
        platform.platformName = 'mp-alipay';
        // #endif

        // #ifdef MP-BAIDU
        platform.isMp = true;
        platform.isMpBaidu = true;
        platform.platformName = 'mp-baidu';
        // #endif

        // #ifdef MP-TOUTIAO
        platform.isMp = true;
        platform.isMpToutiao = true;
        platform.platformName = 'mp-toutiao';
        // #endif

        // #ifdef MP-QQ
        platform.isMp = true;
        platform.isMpQq = true;
        platform.platformName = 'mp-qq';
        // #endif

        return platform;
    },

    // 平台特定的API调用
    showActionSheet(options) {
        // 不同平台的操作菜单实现
        // #ifdef APP-PLUS
        // App端可以使用原生的ActionSheet
        plus.nativeUI.actionSheet(options);
        // #endif

        // #ifdef H5
        // H5端使用uni-app的通用API
        uni.showActionSheet(options);
        // #endif

        // #ifdef MP
        // 小程序端使用统一API
        uni.showActionSheet(options);
        // #endif
    },

    // 获取状态栏高度
    getStatusBarHeight() {
        let statusBarHeight = 0;

        // #ifdef APP-PLUS
        statusBarHeight = plus.navigator.getStatusbarHeight();
        // #endif

        // #ifdef H5
        statusBarHeight = 0; // H5端没有状态栏
        // #endif

        // #ifdef MP
        const systemInfo = uni.getSystemInfoSync();
        statusBarHeight = systemInfo.statusBarHeight || 0;
        // #endif

        return statusBarHeight;
    },

    // 设置导航栏
    setNavigationBar(options) {
        // #ifdef APP-PLUS
        // App端可以更灵活地设置导航栏
        const currentWebview = plus.webview.currentWebview();
        currentWebview.setStyle({
            titleNView: {
                backgroundColor: options.backgroundColor,
                titleText: options.title,
                titleColor: options.frontColor
            }
        });
        // #endif

        // #ifdef H5 || MP
        // H5和小程序使用统一API
        uni.setNavigationBarTitle({
            title: options.title
        });

        if (options.backgroundColor) {
            uni.setNavigationBarColor({
                frontColor: options.frontColor || '#000000',
                backgroundColor: options.backgroundColor
            });
        }
        // #endif
    }
};
```

# 五、性能优化与最佳实践

## （一）性能优化策略

**代码层面优化：**
```javascript
// 1. 图片懒加载和优化
// components/lazy-image/lazy-image.vue
<template>
    <view class="lazy-image-container">
        <image
            v-if="shouldLoad"
            :src="optimizedSrc"
            :class="imageClass"
            :mode="mode"
            @load="handleLoad"
            @error="handleError"
            :lazy-load="lazyLoad"
        />
        <view v-else class="placeholder">
            <text class="placeholder-text">{{placeholderText}}</text>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        src: String,
        mode: {
            type: String,
            default: 'aspectFill'
        },
        lazyLoad: {
            type: Boolean,
            default: true
        },
        placeholder: String,
        quality: {
            type: String,
            default: 'medium' // low, medium, high
        }
    },

    data() {
        return {
            shouldLoad: false,
            isLoaded: false,
            isError: false
        }
    },

    computed: {
        // 根据设备像素比和质量设置优化图片URL
        optimizedSrc() {
            if (!this.src) return '';

            const dpr = uni.getSystemInfoSync().pixelRatio || 1;
            const quality = this.getQualityParam();

            // 如果是CDN图片，添加优化参数
            if (this.src.includes('cdn.example.com')) {
                return `${this.src}?quality=${quality}&dpr=${dpr}`;
            }

            return this.src;
        },

        imageClass() {
            return [
                'lazy-image',
                {
                    'lazy-image--loaded': this.isLoaded,
                    'lazy-image--error': this.isError
                }
            ];
        },

        placeholderText() {
            return this.placeholder || '加载中...';
        }
    },

    mounted() {
        // 使用Intersection Observer API实现真正的懒加载（H5端）
        // #ifdef H5
        this.initIntersectionObserver();
        // #endif

        // 其他平台直接加载
        // #ifndef H5
        this.shouldLoad = true;
        // #endif
    },

    methods: {
        // 获取质量参数
        getQualityParam() {
            const qualityMap = {
                low: 60,
                medium: 80,
                high: 95
            };
            return qualityMap[this.quality] || 80;
        },

        // 初始化交叉观察器（H5端）
        initIntersectionObserver() {
            // #ifdef H5
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.shouldLoad = true;
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px' // 提前50px开始加载
            });

            observer.observe(this.$el);
            // #endif
        },

        handleLoad() {
            this.isLoaded = true;
            this.$emit('load');
        },

        handleError() {
            this.isError = true;
            this.$emit('error');
        }
    }
}
</script>
```

```javascript
// 2. 列表性能优化 - 虚拟滚动
// components/virtual-list/virtual-list.vue
<template>
    <scroll-view
        class="virtual-list"
        :scroll-y="true"
        :scroll-top="scrollTop"
        @scroll="handleScroll"
        :style="{ height: containerHeight + 'px' }"
    >
        <!-- 占位元素：撑开滚动区域 -->
        <view :style="{ height: totalHeight + 'px', position: 'relative' }">
            <!-- 可见区域的列表项 -->
            <view
                v-for="item in visibleItems"
                :key="item.index"
                class="virtual-item"
                :style="{
                    position: 'absolute',
                    top: item.top + 'px',
                    left: 0,
                    right: 0,
                    height: itemHeight + 'px'
                }"
            >
                <!-- 使用插槽渲染具体内容 -->
                <slot :item="item.data" :index="item.index"></slot>
            </view>
        </view>
    </scroll-view>
</template>

<script>
export default {
    props: {
        // 数据列表
        items: {
            type: Array,
            default: () => []
        },
        // 每项高度
        itemHeight: {
            type: Number,
            default: 100
        },
        // 容器高度
        containerHeight: {
            type: Number,
            default: 600
        },
        // 缓冲区大小
        bufferSize: {
            type: Number,
            default: 5
        }
    },

    data() {
        return {
            scrollTop: 0,
            startIndex: 0,
            endIndex: 0
        }
    },

    computed: {
        // 总高度
        totalHeight() {
            return this.items.length * this.itemHeight;
        },

        // 可见区域能显示的项目数量
        visibleCount() {
            return Math.ceil(this.containerHeight / this.itemHeight);
        },

        // 可见的列表项
        visibleItems() {
            const items = [];
            const start = Math.max(0, this.startIndex - this.bufferSize);
            const end = Math.min(this.items.length, this.endIndex + this.bufferSize);

            for (let i = start; i < end; i++) {
                items.push({
                    index: i,
                    data: this.items[i],
                    top: i * this.itemHeight
                });
            }

            return items;
        }
    },

    watch: {
        items: {
            handler() {
                this.updateVisibleRange();
            },
            immediate: true
        }
    },

    methods: {
        // 处理滚动事件
        handleScroll(e) {
            this.scrollTop = e.detail.scrollTop;
            this.updateVisibleRange();
        },

        // 更新可见范围
        updateVisibleRange() {
            this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
            this.endIndex = this.startIndex + this.visibleCount;
        },

        // 滚动到指定位置
        scrollToIndex(index) {
            const scrollTop = index * this.itemHeight;
            this.scrollTop = scrollTop;
        }
    }
}
</script>
```

```javascript
// 3. 防抖和节流工具函数
// common/utils.js
export const debounce = (func, wait, immediate = false) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(this, args);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// 使用示例：搜索防抖
export default {
    data() {
        return {
            searchKeyword: '',
            searchResults: []
        }
    },

    created() {
        // 创建防抖搜索函数
        this.debouncedSearch = debounce(this.performSearch, 300);
    },

    watch: {
        searchKeyword() {
            // 用户输入时触发防抖搜索
            this.debouncedSearch();
        }
    },

    methods: {
        async performSearch() {
            if (!this.searchKeyword.trim()) {
                this.searchResults = [];
                return;
            }

            try {
                const response = await this.$api.product.searchProducts(this.searchKeyword);
                this.searchResults = response.data.list;
            } catch (error) {
                console.error('搜索失败：', error);
            }
        }
    }
}
```

## （二）开发最佳实践

**代码规范和项目结构：**
```javascript
// 1. 统一的错误处理机制
// common/error-handler.js
class ErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.isReporting = false;
    }

    // 全局错误处理
    handleError(error, vm, info) {
        console.error('全局错误：', error, info);

        // 错误分类处理
        if (error.name === 'ChunkLoadError') {
            // 代码分割加载错误
            this.handleChunkLoadError(error);
        } else if (error.message && error.message.includes('Network Error')) {
            // 网络错误
            this.handleNetworkError(error);
        } else {
            // 其他错误
            this.handleGeneralError(error, vm, info);
        }

        // 错误上报（生产环境）
        if (process.env.NODE_ENV === 'production') {
            this.reportError(error, vm, info);
        }
    }

    // 处理代码分割加载错误
    handleChunkLoadError(error) {
        uni.showModal({
            title: '提示',
            content: '应用更新了，请重新启动应用',
            showCancel: false,
            success: () => {
                // #ifdef H5
                window.location.reload();
                // #endif

                // #ifdef APP-PLUS
                plus.runtime.restart();
                // #endif

                // #ifdef MP
                // 小程序无法重启，提示用户手动重启
                uni.showToast({
                    title: '请重新打开小程序',
                    icon: 'none'
                });
                // #endif
            }
        });
    }

    // 处理网络错误
    handleNetworkError(error) {
        uni.showToast({
            title: '网络连接异常',
            icon: 'none'
        });
    }

    // 处理一般错误
    handleGeneralError(error, vm, info) {
        // 开发环境显示详细错误信息
        if (process.env.NODE_ENV === 'development') {
            uni.showModal({
                title: '开发错误',
                content: `${error.message}\n${info}`,
                showCancel: false
            });
        } else {
            // 生产环境显示友好提示
            uni.showToast({
                title: '操作失败，请稍后重试',
                icon: 'none'
            });
        }
    }

    // 错误上报
    async reportError(error, vm, info) {
        if (this.isReporting) return;

        this.errorQueue.push({
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            info,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location?.href || 'app'
        });

        // 批量上报错误
        if (this.errorQueue.length >= 5) {
            await this.batchReportErrors();
        }
    }

    // 批量上报错误
    async batchReportErrors() {
        if (this.isReporting || this.errorQueue.length === 0) return;

        this.isReporting = true;

        try {
            // 调用错误上报API
            await uni.request({
                url: 'https://api.example.com/errors/report',
                method: 'POST',
                data: {
                    errors: this.errorQueue
                }
            });

            this.errorQueue = [];
        } catch (reportError) {
            console.error('错误上报失败：', reportError);
        } finally {
            this.isReporting = false;
        }
    }
}

export default new ErrorHandler();
```

```javascript
// 2. 统一的工具函数库
// common/utils.js
export default {
    // 格式化日期
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!date) return '';

        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        const second = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hour)
            .replace('mm', minute)
            .replace('ss', second);
    },

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 深拷贝
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // 验证手机号
    validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    },

    // 验证邮箱
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // 获取URL参数
    getUrlParams(url = window.location.href) {
        const params = {};
        const urlObj = new URL(url);

        for (const [key, value] of urlObj.searchParams) {
            params[key] = value;
        }

        return params;
    },

    // 数组去重
    uniqueArray(arr, key) {
        if (!key) {
            return [...new Set(arr)];
        }

        const seen = new Set();
        return arr.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    // 安全的JSON解析
    safeJsonParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (error) {
            console.warn('JSON解析失败：', error);
            return defaultValue;
        }
    },

    // 延迟执行
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 重试机制
    async retry(fn, maxAttempts = 3, delay = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                console.warn(`第${attempt}次尝试失败：`, error);

                if (attempt < maxAttempts) {
                    await this.sleep(delay * attempt);
                }
            }
        }

        throw lastError;
    }
};
```

**项目配置和部署：**
```javascript
// 3. 环境配置管理
// common/config.js
const configs = {
    // 开发环境
    development: {
        baseURL: 'https://dev-api.example.com',
        timeout: 10000,
        debug: true,
        logLevel: 'debug'
    },

    // 测试环境
    testing: {
        baseURL: 'https://test-api.example.com',
        timeout: 10000,
        debug: true,
        logLevel: 'info'
    },

    // 生产环境
    production: {
        baseURL: 'https://api.example.com',
        timeout: 8000,
        debug: false,
        logLevel: 'error'
    }
};

// 获取当前环境
const getEnvironment = () => {
    // #ifdef H5
    const hostname = window.location.hostname;
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
    } else if (hostname.includes('test')) {
        return 'testing';
    } else {
        return 'production';
    }
    // #endif

    // #ifdef APP-PLUS
    // App端根据打包配置判断
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
    // #endif

    // #ifdef MP
    // 小程序端根据版本类型判断
    const accountInfo = uni.getAccountInfoSync();
    const envVersion = accountInfo.miniProgram.envVersion;

    switch (envVersion) {
        case 'develop':
            return 'development';
        case 'trial':
            return 'testing';
        case 'release':
            return 'production';
        default:
            return 'development';
    }
    // #endif
};

const currentEnv = getEnvironment();
const config = configs[currentEnv];

export default {
    ...config,
    environment: currentEnv
};
```

# 六、总结与展望

## （一）uni-app开发总结

通过本文的详细介绍，我们全面了解了uni-app跨平台开发的核心概念和实践方法：

**技术优势总结：**
```
uni-app核心价值：

开发效率：
├── 一套代码多端运行，大幅提升开发效率
├── 基于Vue.js生态，学习成本低
├── 丰富的组件库和插件生态
└── 完善的开发工具链支持

跨平台能力：
├── 支持10+个平台的代码编译
├── 统一的API接口，屏蔽平台差异
├── 条件编译支持平台特定功能
└── 原生渲染性能，接近原生体验

生态完善：
├── DCloud官方持续维护和更新
├── 活跃的开发者社区
├── 丰富的第三方插件和组件
└── 完善的文档和教程资源
```

**适用场景建议：**
1. **中小型应用**：快速开发和部署多平台应用
2. **内容展示类应用**：新闻、电商、社交等信息展示
3. **企业级应用**：OA、CRM、ERP等企业内部系统
4. **原型验证**：快速验证产品概念和用户需求
5. **资源有限的团队**：人力和时间成本控制

**技术选型考虑：**
- **选择uni-app**：需要快速多端部署，团队熟悉Vue.js
- **选择原生开发**：对性能要求极高，需要深度定制
- **选择React Native**：团队熟悉React，主要针对移动端
- **选择Flutter**：对性能和UI一致性要求较高

## （二）发展趋势和展望

**技术发展方向：**
1. **性能持续优化**：编译器优化、运行时性能提升
2. **开发体验改进**：更好的调试工具、热重载、类型支持
3. **生态系统扩展**：更多平台支持、插件生态完善
4. **企业级特性**：更好的大型项目支持、团队协作工具

uni-app作为一个成熟的跨平台开发框架，为开发者提供了高效的多端开发解决方案。随着技术的不断发展和完善，相信uni-app将在跨平台开发领域发挥更重要的作用，帮助更多开发者实现"一套代码，多端运行"的开发目标。

# 参考资料

- [uni-app官方文档](https://uniapp.dcloud.net.cn/) - DCloud官方文档
- [Vue.js官方文档](https://vuejs.org/) - Vue.js框架文档
- [HBuilderX开发工具](https://www.dcloud.io/hbuilderx.html) - 官方IDE工具
- [uni-app插件市场](https://ext.dcloud.net.cn/) - 插件和组件资源
- [DCloud社区](https://ask.dcloud.net.cn/) - 开发者交流社区
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 小程序开发参考
- [移动端适配方案](https://github.com/amfe/lib-flexible) - 响应式设计参考
