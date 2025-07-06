---
title: 【前端】Vue2详解：经典的渐进式前端框架
date: 2024-01-15 10:00:00
tags: [Vue.js, 前端框架, JavaScript, Web开发]
categories: [前端技术, Vue.js]
description: 深入解析Vue 2框架的核心概念、特性和最佳实践，包括响应式系统、组件化开发、状态管理等内容
keywords: Vue2, 前端框架, 响应式, 组件化, Vuex, Vue Router
---

# 前言

Vue 2是一个渐进式的JavaScript前端框架，以其简洁的API设计、优秀的性能表现和丰富的生态系统而广受开发者喜爱。本文将深入探讨Vue 2的核心概念、特性和最佳实践，帮助开发者全面掌握这个经典的前端框架。

<!-- more -->

# 一、Vue 2基础概念

## （一）Vue实例

```javascript
// 创建Vue实例
var vm = new Vue({
    // 挂载点
    el: '#app',
    
    // 数据
    data: {
        message: 'Hello Vue 2!',
        count: 0,
        user: {
            name: 'John',
            age: 30
        }
    },
    
    // 计算属性
    computed: {
        reversedMessage: function() {
            return this.message.split('').reverse().join('');
        },
        
        userInfo: function() {
            return this.user.name + ' (' + this.user.age + '岁)';
        }
    },
    
    // 方法
    methods: {
        increment: function() {
            this.count++;
        },
        
        greet: function() {
            alert('Hello ' + this.user.name + '!');
        }
    },
    
    // 侦听器
    watch: {
        count: function(newVal, oldVal) {
            console.log('count changed from ' + oldVal + ' to ' + newVal);
        }
    }
});
```

```html
<!-- HTML模板 -->
<div id="app">
    <h1>{{ message }}</h1>
    <p>反转消息: {{ reversedMessage }}</p>
    <p>用户信息: {{ userInfo }}</p>
    
    <div>
        <p>计数: {{ count }}</p>
        <button @click="increment">增加</button>
    </div>
</div>
```

## （二）响应式原理

Vue 2使用Object.defineProperty()实现响应式系统：

```javascript
// 简化的响应式实现
function defineReactive(obj, key, val) {
    const dep = new Dep();
    
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            // 依赖收集
            if (Dep.target) {
                dep.depend();
            }
            return val;
        },
        set: function(newVal) {
            if (newVal === val) return;
            val = newVal;
            // 通知更新
            dep.notify();
        }
    });
}

// 依赖收集器
class Dep {
    constructor() {
        this.subs = [];
    }
    
    addSub(sub) {
        this.subs.push(sub);
    }
    
    depend() {
        if (Dep.target) {
            this.addSub(Dep.target);
        }
    }
    
    notify() {
        this.subs.forEach(sub => sub.update());
    }
}

// 观察者
class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.cb = cb;
        this.getter = typeof expOrFn === 'function' ? expOrFn : parsePath(expOrFn);
        this.value = this.get();
    }
    
    get() {
        Dep.target = this;
        const value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    }
    
    update() {
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, oldValue);
    }
}
```

# 二、Vue 2模板语法

## （一）插值表达式

```html
<div id="app">
    <!-- 文本插值 -->
    <p>{{ message }}</p>
    
    <!-- 原始HTML -->
    <div v-html="rawHtml"></div>
    
    <!-- 属性绑定 -->
    <div v-bind:id="dynamicId"></div>
    <div :id="dynamicId"></div> <!-- 简写 -->
    
    <!-- JavaScript表达式 -->
    <p>{{ number + 1 }}</p>
    <p>{{ ok ? 'YES' : 'NO' }}</p>
    <p>{{ message.split('').reverse().join('') }}</p>
    
    <!-- 函数调用 -->
    <p>{{ formatDate(new Date()) }}</p>
</div>
```

```javascript
new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue 2!',
        rawHtml: '<span style="color: red">红色文本</span>',
        dynamicId: 'my-element',
        number: 10,
        ok: true
    },
    
    methods: {
        formatDate: function(date) {
            return date.toLocaleDateString();
        }
    }
});
```

## （二）指令系统

```html
<div id="directive-app">
    <!-- v-if 条件渲染 -->
    <p v-if="showMessage">这是条件显示的消息</p>
    <p v-else>消息被隐藏了</p>
    
    <!-- v-show 条件显示 -->
    <p v-show="isVisible">这是v-show控制的内容</p>
    
    <!-- v-for 列表渲染 -->
    <ul>
        <li v-for="item in items" :key="item.id">
            {{ item.name }} - {{ item.price }}
        </li>
    </ul>
    
    <!-- v-for 遍历对象 -->
    <div v-for="(value, key) in user" :key="key">
        {{ key }}: {{ value }}
    </div>
    
    <!-- v-on 事件监听 -->
    <button v-on:click="handleClick">点击我</button>
    <button @click="handleClick">点击我 (简写)</button>
    
    <!-- 事件修饰符 -->
    <form @submit.prevent="onSubmit">
        <input @keyup.enter="onEnter" placeholder="按回车键">
        <button type="submit">提交</button>
    </form>
    
    <!-- v-model 双向绑定 -->
    <input v-model="inputValue" placeholder="输入文本">
    <p>输入的内容: {{ inputValue }}</p>
    
    <!-- 复选框 -->
    <input type="checkbox" v-model="checked" id="checkbox">
    <label for="checkbox">{{ checked }}</label>
    
    <!-- 单选按钮 -->
    <input type="radio" id="one" value="One" v-model="picked">
    <label for="one">One</label>
    <input type="radio" id="two" value="Two" v-model="picked">
    <label for="two">Two</label>
    <p>选择的值: {{ picked }}</p>
    
    <!-- 选择框 -->
    <select v-model="selected">
        <option disabled value="">请选择</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
    <p>选择的选项: {{ selected }}</p>
</div>
```

