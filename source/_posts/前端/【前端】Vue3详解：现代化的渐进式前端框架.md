---
title: 【前端】Vue3详解：现代化的渐进式前端框架
categories: 前端
tags:
  - Vue3
  - JavaScript
  - 前端框架
  - Composition API
  - 响应式系统
---

# 前言

Vue 3是Vue.js框架的第三个主要版本，于2020年9月正式发布。作为一个渐进式JavaScript框架，Vue 3在保持Vue 2核心理念的基础上，引入了许多革命性的改进和新特性。本文将深入探讨Vue 3的核心概念、新特性、最佳实践以及与Vue 2的主要区别，帮助开发者全面掌握这个现代化的前端框架。

# 一、Vue 3概述

## （一）什么是Vue 3

Vue 3是一个用于构建用户界面的渐进式JavaScript框架。它专注于视图层，采用自底向上增量开发的设计理念。Vue 3的目标是通过尽可能简单的API实现响应式数据绑定和组合的视图组件。<mcreference link="https://www.runoob.com/vue3/vue3-tutorial.html" index="5">5</mcreference>

## （二）Vue 3的核心特性

### 1. 性能提升

相比Vue 2，Vue 3在性能方面有了显著提升：<mcreference link="https://blog.csdn.net/weixin_43365995/article/details/122837022" index="2">2</mcreference>

- **渲染性能**：提升1.3~2倍
- **打包体积**：更小的bundle size
- **内存使用**：更高效的内存管理

### 2. Tree-shaking支持

Vue 3支持Tree-shaking，这意味着可以按需引入功能，未使用的代码不会被打包到最终的bundle中：<mcreference link="https://segmentfault.com/a/1190000024580501" index="3">3</mcreference>

```javascript
// 按需引入Vue功能
import { createApp, ref, reactive } from 'vue'

// 只有使用到的功能会被打包
const app = createApp({})
```

### 3. 更好的TypeScript支持

Vue 3从底层重新设计，提供了更好的TypeScript支持，包括：

- 更准确的类型推断
- 更好的IDE支持
- 原生TypeScript支持

## （三）Vue 3的优势

1. **响应式数据绑定**：强大的响应式系统确保数据变化自动反映到视图
2. **组件化开发**：将应用分解为可复用的组件
3. **渐进式框架**：可以按需引入特性，适应不同规模的项目
4. **简洁的模板语法**：直观易学的模板语法
5. **虚拟DOM**：提高渲染性能
6. **丰富的生态系统**：活跃的社区和完善的工具链<mcreference link="https://www.runoob.com/vue3/vue3-tutorial.html" index="5">5</mcreference>

# 二、Composition API详解

## （一）什么是Composition API

Composition API是Vue 3引入的一组新的API，用于组织和复用组件逻辑。与传统的Options API不同，Composition API通过函数式的方式将相关的逻辑组合在一起。<mcreference link="https://blog.csdn.net/zhouzongxin94/article/details/144129406" index="2">2</mcreference>

## （二）Composition API的优势

1. **逻辑复用更便捷**：通过组合函数可以轻松复用和共享逻辑
2. **代码组织更清晰**：将相关的状态和行为放在同一个函数中
3. **TypeScript更友好**：提供更好的类型推断
4. **解决大型项目维护问题**：避免Options API在大型项目中的代码分散问题<mcreference link="https://bbs.itying.com/topic/5fbb25652c1a933ea0d78b36" index="1">1</mcreference>

## （三）setup()函数

setup()函数是Vue 3中专门为组件提供的新属性，它为使用Composition API提供了统一的入口：<mcreference link="https://segmentfault.com/a/1190000024580501" index="3">3</mcreference>

```javascript
// 基本的setup函数
export default {
  setup(props, context) {
    // Attribute (非响应式对象)
    console.log(context.attrs)
    
    // 插槽 (非响应式对象)
    console.log(context.slots)
    
    // 触发事件 (方法)
    console.log(context.emit)
    
    // 返回的数据和方法可以在模板中使用
    return {
      // 数据和方法
    }
  }
}
```

## （四）响应式API

### 1. ref()

`ref()`用于创建响应式的基本数据类型：

```javascript
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('Hello Vue 3')
    
    const increment = () => {
      count.value++
    }
    
    return {
      count,
      message,
      increment
    }
  }
}
```

### 2. reactive()

`reactive()`用于创建响应式的对象：

