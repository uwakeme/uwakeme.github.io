---
title: 【学习】VUE中的watch监听
categories: 前端功能
tags:
  - 前端
  - VUE
date: 2025-04-22
---
# 一、watch概述
## （一）什么是watch？
+ watch是Vue中的一个特性，用于监听数据的变化并执行相应的操作。
+ 当被监听的数据发生变化时，会触发一个回调函数，我们可以在这个回调函数中执行一些逻辑操作。
+ watch适用于需要在数据变化时执行异步或开销较大的操作的场景。

## （二）基本语法
### 1. 选项式API（Options API）中的watch
```javascript
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  watch: {
    // 监听message属性的变化
    message(newValue, oldValue) {
      console.log('message变化了', newValue, oldValue)
    }
  }
}
```

### 2. 组合式API（Composition API）中的watch
```javascript
import { ref, watch } from 'vue'

const message = ref('Hello')

// 监听ref对象的变化
watch(message, (newValue, oldValue) => {
  console.log('message变化了', newValue, oldValue)
})
```

# 二、watch的高级用法
## （一）深度监听
### 1. 监听对象的深层属性变化
+ 默认情况下，watch只会监听对象的引用变化，而不会监听对象内部属性的变化。
+ 如果需要监听对象内部属性的变化，需要设置`deep: true`。

```javascript
// 选项式API
export default {
  data() {
    return {
      user: {
        name: '张三',
        age: 25
      }
    }
  },
  watch: {
    user: {
      handler(newValue, oldValue) {
        console.log('user对象变化了', newValue, oldValue)
      },
      deep: true // 开启深度监听
    }
  }
}

// 组合式API
import { reactive, watch } from 'vue'

const user = reactive({
  name: '张三',
  age: 25
})

watch(user, (newValue, oldValue) => {
  console.log('user对象变化了', newValue, oldValue)
}, { deep: true })
```

### 2. 监听对象的特定属性
```javascript
// 选项式API
export default {
  data() {
    return {
      user: {
        name: '张三',
        age: 25
      }
    }
  },
  watch: {
    // 使用字符串路径监听嵌套属性
    'user.name'(newValue, oldValue) {
      console.log('用户名变化了', newValue, oldValue)
    }
  }
}

// 组合式API
import { reactive, watch } from 'vue'

const user = reactive({
  name: '张三',
  age: 25
})

// 使用getter函数返回要监听的属性
watch(
  () => user.name,
  (newValue, oldValue) => {
    console.log('用户名变化了', newValue, oldValue)
  }
)
```

## （二）立即执行
+ 默认情况下，watch只会在数据变化时触发回调函数，而不会在初始化时执行。
+ 如果需要在初始化时就执行一次回调函数，可以设置`immediate: true`。

```javascript
// 选项式API
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  watch: {
    message: {
      handler(newValue, oldValue) {
        console.log('message值为', newValue)
      },
      immediate: true // 立即执行一次回调函数
    }
  }
}

// 组合式API
import { ref, watch } from 'vue'

const message = ref('Hello')

watch(message, (newValue, oldValue) => {
  console.log('message值为', newValue)
}, { immediate: true })
```

## （三）一次性监听
+ 在Vue 3.2+版本中，可以使用`once: true`选项来设置只监听一次变化。
+ 或者使用`watchEffect`的`onInvalidate`函数来手动停止监听。

```javascript
// 组合式API（Vue 3.2+）
import { ref, watch } from 'vue'

const count = ref(0)

// 只监听一次变化
watch(count, (newValue, oldValue) => {
  console.log(`count从${oldValue}变为${newValue}`)
}, { once: true })

// 手动停止监听
const stopWatch = watch(count, (newValue, oldValue) => {
  console.log(`count从${oldValue}变为${newValue}`)
  if (newValue > 5) {
    stopWatch() // 当count大于5时停止监听
  }
})
```