```javascript
new Vue({
    el: '#directive-app',
    data: {
        showMessage: true,
        isVisible: true,
        items: [
            { id: 1, name: '苹果', price: 5 },
            { id: 2, name: '香蕉', price: 3 },
            { id: 3, name: '橙子', price: 4 }
        ],
        user: {
            name: 'John',
            age: 30,
            city: 'New York'
        },
        inputValue: '',
        checked: false,
        picked: '',
        selected: ''
    },
    
    methods: {
        handleClick: function() {
            alert('按钮被点击了!');
        },
        
        onSubmit: function() {
            console.log('表单提交');
        },
        
        onEnter: function() {
            console.log('回车键被按下');
        }
    }
});
```

# 三、Vue 2组件系统

## （一）组件定义和使用

```javascript
// 全局组件注册
Vue.component('my-component', {
    props: ['title', 'content'],
    data: function() {
        return {
            count: 0
        };
    },
    template: `
        <div class="my-component">
            <h3>{{ title }}</h3>
            <p>{{ content }}</p>
            <p>点击次数: {{ count }}</p>
            <button @click="count++">点击我</button>
        </div>
    `
});

// 局部组件注册
var ChildComponent = {
    props: ['message'],
    template: '<p>{{ message }}</p>'
};

new Vue({
    el: '#app',
    components: {
        'child-component': ChildComponent
    },
    data: {
        parentMessage: '来自父组件的消息'
    }
});
```

## （二）组件通信

### 1. 父子组件通信

```javascript
// 子组件
Vue.component('todo-item', {
    props: ['todo'],
    template: `
        <li>
            {{ todo.text }}
            <button @click="$emit('remove')">删除</button>
        </li>
    `
});

// 父组件
Vue.component('todo-list', {
    data: function() {
        return {
            todos: [
                { id: 1, text: '学习Vue' },
                { id: 2, text: '写代码' },
                { id: 3, text: '睡觉' }
            ]
        };
    },
    methods: {
        removeTodo: function(index) {
            this.todos.splice(index, 1);
        }
    },
    template: `
        <ul>
            <todo-item
                v-for="(todo, index) in todos"
                :key="todo.id"
                :todo="todo"
                @remove="removeTodo(index)"
            ></todo-item>
        </ul>
    `
});
```

### 2. 兄弟组件通信（事件总线）

```javascript
// 创建事件总线
var EventBus = new Vue();

// 组件A
Vue.component('component-a', {
    data: function() {
        return {
            message: ''
        };
    },
    methods: {
        sendMessage: function() {
            EventBus.$emit('message-sent', this.message);
            this.message = '';
        }
    },
    template: `
        <div>
            <h3>组件A</h3>
            <input v-model="message" placeholder="输入消息">
            <button @click="sendMessage">发送消息</button>
        </div>
    `
});

// 组件B
Vue.component('component-b', {
    data: function() {
        return {
            receivedMessage: ''
        };
    },
    mounted: function() {
        var self = this;
        EventBus.$on('message-sent', function(message) {
            self.receivedMessage = message;
        });
    },
    beforeDestroy: function() {
        EventBus.$off('message-sent');
    },
    template: `
        <div>
            <h3>组件B</h3>
            <p>接收到的消息: {{ receivedMessage }}</p>
        </div>
    `
});
```

## （三）插槽系统

```javascript
// 基础插槽
Vue.component('alert-box', {
    template: `
        <div class="demo-alert-box">
            <strong>Error!</strong>
            <slot></slot>
        </div>
    `
});

// 具名插槽
Vue.component('base-layout', {
    template: `
        <div class="container">
            <header>
                <slot name="header"></slot>
            </header>
            <main>
                <slot></slot>
            </main>
            <footer>
                <slot name="footer"></slot>
            </footer>
        </div>
    `
});

// 作用域插槽
Vue.component('todo-list', {
    data: function() {
        return {
            todos: [
                { id: 1, text: '学习Vue', isComplete: false },
                { id: 2, text: '写代码', isComplete: true }
            ]
        };
    },
    template: `
        <ul>
            <li v-for="todo in todos" :key="todo.id">
                <slot :todo="todo">
                    {{ todo.text }}
                </slot>
            </li>
        </ul>
    `
});
```

```html
<!-- 使用插槽 -->
<div id="app">
    <!-- 基础插槽 -->
    <alert-box>
        Something bad happened.
    </alert-box>
    
    <!-- 具名插槽 -->
    <base-layout>
        <template v-slot:header>
            <h1>Here might be a page title</h1>
        </template>
        
        <p>A paragraph for the main content.</p>
        <p>And another one.</p>
        
        <template v-slot:footer>
            <p>Here's some contact info</p>
        </template>
    </base-layout>
    
    <!-- 作用域插槽 -->
    <todo-list>
        <template v-slot:default="slotProps">
            <span :class="{ completed: slotProps.todo.isComplete }">
                {{ slotProps.todo.text }}
            </span>
        </template>
    </todo-list>
</div>
```

# 四、Vue 2生命周期

## （一）生命周期钩子