```javascript
import { reactive } from 'vue'

export default {
  setup() {
    const state = reactive({
      name: 'Vue 3',
      version: '3.0',
      features: ['Composition API', 'Multiple root nodes']
    })
    
    const updateName = (newName) => {
      state.name = newName
    }
    
    return {
      state,
      updateName
    }
  }
}
```

### 3. computed()

计算属性在Composition API中的使用：

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const firstName = ref('John')
    const lastName = ref('Doe')
    
    const fullName = computed(() => {
      return `${firstName.value} ${lastName.value}`
    })
    
    return {
      firstName,
      lastName,
      fullName
    }
  }
}
```

### 4. watch()和watchEffect()

监听器的使用：

```javascript
import { ref, watch, watchEffect } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('')
    
    // watch
    watch(count, (newValue, oldValue) => {
      console.log(`count changed from ${oldValue} to ${newValue}`)
    })
    
    // watchEffect
    watchEffect(() => {
      console.log(`count is ${count.value}`)
    })
    
    return {
      count,
      message
    }
  }
}
```

## （五）组合函数（Composables）

组合函数是利用Composition API封装和复用有状态逻辑的函数：<mcreference link="https://blog.csdn.net/zhouzongxin94/article/details/144129406" index="2">2</mcreference>

```javascript
// src/composables/useTodos.js
import { ref, computed } from 'vue'

export function useTodos() {
  const todos = ref([
    { id: 1, text: '学习 Vue3', completed: false },
    { id: 2, text: '编写 Composition API 教程', completed: false }
  ])
  
  const newTodo = ref('')
  
  const addTodo = () => {
    if (newTodo.value.trim()) {
      todos.value.push({
        id: Date.now(),
        text: newTodo.value,
        completed: false
      })
      newTodo.value = ''
    }
  }
  
  const removeTodo = (id) => {
    todos.value = todos.value.filter(todo => todo.id !== id)
  }
  
  const completedCount = computed(() => {
    return todos.value.filter(todo => todo.completed).length
  })
  
  const totalCount = computed(() => todos.value.length)
  
  return {
    todos,
    newTodo,
    addTodo,
    removeTodo,
    completedCount,
    totalCount
  }
}
```

在组件中使用组合函数：

```javascript
// TodoApp.vue
import { useTodos } from '@/composables/useTodos'

export default {
  setup() {
    const {
      todos,
      newTodo,
      addTodo,
      removeTodo,
      completedCount,
      totalCount
    } = useTodos()
    
    return {
      todos,
      newTodo,
      addTodo,
      removeTodo,
      completedCount,
      totalCount
    }
  }
}
```

# 三、响应式系统深度解析

## （一）Vue 3响应式系统原理

Vue 3使用Proxy API替代了Vue 2中的Object.defineProperty，实现了更强大的响应式系统。<mcreference link="https://cn.vuejs.org/guide/extras/reactivity-in-depth" index="3">3</mcreference>

### 1. Proxy vs Object.defineProperty

**Object.defineProperty的局限性：**<mcreference link="https://vue3js.cn/interview/vue3/proxy.html" index="4">4</mcreference>

- 无法检测对象属性的添加和删除
- 数组API方法无法监听
- 需要对每个属性进行遍历监听
- 深层嵌套对象需要深层监听，造成性能问题

**Proxy的优势：**<mcreference link="https://garden.songxingguo.com/C-Knowledge/%E5%89%8D%E7%AB%AF/%E8%81%8C%E4%B8%9A%E8%A7%84%E5%88%92/%E5%89%8D%E7%AB%AF%E9%9D%A2%E8%AF%95%E5%AE%9D%E5%85%B8/%E5%85%AB%E8%82%A1%E6%96%87/%E4%B8%BA%E4%BB%80%E4%B9%88-Vue3-%E7%94%A8-proxy-%E4%BB%A3%E6%9B%BF%E4%BA%86-Vue2-%E4%B8%AD%E7%9A%84-Object.defineProperty" index="5">5</mcreference>

- 可以监听整个对象，而不是单个属性
- 支持数组索引和length属性的监听
- 支持Map、Set、WeakMap、WeakSet等数据结构
- 有13种拦截方法，功能更强大

### 2. 响应式实现原理

```javascript
// 简化的响应式实现
function reactive(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  
  // Proxy相当于在对象外层加拦截
  const observed = new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      console.log(`获取${key}:${res}`)
      
      // 依赖收集
      track(target, key)
      
      // 如果是对象，递归代理
      return isObject(res) ? reactive(res) : res
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const res = Reflect.set(target, key, value, receiver)
      
      if (oldValue !== value) {
        console.log(`设置${key}:${value}`)
        // 触发更新
        trigger(target, key)
      }
      
      return res
    },
    
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key)
      console.log(`删除${key}:${res}`)
      
      // 触发更新
      trigger(target, key)
      return res
    }
  })
  
  return observed
}
```

### 3. 依赖收集和触发机制

```javascript
// 依赖收集和触发的简化实现
const targetMap = new WeakMap()
let activeEffect = null

