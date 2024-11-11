---
title: 【全局指令】去除输入框el-input的前后空格
tags:
  - VUE
  - 全局指令
  - 工作
categories: 前端
date: 2024-09-18 18:01:57
---


# 【全局指令】去除输入框el-input的前后空格

## 一、安装全局指令

+ 可以在`src/directives`中创建一个JS文件，我创建的文件名叫`input_trim.js`，用于写自定义指令的代码。

+ 然后在文件中写入以下代码：

  ```javascript
  export default {
    install (Vue) {
      Vue.directive('trim', {
        inserted (el, binding, vnode) {
          // 获取el-input的input元素
          const input = el.querySelector('input') || el.querySelector('textarea');
          // 定义一个失焦事件处理函数
          const handleBlur = function () {
            // 更新v-model绑定的值
            vnode.componentInstance.$emit('input', vnode.componentInstance.value.trim());
          };
          // 给input元素添加失焦事件监听
          input.addEventListener('blur', handleBlur);
          // 给el元素添加一个属性，保存事件处理函数的引用
          el._handleBlur = handleBlur;
        },
        // 当指令所在组件被销毁时
        unbind (el) {
          // 获取el-input的input元素
          const input = el.querySelector('input') || el.querySelector('textarea');
          // 获取之前保存的事件处理函数的引用
          const handleBlur = el._handleBlur;
          // 移除input元素的失焦事件监听
          input.removeEventListener('blur', handleBlur);
          // 删除el元素的属性
          el._handleBlur = null;
        }
      });
    }
  };
  ```

+ 然后在`main.js`中引入该文件，并进行注册（只要最后可以注册到vue即可）

  ```javascript
  // 去除输入框空格
  import input_trim from '@/directives/input_trim';
  
  Vue.use(input_trim);
  ```

  



## 二、引入指令，实现效果

+ 注册全局指令后，在VUE代码中直接使用该指令即可

  ```vue
  <el-input placeholder="请输入" clearable v-model="inputData" v-trim></el-input>
  ```

+ 效果：在输入框中输入值后，鼠标点击其他地方会触发blur，输入框自动去除前后空格