```javascript
new Vue({
    el: '#lifecycle-app',
    data: {
        message: 'Hello Vue 2 Lifecycle!',
        items: []
    },
    
    // 创建前
    beforeCreate: function() {
        console.log('beforeCreate: 实例初始化之后，数据观测和事件配置之前');
        console.log('data:', this.message); // undefined
    },
    
    // 创建后
    created: function() {
        console.log('created: 实例创建完成，数据观测、属性和方法的运算已完成');
        console.log('data:', this.message); // Hello Vue 2 Lifecycle!
        
        // 可以进行数据请求
        this.fetchData();
    },
    
    // 挂载前
    beforeMount: function() {
        console.log('beforeMount: 挂载开始之前，render函数首次被调用');
        console.log('$el:', this.$el); // undefined
    },
    
    // 挂载后
    mounted: function() {
        console.log('mounted: 实例挂载到DOM上');
        console.log('$el:', this.$el); // DOM元素
        
        // 可以进行DOM操作
        this.initializeComponents();
    },
    
    // 更新前
    beforeUpdate: function() {
        console.log('beforeUpdate: 数据更新时调用，发生在虚拟DOM重新渲染之前');
    },
    
    // 更新后
    updated: function() {
        console.log('updated: 数据更新导致的虚拟DOM重新渲染后调用');
    },
    
    // 销毁前
    beforeDestroy: function() {
        console.log('beforeDestroy: 实例销毁之前调用');
        
        // 清理工作
        this.cleanup();
    },
    
    // 销毁后
    destroyed: function() {
        console.log('destroyed: 实例销毁后调用');
    },
    
    methods: {
        fetchData: function() {
            // 模拟数据请求
            setTimeout(() => {
                this.items = ['Item 1', 'Item 2', 'Item 3'];
            }, 1000);
        },
        
        initializeComponents: function() {
            // 初始化第三方组件
            console.log('初始化第三方组件');
        },
        
        cleanup: function() {
            // 清理定时器、事件监听器等
            console.log('清理资源');
        }
    }
});
```

## （二）生命周期应用场景

```javascript
Vue.component('data-table', {
    data: function() {
        return {
            data: [],
            loading: false,
            timer: null
        };
    },
    
    created: function() {
        // 组件创建时获取数据
        this.loadData();
    },
    
    mounted: function() {
        // 挂载后设置定时刷新
        this.timer = setInterval(() => {
            this.loadData();
        }, 30000); // 30秒刷新一次
        
        // 设置事件监听器
        window.addEventListener('resize', this.handleResize);
    },
    
    beforeDestroy: function() {
        // 销毁前清理定时器和事件监听器
        if (this.timer) {
            clearInterval(this.timer);
        }
        window.removeEventListener('resize', this.handleResize);
    },
    
    methods: {
        loadData: function() {
            this.loading = true;
            
            // 模拟API请求
            fetch('/api/data')
                .then(response => response.json())
                .then(data => {
                    this.data = data;
                    this.loading = false;
                })
                .catch(error => {
                    console.error('数据加载失败:', error);
                    this.loading = false;
                });
        },
        
        handleResize: function() {
            // 处理窗口大小变化
            console.log('窗口大小发生变化');
        }
    },
    
    template: `
        <div class="data-table">
            <div v-if="loading">加载中...</div>
            <table v-else>
                <tr v-for="item in data" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.value }}</td>
                </tr>
            </table>
        </div>
    `
});
```

# 五、Vue 2状态管理（Vuex）

## （一）Vuex基础

```javascript
// 安装Vuex
// npm install vuex@3

// store/index.js
const store = new Vuex.Store({
    // 状态
    state: {
        count: 0,
        user: null,
        todos: []
    },
    
    // 获取器（计算属性）
    getters: {
        doneTodos: function(state) {
            return state.todos.filter(function(todo) {
                return todo.done;
            });
        },
        
        doneTodosCount: function(state, getters) {
            return getters.doneTodos.length;
        },
        
        getTodoById: function(state) {
            return function(id) {
                return state.todos.find(function(todo) {
                    return todo.id === id;
                });
            };
        }
    },
    
    // 同步修改状态
    mutations: {
        INCREMENT: function(state) {
            state.count++;
        },
        
        SET_USER: function(state, user) {
            state.user = user;
        },
        
        ADD_TODO: function(state, todo) {
            state.todos.push(todo);
        },
        
        REMOVE_TODO: function(state, todoId) {
            const index = state.todos.findIndex(function(todo) {
                return todo.id === todoId;
            });
            if (index > -1) {
                state.todos.splice(index, 1);
            }
        },
        
        TOGGLE_TODO: function(state, todoId) {
            const todo = state.todos.find(function(todo) {
                return todo.id === todoId;
            });
            if (todo) {
                todo.done = !todo.done;
            }
        }
    },
    
    // 异步操作
    actions: {
        increment: function(context) {
            context.commit('INCREMENT');
        },
        
        fetchUser: function(context, userId) {
            return fetch('/api/users/' + userId)
                .then(function(response) {
                    return response.json();
                })
                .then(function(user) {
                    context.commit('SET_USER', user);
                    return user;
                });
        },
        
        addTodo: function(context, todoText) {
            const todo = {
                id: Date.now(),
                text: todoText,
                done: false
            };
            context.commit('ADD_TODO', todo);
        },
        
        removeTodo: function(context, todoId) {
            context.commit('REMOVE_TODO', todoId);
        },
        
        toggleTodo: function(context, todoId) {
            context.commit('TOGGLE_TODO', todoId);
        }
    }
});

// 在Vue实例中使用
new Vue({
    el: '#app',
    store: store,
    // ...
});
```

## （二）Vuex模块化