function track(target, key) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  dep.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}

function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}
```

## （二）ref vs reactive

### 1. ref的实现原理

```javascript
function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(refObject, 'value')
    }
  }
  return refObject
}
```

### 2. 使用场景对比

```javascript
// ref适用于基本数据类型
const count = ref(0)
const message = ref('hello')
const isVisible = ref(true)

// reactive适用于对象和数组
const state = reactive({
  user: {
    name: 'John',
    age: 30
  },
  todos: []
})

// 访问方式不同
console.log(count.value) // ref需要.value
console.log(state.user.name) // reactive直接访问
```

### 3. 响应式转换工具

```javascript
import { 
  ref, 
  reactive, 
  toRef, 
  toRefs, 
  unref, 
  isRef, 
  isReactive 
} from 'vue'

const state = reactive({
  name: 'Vue',
  version: 3
})

// toRef: 将reactive对象的属性转为ref
const name = toRef(state, 'name')

// toRefs: 将reactive对象的所有属性转为ref
const { name: nameRef, version: versionRef } = toRefs(state)

// unref: 获取ref的值，如果不是ref则直接返回
const value = unref(name) // 等同于 isRef(name) ? name.value : name

// 类型检查
console.log(isRef(name)) // true
console.log(isReactive(state)) // true
```

## （三）Vue 3.2响应式优化

Vue 3.2对响应式系统进行了进一步优化：<mcreference link="https://vue-js.com/topic/61403f1861c8f900316ae580" index="1">1</mcreference>

1. **更高效的ref实现**：读取性能提升260%，写入性能提升50%
2. **位标记优化**：使用位运算优化依赖追踪
3. **effect嵌套优化**：更好地处理effect嵌套场景

# 四、新增组件和特性

## （一）Fragment（片段）

Vue 3支持组件有多个根节点，不再需要单一根元素：

```vue
<!-- Vue 2中必须有单一根元素 -->
<template>
  <div>
    <header>Header</header>
    <main>Main content</main>
    <footer>Footer</footer>
  </div>
</template>

<!-- Vue 3中可以有多个根节点 -->
<template>
  <header>Header</header>
  <main>Main content</main>
  <footer>Footer</footer>
</template>
```

## （二）Teleport（传送门）

Teleport允许我们将组件的一部分模板"传送"到DOM中的其他位置：

```vue
<template>
  <div class="modal-container">
    <button @click="showModal = true">打开模态框</button>
    
    <!-- 将模态框传送到body下 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h3>模态框标题</h3>
          <p>模态框内容</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const showModal = ref(false)
    
    return {
      showModal
    }
  }
}
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
```

## （三）Suspense（悬念）

Suspense让组件在渲染之前进行"等待"，并在等待时显示fallback内容：<mcreference link="https://segmentfault.com/a/1190000024580501" index="3">3</mcreference>

```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中的fallback内容 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// 定义异步组件
const AsyncComponent = defineAsyncComponent(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        template: '<div>异步组件加载完成！</div>'
      })
    }, 2000)
  })
})

export default {
  components: {
    AsyncComponent
  }
}
</script>
```

### 异步组件的高级用法

```javascript
import { defineAsyncComponent } from 'vue'

// 带选项的异步组件
const AsyncComponent = defineAsyncComponent({
  // 工厂函数
  loader: () => import('./AsyncComponent.vue'),
  
  // 加载异步组件时使用的组件
  loadingComponent: LoadingComponent,
  
  // 展示加载组件前的延迟时间，默认为 200ms
  delay: 200,
  
  // 加载失败后展示的组件
  errorComponent: ErrorComponent,
  
  // 如果提供了一个 timeout 时间限制，并超时了
  // 也会显示这里配置的报错组件，默认值是：Infinity
  timeout: 3000
})
```

# 五、Vue 3与Vue 2的主要区别

## （一）API设计变化

### 1. 全局API变化

```javascript
// Vue 2
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(SomePlugin)
Vue.mixin(SomeMixin)
Vue.component('GlobalComponent', SomeComponent)

