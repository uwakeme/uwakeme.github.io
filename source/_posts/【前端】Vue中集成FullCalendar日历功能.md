---
title: 【前端】Vue中集成FullCalendar日历功能
categories: 前端
tags:
  - Vue
  - FullCalendar
  - 日历
---

# 前言

在前端项目开发中，日历功能是常见的需求，例如日程展示、事件预约等。FullCalendar 是一款功能强大且高度可定制的 JavaScript 日历库，可以很好地与 Vue.js 集成。本文将详细介绍如何在 Vue 项目中集成和使用 FullCalendar。

# 一、准备环境

在开始之前，请确保您的 Vue 项目已经创建并正常运行。

## （一）安装 FullCalendar 相关依赖

首先，我们需要安装 FullCalendar 的核心包、Vue 适配器以及您需要使用的插件。FullCalendar 提供了不同版本的 Vue 适配器，请根据您的 Vue 版本进行选择。

对于 **Vue 2** 项目：

```shell
npm install --save @fullcalendar/core @fullcalendar/vue
```

对于 **Vue 3** 项目：

```shell
npm install --save @fullcalendar/core @fullcalendar/vue3
```

接下来，安装您计划使用的 FullCalendar 插件。常用的插件包括：

- `@fullcalendar/daygrid`：提供月视图、周视图、日视图。
- `@fullcalendar/timegrid`：提供带有时间轴的周视图和日视图。
- `@fullcalendar/list`：提供日程列表视图。
- `@fullcalendar/interaction`：提供日期点击、事件拖拽、调整大小等交互功能。

例如，安装 `dayGridPlugin` 和 `interactionPlugin`：

```shell
npm install --save @fullcalendar/daygrid @fullcalendar/interaction
```

## （二）引入样式文件

FullCalendar 的样式也需要单独引入。您可以在您的主样式文件（例如 `main.scss` 或组件的 `<style>` 标签中）引入：

```scss
// main.scss 或 App.vue <style>
@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/daygrid/main.css'; /* 根据您使用的插件引入对应样式 */
/* 例如，如果您使用了 timeGridPlugin，则需要引入： */
/* @import '~@fullcalendar/timegrid/main.css'; */
```

或者，您也可以在项目的入口文件 `main.js` 或 `main.ts` 中引入：

```javascript
// main.js 或 main.ts
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css'; // 根据您使用的插件引入对应样式
```

在您的项目中，似乎在 `source/_drafts/前台功能.md` 中提到了自定义的日历样式文件：

```javascript
import "@/styles/calendar.scss";   //日历样式
```

如果这个样式文件是您为 FullCalendar 特别定制的，请确保它被正确引入和应用。

# 二、在 Vue 组件中使用 FullCalendar

完成依赖安装和样式引入后，我们就可以在 Vue 组件中使用 FullCalendar 了。

## （一）引入并注册组件和插件

在您的 Vue 组件中，首先需要引入 `FullCalendar` 组件以及您需要使用的插件。

```vue
<script>
import FullCalendar from '@fullcalendar/vue3'; // 或 '@fullcalendar/vue' for Vue 2
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
// 如果需要其他插件，也一并引入
// import timeGridPlugin from '@fullcalendar/timegrid';
// import listPlugin from '@fullcalendar/list';
// import moment from 'moment'; // 如果需要处理时间，可以引入 moment.js 或其他时间处理库

export default {
  components: {
    FullCalendar // 注册 FullCalendar 组件
  },
  data() {
    return {
      calendarOptions: {
        plugins: [ dayGridPlugin, interactionPlugin ], // 启用插件
        initialView: 'dayGridMonth', // 设置初始视图
        weekends: true, // 是否显示周末，默认为 true
        events: [ // 初始化事件数据
          { title: '会议', date: '2024-07-20' },
          { title: '生日', start: '2024-07-22T10:00:00', end: '2024-07-22T12:00:00' }
        ],
        // 其他配置项...
      }
    }
  },
  methods: {
    handleDateClick: function(arg) {
      alert('日期点击! ' + arg.dateStr);
      // 可以在这里添加创建新事件的逻辑
    },
    handleEventClick: function(arg) {
      alert('事件点击! ' + arg.event.title);
      // 可以在这里添加编辑或删除事件的逻辑
    },
    // 其他事件处理函数...
  }
}
</script>

<template>
  <FullCalendar :options="calendarOptions" @dateClick="handleDateClick" @eventClick="handleEventClick" />
</template>
```

在您提供的 `source/_drafts/前台功能.md` 文件中，引入方式如下：