```javascript
// store/modules/user.js
const userModule = {
    namespaced: true,
    
    state: {
        profile: null,
        preferences: {}
    },
    
    getters: {
        fullName: function(state) {
            return state.profile ? state.profile.firstName + ' ' + state.profile.lastName : '';
        },
        
        isLoggedIn: function(state) {
            return !!state.profile;
        }
    },
    
    mutations: {
        SET_PROFILE: function(state, profile) {
            state.profile = profile;
        },
        
        UPDATE_PREFERENCES: function(state, preferences) {
            state.preferences = Object.assign({}, state.preferences, preferences);
        },
        
        CLEAR_USER: function(state) {
            state.profile = null;
            state.preferences = {};
        }
    },
    
    actions: {
        login: function(context, credentials) {
            return fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                context.commit('SET_PROFILE', data.user);
                localStorage.setItem('token', data.token);
                return data;
            });
        },
        
        logout: function(context) {
            context.commit('CLEAR_USER');
            localStorage.removeItem('token');
        },
        
        updatePreferences: function(context, preferences) {
            context.commit('UPDATE_PREFERENCES', preferences);
            
            // 同步到服务器
            return fetch('/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(preferences)
            });
        }
    }
};

// store/modules/products.js
const productsModule = {
    namespaced: true,
    
    state: {
        items: [],
        loading: false
    },
    
    getters: {
        availableProducts: function(state) {
            return state.items.filter(function(product) {
                return product.inventory > 0;
            });
        }
    },
    
    mutations: {
        SET_PRODUCTS: function(state, products) {
            state.items = products;
        },
        
        SET_LOADING: function(state, loading) {
            state.loading = loading;
        },
        
        DECREMENT_PRODUCT_INVENTORY: function(state, productId) {
            const product = state.items.find(function(p) {
                return p.id === productId;
            });
            if (product) {
                product.inventory--;
            }
        }
    },
    
    actions: {
        fetchProducts: function(context) {
            context.commit('SET_LOADING', true);
            
            return fetch('/api/products')
                .then(function(response) {
                    return response.json();
                })
                .then(function(products) {
                    context.commit('SET_PRODUCTS', products);
                    context.commit('SET_LOADING', false);
                })
                .catch(function(error) {
                    console.error('获取产品失败:', error);
                    context.commit('SET_LOADING', false);
                });
        }
    }
};

// store/index.js - 组合模块
const store = new Vuex.Store({
    modules: {
        user: userModule,
        products: productsModule
    }
});
```

## （三）在组件中使用Vuex

```javascript
// 使用mapState、mapGetters、mapMutations、mapActions
Vue.component('user-dashboard', {
    computed: {
        // 映射state
        ...Vuex.mapState({
            count: function(state) {
                return state.count;
            },
            todos: 'todos'
        }),
        
        // 映射getters
        ...Vuex.mapGetters([
            'doneTodos',
            'doneTodosCount'
        ]),
        
        // 映射模块化的state和getters
        ...Vuex.mapState('user', {
            userProfile: 'profile'
        }),
        
        ...Vuex.mapGetters('user', [
            'fullName',
            'isLoggedIn'
        ])
    },
    
    methods: {
        // 映射mutations
        ...Vuex.mapMutations([
            'INCREMENT',
            'ADD_TODO'
        ]),
        
        // 映射actions
        ...Vuex.mapActions([
            'fetchUser',
            'addTodo'
        ]),
        
        // 映射模块化的actions
        ...Vuex.mapActions('user', [
            'login',
            'logout'
        ]),
        
        // 自定义方法
        handleAddTodo: function() {
            if (this.newTodoText.trim()) {
                this.addTodo(this.newTodoText);
                this.newTodoText = '';
            }
        },
        
        handleLogin: function() {
            this.login({
                username: this.username,
                password: this.password
            })
            .then(function() {
                console.log('登录成功');
            })
            .catch(function(error) {
                console.error('登录失败:', error);
            });
        }
    },
    
    data: function() {
        return {
            newTodoText: '',
            username: '',
            password: ''
        };
    },
    
    template: `
        <div class="user-dashboard">
            <div v-if="isLoggedIn">
                <h2>欢迎, {{ fullName }}!</h2>
                <p>计数: {{ count }}</p>
                <button @click="INCREMENT">增加</button>
                
                <div class="todo-section">
                    <h3>待办事项 ({{ doneTodosCount }}/{{ todos.length }})</h3>
                    <input v-model="newTodoText" @keyup.enter="handleAddTodo" placeholder="添加新任务">
                    <button @click="handleAddTodo">添加</button>
                    
                    <ul>
                        <li v-for="todo in todos" :key="todo.id">
                            {{ todo.text }} - {{ todo.done ? '已完成' : '未完成' }}
                        </li>
                    </ul>
                </div>
                
                <button @click="logout">退出登录</button>
            </div>
            
            <div v-else class="login-form">
                <h2>请登录</h2>
                <input v-model="username" placeholder="用户名">
                <input v-model="password" type="password" placeholder="密码">
                <button @click="handleLogin">登录</button>
            </div>
        </div>
    `
});
```

# 六、Vue 2路由（Vue Router）

## （一）基础路由配置

```javascript
// 安装Vue Router
// npm install vue-router@3

// 1. 定义路由组件
const Home = { template: '<div>Home</div>' };
const About = { template: '<div>About</div>' };
const User = {
    template: '<div>User {{ $route.params.id }}</div>'
};

// 2. 定义路由
const routes = [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User },
    
    // 动态路由匹配
    { path: '/user/:id', component: User },
    { path: '/user/:id/profile', component: UserProfile },
    { path: '/user/:id/posts', component: UserPosts },
    
    // 嵌套路由
    {
        path: '/user/:id',
        component: User,
        children: [
            // 空路径表示默认子路由
            { path: '', component: UserHome },
            { path: 'profile', component: UserProfile },
            { path: 'posts', component: UserPosts }
        ]
    },
    
    // 命名路由
    {
        path: '/user/:userId',
        name: 'user',
        component: User
    },
    
    // 重定向
    { path: '/home', redirect: '/' },
    { path: '/user', redirect: to => {
        // 动态重定向
        return '/user/123';
    }},
    
    // 别名
    { path: '/', component: Home, alias: '/home' },
    
    // 404页面
    { path: '*', component: NotFound }
];

// 3. 创建router实例
const router = new VueRouter({
    mode: 'history', // 使用HTML5 History模式
    base: '/app/', // 应用的基路径
    routes: routes,
    
    // 滚动行为
    scrollBehavior: function(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { x: 0, y: 0 };
        }
    }
});

// 4. 创建和挂载根实例
const app = new Vue({
    router: router
}).$mount('#app');
```