new Vue({
  render: h => h(App)
}).$mount('#app')

// Vue 3
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.globalProperties.customProperty = 'custom value'
app.use(SomePlugin)
app.mixin(SomeMixin)
app.component('GlobalComponent', SomeComponent)

app.mount('#app')
```

### 2. 组件定义变化

```javascript
// Vue 2 Options API
export default {
  data() {
    return {
      count: 0,
      message: 'Hello'
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('Component mounted')
  }
}

// Vue 3 Composition API
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('Hello')
    
    const doubleCount = computed(() => count.value * 2)
    
    const increment = () => {
      count.value++
    }
    
    onMounted(() => {
      console.log('Component mounted')
    })
    
    return {
      count,
      message,
      doubleCount,
      increment
    }
  }
}
```

## （二）生命周期变化

```javascript
// Vue 2生命周期
export default {
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}

// Vue 3 Composition API生命周期
import { 
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

export default {
  setup() {
    // 注意：没有beforeCreate和created对应的组合式API
    // 因为setup()就相当于这两个钩子
    
    onBeforeMount(() => {
      console.log('Before mount')
    })
    
    onMounted(() => {
      console.log('Mounted')
    })
    
    onBeforeUpdate(() => {
      console.log('Before update')
    })
    
    onUpdated(() => {
      console.log('Updated')
    })
    
    onBeforeUnmount(() => {
      console.log('Before unmount')
    })
    
    onUnmounted(() => {
      console.log('Unmounted')
    })
  }
}
```

## （三）v-model变化

Vue 3中的v-model有了重大改变：<mcreference link="https://vue-js.com/topic/608290144590fe0031e5977d" index="3">3</mcreference>

```javascript
// Vue 2中的v-model
// 父组件
<CustomInput v-model="searchText" />

// 子组件
export default {
  props: ['value'],
  methods: {
    updateValue(value) {
      this.$emit('input', value)
    }
  }
}

// Vue 3中的v-model
// 父组件
<CustomInput v-model="searchText" />

// 子组件
export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value)
    }
  }
}

// Vue 3支持多个v-model
<UserName
  v-model:first-name="firstName"
  v-model:last-name="lastName"
/>
```

## （四）移除的特性

1. **过滤器（Filters）**：Vue 3中移除了过滤器，建议使用计算属性或方法替代
2. **$children**：移除了$children属性
3. **事件API**：移除了$on、$off、$once等事件API
4. **内联模板**：移除了inline-template特性

# 六、Vue 3生态系统

## （一）官方库

### 1. Vue Router 4

```javascript
// 安装
npm install vue-router@4

// 使用
import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import About from './components/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 2. Pinia（状态管理）

Pinia是Vue 3推荐的状态管理库，替代Vuex：

```javascript
// 安装
npm install pinia

// 定义store
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    }
  }
})

// 在组件中使用
import { useCounterStore } from '@/stores/counter'

export default {
  setup() {
    const counter = useCounterStore()
    
    return {
      counter
    }
  }
}
```

### 3. Vue DevTools

Vue 3专用的开发者工具，支持：
- Composition API调试
- 时间旅行调试
- 组件检查器
- 性能分析

## （二）构建工具

### 1. Vite

Vite是Vue 3推荐的构建工具：<mcreference link="https://cn.vite.dev/guide/" index="3">3</mcreference>

```bash
# 创建Vue 3项目
npm create vite@latest my-vue-app -- --template vue

# 或者使用TypeScript模板
npm create vite@latest my-vue-app -- --template vue-ts
```

Vite的特点：
- 极快的冷启动
- 即时的模块热更新
- 真正的按需编译
- 丰富的插件生态

### 2. Vite配置示例

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'axios']
        }
      }
    }
  }
})
```

# 七、Vue 3最佳实践

## （一）组件设计原则

### 1. 单一职责原则

```vue
<!-- 好的做法：职责单一的组件 -->
<template>
  <div class="user-card">
    <img :src="user.avatar" :alt="user.name" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  }
}
</script>
```

### 2. Props验证

```javascript
export default {
  props: {
    // 基础类型检查
    title: String,
    
    // 多种可能的类型
    count: [Number, String],
    
    // 必填的字符串
    message: {
      type: String,
      required: true
    },
    
    // 带有默认值的数字
    size: {
      type: Number,
      default: 100
    },
    
    // 带有默认值的对象
    user: {
      type: Object,
      default: () => ({
        name: 'Guest',
        email: ''
      })
    },
    
    // 自定义验证函数
    status: {
      type: String,
      validator: (value) => {
        return ['pending', 'success', 'error'].includes(value)
      }
    }
  }
}
```

### 3. 事件命名规范

```vue
<template>
  <button @click="handleClick">点击我</button>