# 三、watchEffect
## （一）watchEffect与watch的区别
+ `watch`需要明确指定要监听的数据源，而`watchEffect`会自动收集其内部所使用的所有响应式依赖。
+ `watch`可以访问被监听状态的前一个值和当前值，而`watchEffect`只能访问当前值。
+ `watchEffect`会在组件初始化时立即执行一次，相当于设置了`immediate: true`的watch。

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const message = ref('Hello')

// watchEffect会自动监听回调函数中使用的所有响应式数据
watchEffect(() => {
  console.log(`count: ${count.value}, message: ${message.value}`)
})

// 等价于以下watch写法
watch([count, message], ([newCount, newMessage]) => {
  console.log(`count: ${newCount}, message: ${newMessage}`)
}, { immediate: true })
```

## （二）停止监听
+ watchEffect返回一个停止函数，调用它可以停止监听。

```javascript
const stopWatchEffect = watchEffect(() => {
  console.log(`count: ${count.value}`)
})

// 在某个条件下停止监听
if (someCondition) {
  stopWatchEffect()
}
```

# 四、watch与computed的区别
| 特性 | watch | computed |
| --- | --- | --- |
| 用途 | 监听数据变化并执行副作用 | 计算并返回新值 |
| 缓存 | 无缓存机制 | 有缓存，只在依赖变化时重新计算 |
| 返回值 | 无返回值 | 有返回值 |
| 适用场景 | 数据变化时执行异步操作或复杂逻辑 | 依赖其他数据计算出新值 |
| 执行时机 | 数据变化后执行 | 依赖变化时立即计算新值 |

# 五、实际应用场景
## （一）表单验证
```javascript
import { ref, watch } from 'vue'

const username = ref('')
const usernameError = ref('')

watch(username, (newValue) => {
  if (newValue.length < 3) {
    usernameError.value = '用户名长度不能小于3个字符'
  } else if (newValue.length > 20) {
    usernameError.value = '用户名长度不能大于20个字符'
  } else {
    usernameError.value = ''
  }
})
```

## （二）搜索防抖
```javascript
import { ref, watch } from 'vue'

const searchQuery = ref('')
let debounceTimer = null

watch(searchQuery, (newValue) => {
  // 清除之前的定时器
  if (debounceTimer) clearTimeout(debounceTimer)
  
  // 设置新的定时器，延迟500ms执行搜索
  debounceTimer = setTimeout(() => {
    console.log('执行搜索:', newValue)
    // 调用搜索API
    searchApi(newValue)
  }, 500)
})

function searchApi(query) {
  // 实际的搜索API调用
  // ...
}
```

## （三）路由参数变化监听
```javascript
import { watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    
    // 监听路由参数变化
    watch(
      () => route.params.id,
      async (newId) => {
        if (newId) {
          // 根据新的ID加载数据
          await loadData(newId)
        }
      },
      { immediate: true } // 组件创建时立即执行一次
    )
    
    async function loadData(id) {
      // 加载数据的逻辑
      // ...
    }
  }
}
```

## （四）响应式数据持久化
```javascript
import { ref, watch } from 'vue'

// 从localStorage读取初始值
const theme = ref(localStorage.getItem('theme') || 'light')

// 监听theme变化并保存到localStorage
watch(theme, (newTheme) => {
  localStorage.setItem('theme', newTheme)
  // 应用主题变化
  document.body.setAttribute('data-theme', newTheme)
}, { immediate: true })
```

# 六、注意事项
1. **避免在watch回调中修改被监听的值**，这可能导致无限循环。
2. **深度监听可能会影响性能**，特别是监听大型对象时，应谨慎使用。
3. **watch不会监听数组的索引变化和对象的添加/删除属性**，除非使用Vue提供的方法（如`push`、`splice`、`Vue.set`等）。
4. **在组合式API中，确保在`setup`或生命周期钩子中设置watch**，避免在条件语句或循环中创建watch。
5. **使用`watchEffect`时要注意副作用清理**，特别是涉及到DOM操作或异步操作时。