## （二）路由守卫

```javascript
// 全局前置守卫
router.beforeEach(function(to, from, next) {
    console.log('导航到:', to.path);
    
    // 检查是否需要登录
    if (to.matched.some(function(record) {
        return record.meta.requiresAuth;
    })) {
        // 检查用户是否已登录
        if (!isLoggedIn()) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            });
        } else {
            next();
        }
    } else {
        next(); // 确保一定要调用 next()
    }
});

// 全局后置钩子
router.afterEach(function(to, from) {
    console.log('导航完成:', to.path);
    // 更新页面标题
    document.title = to.meta.title || 'My App';
});

// 路由独享的守卫
const routes = [
    {
        path: '/admin',
        component: Admin,
        beforeEnter: function(to, from, next) {
            // 检查管理员权限
            if (isAdmin()) {
                next();
            } else {
                next('/unauthorized');
            }
        }
    }
];

// 组件内的守卫
const UserProfile = {
    template: '...',
    
    beforeRouteEnter: function(to, from, next) {
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不能获取组件实例 `this`
        // 因为当守卫执行前，组件实例还没被创建
        getUserProfile(to.params.id, function(err, user) {
            if (err) {
                next(false);
            } else {
                next(function(vm) {
                    // 通过 `vm` 访问组件实例
                    vm.user = user;
                });
            }
        });
    },
    
    beforeRouteUpdate: function(to, from, next) {
        // 在当前路由改变，但是该组件被复用时调用
        // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
        // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
        // 可以访问组件实例 `this`
        this.user = getUserProfile(to.params.id);
        next();
    },
    
    beforeRouteLeave: function(to, from, next) {
        // 导航离开该组件的对应路由时调用
        // 可以访问组件实例 `this`
        if (this.hasUnsavedChanges) {
            const answer = window.confirm('你有未保存的更改，确定要离开吗？');
            if (answer) {
                next();
            } else {
                next(false);
            }
        } else {
            next();
        }
    }
};

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
}
```

## （三）在组件中使用路由

```javascript
// 编程式导航
Vue.component('navigation-example', {
    methods: {
        goToUser: function(userId) {
            // 字符串
            this.$router.push('/user/' + userId);
            
            // 对象
            this.$router.push({ path: '/user/' + userId });
            
            // 命名的路由
            this.$router.push({ name: 'user', params: { userId: userId } });
            
            // 带查询参数，变成 /register?plan=private
            this.$router.push({ path: '/register', query: { plan: 'private' } });
        },
        
        goBack: function() {
            this.$router.go(-1);
        },
        
        replaceRoute: function() {
            // 替换当前路由，不会向 history 添加新记录
            this.$router.replace('/new-path');
        }
    },
    
    template: `
        <div>
            <button @click="goToUser(123)">Go to User 123</button>
            <button @click="goBack">Go Back</button>
            <button @click="replaceRoute">Replace Route</button>
        </div>
    `
});

// 响应路由参数的变化
Vue.component('user-profile', {
    data: function() {
        return {
            user: null
        };
    },
    
    created: function() {
        this.fetchUser();
    },
    
    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': function(to, from) {
            this.fetchUser();
        }
    },
    
    methods: {
        fetchUser: function() {
            const userId = this.$route.params.id;
            // 获取用户数据
            fetch('/api/users/' + userId)
                .then(function(response) {
                    return response.json();
                })
                .then(function(user) {
                    this.user = user;
                }.bind(this));
        }
    },
    
    template: `
        <div v-if="user">
            <h2>{{ user.name }}</h2>
            <p>{{ user.email }}</p>
        </div>
    `
});

// 使用路由信息
Vue.component('route-info', {
    computed: {
        routeInfo: function() {
            return {
                path: this.$route.path,
                params: this.$route.params,
                query: this.$route.query,
                hash: this.$route.hash,
                fullPath: this.$route.fullPath,
                matched: this.$route.matched,
                name: this.$route.name
            };
        }
    },
    
    template: `
        <div>
            <h3>当前路由信息:</h3>
            <pre>{{ JSON.stringify(routeInfo, null, 2) }}</pre>
        </div>
    `
});
```

# 七、Vue 2响应式原理深入

## （一）响应式系统原理

```javascript
// 简化版的Vue 2响应式系统实现

// 依赖收集器
class Dep {
    constructor() {
        this.subs = [];
    }
    
    addSub(sub) {
        this.subs.push(sub);
    }
    
    depend() {
        if (Dep.target) {
            this.addSub(Dep.target);
        }
    }
    
    notify() {
        this.subs.forEach(sub => sub.update());
    }
}

Dep.target = null;

// 观察者
class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.cb = cb;
        this.getter = typeof expOrFn === 'function' ? expOrFn : parsePath(expOrFn);
        this.value = this.get();
    }
    
    get() {
        Dep.target = this;
        const value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    }
    
    update() {
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, oldValue);
    }
}

// 响应式处理
function defineReactive(obj, key, val) {
    const dep = new Dep();
    
    // 递归处理嵌套对象
    if (typeof val === 'object' && val !== null) {
        observe(val);
    }
    
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            // 依赖收集
            if (Dep.target) {
                dep.depend();
            }
            return val;
        },
        set: function(newVal) {
            if (newVal === val) return;
            
            // 新值也需要观察
            if (typeof newVal === 'object' && newVal !== null) {
                observe(newVal);
            }
            
            val = newVal;
            // 通知更新
            dep.notify();
        }
    });
}

function observe(value) {
    if (typeof value !== 'object' || value === null) {
        return;
    }
    
    Object.keys(value).forEach(key => {
        defineReactive(value, key, value[key]);
    });
}

// 解析路径
function parsePath(path) {
    const segments = path.split('.');
    return function(obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return;
            obj = obj[segments[i]];
        }
        return obj;
    };
}

// 使用示例
const data = {
    message: 'Hello Vue!',
    count: 0,
    user: {
        name: 'John',
        age: 30
    }
};

// 使数据响应式
Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key]);
});

// 创建观察者
new Watcher(data, 'message', (newVal, oldVal) => {
    console.log(`message changed: ${oldVal} -> ${newVal}`);
});

new Watcher(data, 'count', (newVal, oldVal) => {
    console.log(`count changed: ${oldVal} -> ${newVal}`);
});

// 测试响应式
data.message = 'Hello World!'; // 触发更新
data.count = 1; // 触发更新
```