</template>

<script>
export default {
  emits: {
    // 验证事件
    'user-updated': (payload) => {
      return payload && typeof payload.id === 'number'
    },
    
    // 简单声明
    'item-selected': null
  },
  
  methods: {
    handleClick() {
      // 使用kebab-case命名事件
      this.$emit('user-updated', { id: 1, name: 'John' })
    }
  }
}
</script>
```

## （二）Composition API最佳实践

### 1. 逻辑分组

```javascript
// 好的做法：按功能分组
export default {
  setup() {
    // 用户相关逻辑
    const { user, updateUser, fetchUser } = useUser()
    
    // 搜索相关逻辑
    const { searchQuery, searchResults, performSearch } = useSearch()
    
    // 分页相关逻辑
    const { currentPage, totalPages, changePage } = usePagination()
    
    return {
      // 用户
      user,
      updateUser,
      fetchUser,
      
      // 搜索
      searchQuery,
      searchResults,
      performSearch,
      
      // 分页
      currentPage,
      totalPages,
      changePage
    }
  }
}
```

### 2. 组合函数设计

```javascript
// composables/useApi.js
import { ref, reactive } from 'vue'
import axios from 'axios'

export function useApi(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)
  
  const execute = async (config = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios({
        url,
        ...config
      })
      
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    data: readonly(data),
    error: readonly(error),
    loading: readonly(loading),
    execute
  }
}

// 使用
export default {
  setup() {
    const { data: users, loading, error, execute } = useApi('/api/users')
    
    const fetchUsers = () => execute({ method: 'GET' })
    
    onMounted(fetchUsers)
    
    return {
      users,
      loading,
      error,
      fetchUsers
    }
  }
}
```

### 3. 响应式数据管理

```javascript
// 好的做法：合理使用ref和reactive
export default {
  setup() {
    // 基本类型使用ref
    const count = ref(0)
    const message = ref('')
    const isVisible = ref(true)
    
    // 对象使用reactive
    const form = reactive({
      name: '',
      email: '',
      age: 0
    })
    
    // 数组使用reactive
    const items = reactive([])
    
    // 避免解构reactive对象
    // 错误做法
    // const { name, email } = form // 失去响应性
    
    // 正确做法
    const { name, email } = toRefs(form)
    
    return {
      count,
      message,
      isVisible,
      form,
      items,
      name,
      email
    }
  }
}
```

## （三）性能优化

### 1. 组件懒加载

```javascript
// 路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

// 组件懒加载
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    HeavyComponent: defineAsyncComponent(() => 
      import('@/components/HeavyComponent.vue')
    )
  }
}
```

### 2. 使用v-memo优化列表渲染

```vue
<template>
  <div>
    <!-- 使用v-memo缓存列表项 -->
    <div 
      v-for="item in list" 
      :key="item.id"
      v-memo="[item.id, item.name, item.status]"
    >
      <span>{{ item.name }}</span>
      <span>{{ item.status }}</span>
    </div>
  </div>
</template>
```

### 3. 合理使用计算属性

```javascript
export default {
  setup() {
    const items = ref([])
    const filter = ref('')
    
    // 使用计算属性缓存过滤结果
    const filteredItems = computed(() => {
      if (!filter.value) return items.value
      
      return items.value.filter(item => 
        item.name.toLowerCase().includes(filter.value.toLowerCase())
      )
    })
    
    return {
      items,
      filter,
      filteredItems
    }
  }
}
```

# 八、Vue 3项目实战

## （一）项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
│   ├── common/      # 通用组件
│   └── ui/          # UI组件
├── composables/     # 组合函数
├── directives/      # 自定义指令
├── plugins/         # 插件
├── router/          # 路由配置
├── stores/          # 状态管理
├── utils/           # 工具函数
├── views/           # 页面组件
├── App.vue          # 根组件
└── main.js          # 入口文件
```

## （二）实战示例：Todo应用

### 1. 创建Todo Store