```javascript
import "@fullcalendar/core"; // solves problem with Vite
import FullCalendar from "@fullcalendar/vue"; // FullCalendar 的 vue 组件
import dayGridPlugin from "@fullcalendar/daygrid"; // 月视图插件
import interactionPlugin, { Draggable } from "@fullcalendar/interaction"; // 接口插件
import timeGridPlugin from "@fullcalendar/timegrid"; // 周视图和日视图插件
import listPlugin from "@fullcalendar/list"; // 日程视图插件
import moment from "moment";   //时间处理组件
```
这种引入方式也是正确的。

## （二）配置 `calendarOptions`

`calendarOptions` 是 FullCalendar 的核心配置对象，您可以在其中定义日历的各种行为和外观。

一些常用的配置项包括：

- `plugins`: 数组类型，指定需要启用的插件。
- `initialView`: 字符串类型，设置日历的初始视图，例如 `'dayGridMonth'`, `'timeGridWeek'`, `'listDay'`。
- `headerToolbar`: 对象类型，配置日历头部的工具栏，可以控制显示哪些按钮（如切换视图、上/下一月）。
  ```javascript
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  }
  ```
- `events`: 数组或函数类型，用于提供日历上显示的事件数据。
  - 如果是数组，直接提供事件对象列表。
  - 如果是函数，FullCalendar 会在需要事件数据时调用该函数，通常用于从后端 API 获取数据。
- `dateClick`: 函数类型，当用户点击某个日期时触发。
- `eventClick`: 函数类型，当用户点击某个事件时触发。
- `eventDrop`: 函数类型，当用户拖拽一个事件到新的日期/时间时触发。
- `eventResize`: 函数类型，当用户调整一个事件的时长时触发。
- `selectable`:布尔类型，是否允许用户通过点击和拖动选择多个日期或时间段。
- `select`: 函数类型，当用户选择了一个日期或时间段后触发（需要 `interactionPlugin` 插件并设置 `selectable: true`）。
- `editable`: 布尔类型，是否允许通过拖拽或调整大小来修改事件（需要 `interactionPlugin` 插件）。
- `eventContent`: 函数或插槽 (Slot)，用于自定义事件的显示内容。

在您提供的 `source/_drafts/前台功能.md` 中，使用了插槽 `eventContent` 来自定义事件的显示：

```vue
<FullCalendar ref="fullCalendar" :options="calendarOptions">
    <template v-slot:eventContent="arg" >
      <!-- 自定义事件显示逻辑 -->
      <div style="width: 200px;overflow: hidden;margin-left: 10px">
          <p>
              <span class="revealLable">事件:</span>
              <span :title="arg.event.extendedProps.eventName">{{ arg.event.extendedProps.eventName }}</span>
          </p>
          <!-- 其他自定义字段 -->
      </div>
    </template>
</FullCalendar>
```
这是一种非常灵活的自定义事件渲染方式。

## （三）事件处理

FullCalendar 提供了丰富的事件回调函数，用于响应用户的交互操作。

- **日期点击 (`dateClick`)**: 当用户点击日历上的某个日期时触发。通常用于创建新事件。
  ```javascript
  handleDateClick(clickInfo) {
    if (confirm(`您想在 ${clickInfo.dateStr} 添加一个新事件吗?`)) {
      this.calendarOptions.events = [
        ...this.calendarOptions.events,
        {
          title: '新事件',
          start: clickInfo.date,
          allDay: clickInfo.allDay
        }
      ];
    }
  }
  ```
- **事件点击 (`eventClick`)**: 当用户点击已存在的事件时触发。通常用于查看事件详情或编辑/删除事件。
  ```javascript
  handleEventClick(clickInfo) {
    if (confirm(`您确定要删除事件 '${clickInfo.event.title}' 吗?`)) {
      clickInfo.event.remove();
    }
  }
  ```
- **事件拖拽 (`eventDrop`) 和调整大小 (`eventResize`)**: 需要 `interactionPlugin` 插件并设置 `editable: true`。
  ```javascript
  handleEventDrop(dropInfo) {
    console.log('事件被拖拽:', dropInfo.event);
    // 更新后端数据
  }

  handleEventResize(resizeInfo) {
    console.log('事件大小被调整:', resizeInfo.event);
    // 更新后端数据
  }
  ```
  在 `calendarOptions` 中配置这些回调：
  ```javascript
  calendarOptions: {
    // ...其他配置
    editable: true,
    dateClick: this.handleDateClick,
    eventClick: this.handleEventClick,
    eventDrop: this.handleEventDrop,
    eventResize: this.handleEventResize,
  }
  ```

## （四）通过 API 控制日历

有时您可能需要通过代码动态地控制日历，例如跳转到特定日期、获取当前视图的日期范围等。可以通过 `ref` 获取 FullCalendar 组件实例，然后调用其 `getApi()` 方法来访问 Calendar API。