## （二）数组响应式处理

```javascript
// Vue 2中数组响应式的实现
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

// 需要拦截的数组方法
const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];

methodsToPatch.forEach(function(method) {
    // 缓存原始方法
    const original = arrayProto[method];
    
    Object.defineProperty(arrayMethods, method, {
        value: function mutator(...args) {
            // 调用原始方法
            const result = original.apply(this, args);
            
            // 获取观察者
            const ob = this.__ob__;
            let inserted;
            
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    inserted = args.slice(2);
                    break;
            }
            
            // 对新插入的元素进行观察
            if (inserted) {
                ob.observeArray(inserted);
            }
            
            // 通知更新
            ob.dep.notify();
            
            return result;
        },
        enumerable: false,
        writable: true,
        configurable: true
    });
});

// 观察者类
class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();
        
        // 在对象上定义__ob__属性
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false,
            writable: true,
            configurable: true
        });
        
        if (Array.isArray(value)) {
            // 数组处理
            value.__proto__ = arrayMethods;
            this.observeArray(value);
        } else {
            // 对象处理
            this.walk(value);
        }
    }
    
    walk(obj) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]]);
        }
    }
    
    observeArray(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    }
}

function observe(value) {
    if (typeof value !== 'object' || value === null) {
        return;
    }
    
    let ob;
    if (value.__ob__ && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else {
        ob = new Observer(value);
    }
    
    return ob;
}

// 使用示例
const vm = new Vue({
    data: {
        items: ['apple', 'banana', 'orange'],
        users: [
            { name: 'Alice', age: 25 },
            { name: 'Bob', age: 30 }
        ]
    },
    
    watch: {
        items: {
            handler: function(newItems, oldItems) {
                console.log('items数组发生变化:', newItems);
            },
            deep: true
        },
        
        users: {
            handler: function(newUsers, oldUsers) {
                console.log('users数组发生变化:', newUsers);
            },
            deep: true
        }
    },
    
    methods: {
        addItem: function() {
            this.items.push('grape'); // 会触发更新
        },
        
        removeItem: function() {
            this.items.pop(); // 会触发更新
        },
        
        updateUser: function() {
            // 直接修改数组索引不会触发更新（Vue 2的限制）
            // this.users[0] = { name: 'Charlie', age: 35 }; // 不会触发更新
            
            // 正确的方式
            this.$set(this.users, 0, { name: 'Charlie', age: 35 });
            // 或者
            // this.users.splice(0, 1, { name: 'Charlie', age: 35 });
        }
    }
});
```

# 八、Vue 2性能优化

## （一）组件优化

```javascript
// 1. 使用Object.freeze()冻结数据
Vue.component('large-list', {
    data: function() {
        return {
            // 冻结大型数据，避免响应式处理
            staticData: Object.freeze([
                { id: 1, name: 'Item 1', value: 100 },
                { id: 2, name: 'Item 2', value: 200 },
                // ... 大量数据
            ]),
            
            // 需要响应式的数据
            selectedId: null,
            loading: false
        };
    },
    
    template: `
        <div class="large-list">
            <div 
                v-for="item in staticData" 
                :key="item.id"
                :class="{ selected: item.id === selectedId }"
                @click="selectedId = item.id"
            >
                {{ item.name }}: {{ item.value }}
            </div>
        </div>
    `
});

// 2. 使用$once监听一次性事件
Vue.component('expensive-component', {
    mounted: function() {
        // 只监听一次resize事件
        this.$once('hook:beforeDestroy', () => {
            window.removeEventListener('resize', this.handleResize);
        });
        
        window.addEventListener('resize', this.handleResize);
    },
    
    methods: {
        handleResize: function() {
            // 处理窗口大小变化
        }
    }
});

// 3. 使用$nextTick优化DOM操作
Vue.component('dom-optimizer', {
    data: function() {
        return {
            items: []
        };
    },
    
    methods: {
        addItems: function() {
            // 批量添加数据
            for (let i = 0; i < 1000; i++) {
                this.items.push({ id: i, name: `Item ${i}` });
            }
            
            // 等待DOM更新完成后执行
            this.$nextTick(() => {
                // 滚动到底部
                const container = this.$refs.container;
                container.scrollTop = container.scrollHeight;
            });
        }
    },
    
    template: `
        <div>
            <button @click="addItems">添加项目</button>
            <div ref="container" class="item-container">
                <div v-for="item in items" :key="item.id">
                    {{ item.name }}
                </div>
            </div>
        </div>
    `
});

// 4. 防抖和节流
Vue.component('search-input', {
    data: function() {
        return {
            searchQuery: '',
            searchResults: []
        };
    },
    
    created: function() {
        // 创建防抖函数
        this.debouncedSearch = this.debounce(this.performSearch, 300);
    },
    
    watch: {
        searchQuery: function() {
            this.debouncedSearch();
        }
    },
    
    methods: {
        // 防抖函数
        debounce: function(func, delay) {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        },
        
        // 节流函数
        throttle: function(func, delay) {
            let lastCall = 0;
            return function(...args) {
                const now = Date.now();
                if (now - lastCall >= delay) {
                    lastCall = now;
                    func.apply(this, args);
                }
            };
        },
        
        performSearch: function() {
            if (!this.searchQuery.trim()) {
                this.searchResults = [];
                return;
            }
            
            // 模拟API调用
            fetch(`/api/search?q=${encodeURIComponent(this.searchQuery)}`)
                .then(response => response.json())
                .then(results => {
                    this.searchResults = results;
                })
                .catch(error => {
                    console.error('搜索失败:', error);
                });
        }
    },
    
    template: `
        <div class="search-input">
            <input 
                v-model="searchQuery" 
                placeholder="搜索..."
                type="text"
            >
            <div class="search-results">
                <div 
                    v-for="result in searchResults" 
                    :key="result.id"
                    class="search-result"
                >
                    {{ result.title }}
                </div>
            </div>
        </div>
    `
});
```