```javascript
// stores/todos.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref([])
  const filter = ref('all') // all, active, completed
  
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed)
      case 'completed':
        return todos.value.filter(todo => todo.completed)
      default:
        return todos.value
    }
  })
  
  const activeTodosCount = computed(() => {
    return todos.value.filter(todo => !todo.completed).length
  })
  
  const addTodo = (text) => {
    todos.value.push({
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date()
    })
  }
  
  const removeTodo = (id) => {
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
  }
  
  const toggleTodo = (id) => {
    const todo = todos.value.find(todo => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }
  
  const clearCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
  }
  
  const setFilter = (newFilter) => {
    filter.value = newFilter
  }
  
  return {
    todos,
    filter,
    filteredTodos,
    activeTodosCount,
    addTodo,
    removeTodo,
    toggleTodo,
    clearCompleted,
    setFilter
  }
})
```

### 2. Todo组件

```vue
<!-- components/TodoItem.vue -->
<template>
  <li class="todo-item" :class="{ completed: todo.completed }">
    <input 
      type="checkbox" 
      :checked="todo.completed"
      @change="$emit('toggle', todo.id)"
    />
    
    <span 
      v-if="!editing"
      class="todo-text"
      @dblclick="startEdit"
    >
      {{ todo.text }}
    </span>
    
    <input 
      v-else
      ref="editInput"
      v-model="editText"
      class="edit-input"
      @blur="finishEdit"
      @keyup.enter="finishEdit"
      @keyup.esc="cancelEdit"
    />
    
    <button 
      class="delete-btn"
      @click="$emit('remove', todo.id)"
    >
      ×
    </button>
  </li>
</template>

<script>
import { ref, nextTick } from 'vue'

export default {
  props: {
    todo: {
      type: Object,
      required: true
    }
  },
  
  emits: ['toggle', 'remove', 'update'],
  
  setup(props, { emit }) {
    const editing = ref(false)
    const editText = ref('')
    const editInput = ref(null)
    
    const startEdit = () => {
      editing.value = true
      editText.value = props.todo.text
      
      nextTick(() => {
        editInput.value?.focus()
      })
    }
    
    const finishEdit = () => {
      if (editing.value) {
        const text = editText.value.trim()
        if (text) {
          emit('update', props.todo.id, text)
        } else {
          emit('remove', props.todo.id)
        }
        editing.value = false
      }
    }
    
    const cancelEdit = () => {
      editing.value = false
      editText.value = props.todo.text
    }
    
    return {
      editing,
      editText,
      editInput,
      startEdit,
      finishEdit,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-text {
  flex: 1;
  margin: 0 10px;
  cursor: pointer;
}

.edit-input {
  flex: 1;
  margin: 0 10px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.delete-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px 10px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #ff3838;
}
</style>
```

### 3. 主应用组件

```vue
<!-- App.vue -->
<template>
  <div class="todo-app">
    <header class="header">
      <h1>Todo App</h1>
      <input 
        v-model="newTodo"
        class="new-todo"
        placeholder="What needs to be done?"
        @keyup.enter="addTodo"
      />
    </header>
    
    <main class="main" v-if="todos.length">
      <ul class="todo-list">
        <TodoItem 
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="toggleTodo"
          @remove="removeTodo"
          @update="updateTodo"
        />
      </ul>
    </main>
    
    <footer class="footer" v-if="todos.length">
      <span class="todo-count">
        {{ activeTodosCount }} item{{ activeTodosCount !== 1 ? 's' : '' }} left
      </span>
      
      <div class="filters">
        <button 
          v-for="filterName in ['all', 'active', 'completed']"
          :key="filterName"
          :class="{ active: filter === filterName }"
          @click="setFilter(filterName)"
        >
          {{ filterName }}
        </button>
      </div>
      
      <button 
        v-if="todos.length > activeTodosCount"
        class="clear-completed"
        @click="clearCompleted"
      >
        Clear completed
      </button>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTodosStore } from '@/stores/todos'
import TodoItem from '@/components/TodoItem.vue'

export default {
  components: {
    TodoItem
  },
  
  setup() {
    const todosStore = useTodosStore()
    const newTodo = ref('')
    
    const {
      todos,
      filter,
      filteredTodos,
      activeTodosCount
    } = storeToRefs(todosStore)
    
    const {
      addTodo: addTodoToStore,
      removeTodo,
      toggleTodo,
      clearCompleted,
      setFilter
    } = todosStore
    
    const addTodo = () => {
      const text = newTodo.value.trim()
      if (text) {
        addTodoToStore(text)
        newTodo.value = ''
      }
    }
    
    const updateTodo = (id, text) => {
      const todo = todos.value.find(t => t.id === id)
      if (todo) {
        todo.text = text
      }
    }
    
    return {
      newTodo,
      todos,
      filter,
      filteredTodos,
      activeTodosCount,
      addTodo,
      removeTodo,
      toggleTodo,
      updateTodo,
      clearCompleted,
      setFilter
    }
  }
}
</script>

<style>
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.new-todo {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-top: 20px;
}

.filters button {
  margin: 0 5px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  cursor: pointer;
}

.filters button.active {
  background: #007bff;
  color: white;
}

.clear-completed {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  cursor: pointer;
}

.clear-completed:hover {
  background: #f8f9fa;
}
</style>
```