```vue
<template>
  <div>
    <button @click="goToNextMonth">下一月</button>
    <FullCalendar ref="fullCalendar" :options="calendarOptions" />
  </div>
</template>

<script>
// ... (import 和 component 注册部分)
export default {
  // ... (data 和 methods)
  methods: {
    goToNextMonth() {
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.next(); // 跳转到下一个月/周/日，取决于当前视图
    }
  }
}
</script>
```

# 三、高级用法和技巧

## （一）动态加载事件

对于有大量事件的场景，一次性加载所有事件可能会影响性能。FullCalendar 支持通过函数动态加载事件。`events` 选项可以是一个函数，该函数接收 `fetchInfo` (包含当前视图的开始/结束日期等信息) 和两个回调函数 `successCallback`、`failureCallback`。

```javascript
calendarOptions: {
  // ...
  events: function(fetchInfo, successCallback, failureCallback) {
    // 示例：从 API 获取事件
    fetch(`/api/events?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`)
      .then(response => response.json())
      .then(data => {
        successCallback(data); // 将获取到的事件数据传递给日历
      })
      .catch(error => {
        console.error('获取事件失败:', error);
        failureCallback(error);
      });
  }
}
```

## （二）自定义事件渲染

如前所述，可以使用 `eventContent` 插槽 (Slot) 来完全自定义事件的 HTML 结构和样式。`eventContent` 接收一个包含事件相关信息的参数 `arg`。

```vue
<FullCalendar :options="calendarOptions">
  <template v-slot:eventContent="arg">
    <b>{{ arg.timeText }}</b>
    <i>{{ arg.event.title }}</i>
    <p v-if="arg.event.extendedProps.description">
      {{ arg.event.extendedProps.description }}
    </p>
  </template>
</FullCalendar>
```
`arg` 对象包含以下常用属性：
- `event`: FullCalendar 的 Event 对象，包含事件的 `title`, `start`, `end`, `extendedProps` 等。
- `timeText`: 事件的时间文本，例如 "10:00 - 12:00"。
- `view`: 当前的 View 对象。

## （三）与后端集成

通常，日历事件数据存储在后端数据库中。您需要在 Vue 组件中通过 API 与后端进行交互，以实现事件的增删改查。

- **查询事件**: 在 `events` 函数中调用后端 API 获取事件。
- **添加事件**: 在 `dateClick` 或 `select` 回调中，收集新事件信息，调用后端 API 保存，成功后再更新前端日历。
- **修改/删除事件**: 在 `eventClick`, `eventDrop`, `eventResize` 回调中，获取事件 ID，调用后端 API 修改或删除，成功后再更新前端日历。

# 四、常见问题与解决方案

1.  **样式未生效**：
    *   确保已正确安装并引入了 FullCalendar 的核心 CSS 文件以及所使用插件的 CSS 文件。
    *   检查是否有全局 CSS 覆盖了 FullCalendar 的样式。
    *   如果是使用 SCSS 等预处理器，确保 `~@fullcalendar/...` 的路径解析正确。

2.  **插件未生效**：
    *   确保已通过 npm/yarn 安装了所需的插件包。
    *   确保在 `calendarOptions.plugins` 数组中正确引入并添加了插件实例 (例如 `dayGridPlugin`)。

3.  **事件不显示**：
    *   检查 `calendarOptions.events` 的数据格式是否正确。每个事件对象至少应包含 `title` 和 `date` (或 `start`) 属性。
    *   如果是动态加载事件，检查 `events` 函数的逻辑和 API 调用是否正确，以及 `successCallback` 是否被正确调用并传入了正确的事件数据。
    *   查看浏览器控制台是否有报错信息。

4.  **交互功能 (如拖拽、点击) 无效**：
    *   确保已安装并启用了 `@fullcalendar/interaction` 插件。
    *   对于事件拖拽和调整大小，确保 `editable: true` 已设置。
    *   对于日期选择，确保 `selectable: true` 已设置。

# 五、总结

FullCalendar 是一个非常强大和灵活的日历库，通过 `@fullcalendar/vue` 或 `@fullcalendar/vue3` 适配器，可以方便地在 Vue.js 项目中集成。通过合理的配置和事件处理，可以实现各种复杂的日历功能需求。

在您提供的 `source/_drafts/前台功能.md` 中，已经包含了项目引入包、页面引入组件和构建日历组件的基础框架，本文在其基础上进行了更详细的说明和扩展。

# 六、参考资料

- FullCalendar Official Documentation: [https://fullcalendar.io/docs](https://fullcalendar.io/docs)
- FullCalendar Vue Component Documentation: [https://fullcalendar.io/docs/vue](https://fullcalendar.io/docs/vue)
- (如有您项目中的特定文档或笔记，也可以在此列出)
--- 