## （二）列表优化

```javascript
// v-show vs v-if 的性能考虑
Vue.component('conditional-rendering', {
    data: function() {
        return {
            showExpensiveComponent: false,
            toggleFrequently: false
        };
    },
    
    template: `
        <div>
            <!-- 频繁切换使用v-show -->
            <expensive-component v-show="toggleFrequently"></expensive-component>
            
            <!-- 条件很少改变使用v-if -->
            <another-component v-if="showExpensiveComponent"></another-component>
        </div>
    `
});

// 列表渲染优化
Vue.component('optimized-list', {
    data: function() {
        return {
            items: [],
            filter: ''
        };
    },
    
    computed: {
        // 使用计算属性缓存过滤结果
        filteredItems: function() {
            if (!this.filter) {
                return this.items;
            }
            return this.items.filter(item => {
                return item.name.toLowerCase().includes(this.filter.toLowerCase());
            });
        }
    },
    
    template: `
        <div>
            <input v-model="filter" placeholder="过滤项目">
            <div 
                v-for="item in filteredItems" 
                :key="item.id"
                class="list-item"
            >
                {{ item.name }}
            </div>
        </div>
    `
});

// 组件懒加载
Vue.component('lazy-component', {
    data: function() {
        return {
            shouldLoad: false
        };
    },
    
    methods: {
        loadComponent: function() {
            this.shouldLoad = true;
        }
    },
    
    template: `
        <div>
            <button v-if="!shouldLoad" @click="loadComponent">
                加载组件
            </button>
            <heavy-component v-if="shouldLoad"></heavy-component>
        </div>
    `
});

// 事件监听器优化
Vue.component('event-optimization', {
    data: function() {
        return {
            items: []
        };
    },
    
    methods: {
        // 使用事件委托而不是为每个项目绑定事件
         handleItemClick: function(event) {
             if (event.target.classList.contains('item-button')) {
                 const itemId = event.target.dataset.itemId;
                 this.processItem(itemId);
             }
         },
         
         processItem: function(itemId) {
             console.log('处理项目:', itemId);
         }
     },
     
     template: `
         <div class="event-optimization">
             <!-- 使用事件委托 -->
             <div @click="handleItemClick" class="items-container">
                 <div 
                     v-for="item in items" 
                     :key="item.id"
                     class="item"
                 >
                     {{ item.name }}
                     <button 
                         class="item-button" 
                         :data-item-id="item.id"
                     >
                         处理
                     </button>
                 </div>
             </div>
         </div>
     `
 });
 ```
 
 # 八、Vue 2最佳实践
 
 ## （一）项目结构
 
 ```
 src/
 ├── api/                    # API接口
 │   ├── index.js
 │   ├── user.js
 │   └── product.js
 ├── assets/                 # 静态资源
 │   ├── images/
 │   ├── icons/
 │   └── fonts/
 ├── components/             # 公共组件
 │   ├── common/            # 通用组件
 │   │   ├── Button.vue
 │   │   ├── Modal.vue
 │   │   └── Loading.vue
 │   └── business/          # 业务组件
 │       ├── UserCard.vue
 │       └── ProductList.vue
 ├── directives/            # 自定义指令
 │   ├── index.js
 │   └── permission.js
 ├── filters/               # 过滤器
 │   ├── index.js
 │   └── date.js
 ├── layouts/               # 布局组件
 │   ├── DefaultLayout.vue
 │   └── AdminLayout.vue
 ├── mixins/                # 混入
 │   ├── index.js
 │   └── pagination.js
 ├── plugins/               # 插件
 │   ├── index.js
 │   └── axios.js
 ├── router/                # 路由
 │   ├── index.js
 │   └── modules/
 ├── store/                 # 状态管理
 │   ├── index.js
 │   └── modules/
 ├── styles/                # 样式
 │   ├── index.scss
 │   ├── variables.scss
 │   └── mixins.scss
 ├── utils/                 # 工具函数
 │   ├── index.js
 │   ├── request.js
 │   └── validation.js
 ├── views/                 # 页面组件
 │   ├── Home.vue
 │   ├── About.vue
 │   └── user/
 ├── App.vue
 └── main.js
 ```
 
 ## （二）编码规范
 
 ```javascript
 // 1. 组件命名规范
 // 好的命名
 Vue.component('UserProfile', { /* ... */ });
 Vue.component('ProductCard', { /* ... */ });
 Vue.component('ShoppingCart', { /* ... */ });
 
 // 避免的命名
 Vue.component('user', { /* ... */ });        // 太简单
 Vue.component('UserProfileComponent', { /* ... */ }); // 冗余
 
 // 2. Props定义规范
 Vue.component('user-profile', {
     props: {
         // 基础类型检查
         userId: {
             type: Number,
             required: true
         },
         
         // 多类型
         userName: {
             type: [String, Number],
             default: 'Anonymous'
         },
         
         // 对象类型
         userInfo: {
             type: Object,
             default: () => ({}),
             validator: function(value) {
                 return value.hasOwnProperty('name') && value.hasOwnProperty('email');
             }
         },
         
         // 数组类型
         tags: {
             type: Array,
             default: () => []
         },
         
         // 自定义验证
         status: {
             type: String,
             default: 'active',
             validator: function(value) {
                 return ['active', 'inactive', 'pending'].includes(value);
             }
         }
     }
 });
 
 // 3. 事件命名规范
 Vue.component('custom-input', {
     methods: {
         handleInput: function(value) {
             // 使用kebab-case命名事件
             this.$emit('input-change', value);
             this.$emit('value-updated', value);
         },
         
         handleSubmit: function() {
             this.$emit('form-submit', this.formData);
         }
     }
 });
 
 // 4. 计算属性和方法命名
 Vue.component('user-list', {
     data: function() {
         return {
             users: [],
             searchTerm: ''
         };
     },
     
     computed: {
         // 计算属性使用名词
         filteredUsers: function() {
             return this.users.filter(user => 
                 user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
             );
         },
         
         activeUsersCount: function() {
             return this.users.filter(user => user.active).length;
         }
     },
     
     methods: {
         // 方法使用动词
         fetchUsers: function() {
             // 获取用户数据
         },
         
         updateUser: function(userId, data) {
             // 更新用户信息
         },
         
         deleteUser: function(userId) {
             // 删除用户
         }
     }
 });
 ```
 
 ## （三）错误处理和调试
 
 ```javascript
 // 1. 全局错误处理
 Vue.config.errorHandler = function(err, vm, info) {
     console.error('Vue错误:', err);
     console.error('组件:', vm);
     console.error('错误信息:', info);
     
     // 发送错误报告到服务器
     if (process.env.NODE_ENV === 'production') {
         sendErrorReport({
             error: err.message,
             stack: err.stack,
             component: vm.$options.name || 'Unknown',
             info: info,
             url: window.location.href,
             userAgent: navigator.userAgent,
             timestamp: new Date().toISOString()
         });
     }
 };
 
 // 2. 组件错误边界
 Vue.component('error-boundary', {
     data: function() {
         return {
             hasError: false,
             error: null
         };
     },
     
     errorCaptured: function(err, instance, info) {
         this.hasError = true;
         this.error = {
             message: err.message,
             stack: err.stack,
             info: info
         };
         
         console.error('捕获到子组件错误:', err);
         
         // 返回false阻止错误继续传播
         return false;
     },
     
     methods: {
         retry: function() {
             this.hasError = false;
             this.error = null;
             this.$forceUpdate();
         }
     },
     
     template: `
         <div>
             <div v-if="hasError" class="error-boundary">
                 <h3>出现了错误</h3>
                 <p>{{ error.message }}</p>
                 <button @click="retry">重试</button>
                 <details v-if="$root.debug">
                     <summary>错误详情</summary>
                     <pre>{{ error.stack }}</pre>
                 </details>
             </div>
             <slot v-else></slot>
         </div>
     `
 });
 
 // 3. 开发环境调试工具
 if (process.env.NODE_ENV === 'development') {
     // 启用Vue DevTools
     Vue.config.devtools = true;
     
     // 性能追踪
     Vue.config.performance = true;
     
     // 添加全局调试方法
     Vue.prototype.$log = function(message, data) {
         console.group('🐛 ' + message);
         if (data) {
             console.log('数据:', data);
         }
         console.log('组件:', this.$options.name || 'Anonymous');
         console.log('路由:', this.$route ? this.$route.path : 'No route');
         console.groupEnd();
     };
 }
 ```
 
 # 九、总结
 
 Vue 2作为一个渐进式前端框架，具有以下核心优势：
 
 ## （一）主要特点
 
 1. **渐进式架构**：可以逐步引入，从简单的页面增强到复杂的单页应用
 2. **响应式数据绑定**：基于Object.defineProperty的响应式系统
 3. **组件化开发**：高度可复用的组件系统
 4. **虚拟DOM**：高效的DOM更新机制
 5. **丰富的生态系统**：Vue Router、Vuex、Vue CLI等官方工具
 
 ## （二）适用场景
 
 - **中小型项目**：快速开发，学习成本低
 - **渐进式改造**：可以逐步替换现有项目的部分功能
 - **原型开发**：快速验证想法和概念
 - **企业级应用**：配合完整的工具链可以构建大型应用
 
 ## （三）最佳实践总结
 
 1. **项目结构**：保持清晰的目录结构和命名规范
 2. **组件设计**：遵循单一职责原则，保持组件的可复用性
 3. **状态管理**：合理使用Vuex管理应用状态
 4. **性能优化**：使用计算属性、虚拟滚动、代码分割等技术
 5. **错误处理**：建立完善的错误处理和监控机制
 
 ## （四）发展趋势
 
 虽然Vue 3已经发布，但Vue 2仍然是一个稳定可靠的选择：
 
 - **长期支持**：Vue 2将继续维护到2023年底
 - **生态成熟**：拥有丰富的第三方库和工具
 - **学习价值**：理解Vue 2有助于更好地掌握Vue 3
 - **项目迁移**：为未来升级到Vue 3打下基础
 
 Vue 2以其简洁的API、优秀的性能和完善的生态系统，为前端开发者提供了一个优秀的开发体验。无论是初学者还是经验丰富的开发者，都能在Vue 2中找到适合自己的开发方式。
 
 ---
 
 *本文详细介绍了Vue 2的核心概念、实用技巧和最佳实践，希望能够帮助开发者更好地理解和使用这个优秀的前端框架。*