# 九、构建与部署

## （一）Vite构建配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将Vue相关库打包到vendor chunk
          vendor: ['vue', 'vue-router', 'pinia'],
          
          // 将UI库单独打包
          ui: ['element-plus'],
          
          // 将工具库单独打包
          utils: ['lodash', 'axios', 'dayjs']
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## （二）性能优化配置

### 1. 静态资源优化

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    
    // 打包分析
    visualizer({
      filename: 'dist/stats.html',
      open: true
    }),
    
    // Gzip压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  
  build: {
    rollupOptions: {
      output: {
        // 静态资源分类
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts'
          }
          
          return `assets/${extType}/[name]-[hash][extname]`
        },
        
        // JS文件分类
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  }
})
```

### 2. CDN配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia'
        }
      }
    }
  }
})
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue 3 App</title>
  
  <!-- CDN引入 -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/vue-router@4/dist/vue-router.global.js"></script>
  <script src="https://unpkg.com/pinia@2/dist/pinia.iife.js"></script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

## （三）部署配置

### 1. Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vue-app/dist;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://backend-server:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 2. Docker部署

```dockerfile
# Dockerfile
# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage

# 复制构建结果
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  vue-app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

# 十、性能优化实践

## （一）代码层面优化

### 1. 使用shallowRef和shallowReactive

对于大型数据结构，使用浅层响应式可以提高性能：

```javascript
import { ref, shallowRef, reactive, shallowReactive } from 'vue'

export default {
  setup() {
    // 对于大型数据结构，使用shallowRef
    const largeData = shallowRef({
      items: new Array(10000).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` }))
    })
    
    // 普通ref会深度监听，性能较差
    // const largeData = ref({ items: [...] }) // 避免这样做
    
    // 更新数据时，需要替换整个对象
    const updateData = () => {
      largeData.value = {
        items: largeData.value.items.concat({ id: Date.now(), name: 'New Item' })
      }
    }
    
    return {
      largeData,
      updateData
    }
  }
}
```

### 2. 使用v-once和v-memo优化静态内容

```vue
<template>
  <div>
    <!-- 静态内容使用v-once -->
    <h1 v-once>{{ title }}</h1>
    
    <!-- 使用v-memo缓存复杂计算 -->
    <div v-memo="[user.id, user.name]">
      <UserProfile :user="user" />
    </div>
    
    <!-- 列表优化 -->
    <div 
      v-for="item in items" 
      :key="item.id"
      v-memo="[item.id, item.status, item.priority]"
    >
      <ExpensiveComponent :item="item" />
    </div>
  </div>
</template>
```

### 3. 异步组件和代码分割

```javascript
// 路由级别的代码分割
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/profile',
    component: () => import('@/views/Profile.vue')
  }
]

// 组件级别的懒加载
import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent({
  loader: () => import('@/components/HeavyChart.vue'),
  loadingComponent: () => '<div>Loading chart...</div>',
  errorComponent: () => '<div>Failed to load chart</div>',
  delay: 200,
  timeout: 3000
})
```

## （二）构建优化

### 1. Tree Shaking优化

```javascript
// 按需引入工具库
import { debounce, throttle } from 'lodash-es'
// 而不是
// import _ from 'lodash'

// 按需引入UI库
import { ElButton, ElInput } from 'element-plus'
// 而不是
// import ElementPlus from 'element-plus'
```

### 2. 预加载和预获取

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 关键路径组件
          critical: ['@/views/Home.vue', '@/views/Login.vue'],
          
          // 次要组件
          secondary: ['@/views/Profile.vue', '@/views/Settings.vue']
        }
      }
    }
  }
})
```

```vue
<!-- 在路由组件中预加载 -->
<template>
  <div>
    <router-link 
      to="/profile" 
      @mouseenter="preloadProfile"
    >
      Profile
    </router-link>
  </div>
</template>

<script>
export default {
  methods: {
    preloadProfile() {
      // 预加载Profile组件
      import('@/views/Profile.vue')
    }
  }
}
</script>
```

## （三）运行时优化

### 1. 虚拟滚动

```vue
<!-- VirtualList.vue -->
<template>
  <div 
    ref="container"
    class="virtual-list"
    @scroll="handleScroll"
  >
    <div 
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    ></div>
    
    <div 
      class="virtual-list-content"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <div 
        v-for="item in visibleItems"
        :key="item.id"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  props: {
    items: Array,
    itemHeight: {
      type: Number,
      default: 50
    },
    visibleCount: {
      type: Number,
      default: 10
    }
  },
  
  setup(props) {
    const container = ref(null)
    const scrollTop = ref(0)
    
    const totalHeight = computed(() => {
      return props.items.length * props.itemHeight
    })
    
    const startIndex = computed(() => {
      return Math.floor(scrollTop.value / props.itemHeight)
    })
    
    const endIndex = computed(() => {
      return Math.min(
        startIndex.value + props.visibleCount,
        props.items.length
      )
    })
    
    const visibleItems = computed(() => {
      return props.items.slice(startIndex.value, endIndex.value)
    })
    
    const offset = computed(() => {
      return startIndex.value * props.itemHeight
    })
    
    const handleScroll = (e) => {
      scrollTop.value = e.target.scrollTop
    }
    
    return {
      container,
      totalHeight,
      visibleItems,
      offset,
      handleScroll
    }
  }
}
</script>
```

### 2. 防抖和节流

```javascript
// composables/useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  
  watch(value, (newValue) => {
    const timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
    
    return () => clearTimeout(timer)
  })
  
  return debouncedValue
}

// 使用
export default {
  setup() {
    const searchQuery = ref('')
    const debouncedQuery = useDebounce(searchQuery, 500)
    
    watch(debouncedQuery, (newQuery) => {
      // 执行搜索
      performSearch(newQuery)
    })
    
    return {
      searchQuery
    }
  }
}
```

# 十一、总结

Vue 3作为Vue.js框架的重大升级版本，带来了许多革命性的改进和新特性。通过本文的深入探讨，我们可以看到Vue 3在以下几个方面的显著优势：

## （一）核心特性总结

1. **Composition API**：提供了更灵活的逻辑组织方式，解决了大型项目中代码复用和维护的问题
2. **响应式系统优化**：基于Proxy的实现提供了更强大的响应式能力和更好的性能
3. **更好的TypeScript支持**：从底层设计就考虑了TypeScript集成，提供更准确的类型推断
4. **Tree-shaking友好**：支持按需引入，显著减小打包体积
5. **Fragment支持**：允许组件有多个根节点，提供更灵活的模板结构
6. **新增组件**：Teleport、Suspense等新组件解决了特定场景下的开发需求

## （二）开发建议

1. **渐进式迁移**：对于现有Vue 2项目，可以逐步引入Vue 3特性，不必一次性重写
2. **合理使用Composition API**：在复杂组件和需要逻辑复用的场景下使用，简单组件仍可使用Options API
3. **性能优化**：充分利用Vue 3的性能优化特性，如shallowRef、v-memo等
4. **状态管理**：推荐使用Pinia替代Vuex，享受更好的TypeScript支持和开发体验
5. **构建工具**：使用Vite作为构建工具，获得更快的开发体验

## （三）学习路径建议

1. **基础阶段**：掌握Vue 3基本概念、响应式系统、组件开发
2. **进阶阶段**：深入学习Composition API、自定义组合函数、高级组件模式
3. **实战阶段**：结合Vue Router 4、Pinia等生态库开发完整项目
4. **优化阶段**：学习性能优化技巧、构建优化、部署最佳实践

Vue 3不仅保持了Vue.js一贯的简洁易学特点，还在性能、开发体验和生态系统方面都有了显著提升。随着生态系统的不断完善，Vue 3必将成为现代前端开发的重要选择。

## 参考资料

- [Vue 3官方文档](https://cn.vuejs.org/)
- [Composition API RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)
- [Vue 3迁移指南](https://v3-migration.vuejs.org/)
- [Pinia官方文档](https://pinia.vuejs.org/)
- [Vite官方文档](https://cn.vitejs.dev/)