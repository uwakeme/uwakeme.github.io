---
title: 【前端】Vue中导出表格数据到Excel
categories: 前端
tags:
  - Vue
  - Excel
  - 数据导出
  - exceljs
---

# 前言

在前端开发中，将表格数据导出为Excel文件是一个常见的需求，方便用户离线查看和分析数据。本文将介绍如何在Vue项目中使用 `exceljs` 库来实现前端导出表格数据的功能，并参考您项目中已有的实现方式。

# 一、准备工作

## （一）安装依赖

首先，确保您的Vue项目中已经安装了 `exceljs` 和 `file-saver` (用于在浏览器端保存文件)。

```shell
npm install exceljs file-saver --save
```

`exceljs` 是一个功能强大的库，可以创建、读取和修改Excel文件。
`file-saver` 则可以帮助我们将生成的文件流保存到用户的本地设备。

## （二）创建工具方法（或在组件中直接实现）

您可以将导出逻辑封装成一个可复用的工具方法，或者直接在需要导出功能的组件中实现。参考您项目 `source/_drafts/前台功能.md` 中的 `tableOutputMethod` 方法，这是一个很好的实践。

# 二、实现导出功能

下面我们将详细步骤分解，并结合您项目中的代码示例进行说明。

## （一）引入库

在您的工具文件或Vue组件中，首先需要引入 `exceljs` 和 `file-saver`。

```javascript
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // 通常这样引入 saveAs
```

在您项目 `source/_drafts/前台功能.md` 中的 `tableOutputMethod` 方法内，使用了 `require` 的方式引入 `exceljs`，这也是可行的，尤其是在一些旧的或者特定配置的项目中：

```javascript
// const Excel = require("exceljs"); // 您项目中的引入方式
```

## （二）准备数据和表头

导出Excel前，需要准备好要导出的数据 (通常是一个对象数组 `list`) 和表头信息 (`fieldData`)。

`fieldData` 通常包含以下信息：
- `field`: 对应数据对象中的属性名。
- `fieldName`: 在Excel中显示的列名。
- `dataType`: 数据类型 (可选，可用于特定格式化)。
- `dateFormat`: 日期格式 (如果 `dataType` 是日期类型，可选)。
- 其他自定义属性，如列宽等。

示例 `fieldData` (来自您的项目)：

```javascript
const fieldData = [
  {
    field: "taskName",
    fieldName: "审批状态",
    dataType: "string"
  },
  {
    field: "planCode",
    fieldName: "计量计划编号",
    dataType: "string"
  },
  // ...更多列定义
];
```

要导出的数据 `list` 应该是这样的结构：

```javascript
const list = [
  { taskName: '已审批', planCode: 'P001', /* ...其他属性 */ },
  { taskName: '待审批', planCode: 'P002', /* ...其他属性 */ },
  // ...更多数据行
];
```

## （三）创建 Workbook 和 Worksheet

使用 `exceljs` 创建一个新的工作簿 (Workbook) 和工作表 (Worksheet)。

```javascript
async function exportToExcel(list, fieldData, fileName = '导出数据.xlsx', colWidth = 20) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1'); // Sheet1 是工作表的名称

  // 可选：设置创建者、最后修改者等元数据
  workbook.creator = '前端应用';
  workbook.lastModifiedBy = '前端用户';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ... 后续步骤
}
```

## （四）设置列定义和表头

根据 `fieldData` 设置工作表的列定义，包括 `key` (对应数据 `field`) 和 `width`。
然后，将表头行插入到工作表中。

```javascript
  // 根据 fieldData 定义列
  worksheet.columns = fieldData.map(item => ({
    key: item.field,
    width: item.width || colWidth, // 如果fieldData中定义了宽度，则使用，否则使用默认宽度
    header: item.fieldName // 直接在列定义中设置表头文字
  }));

  // 添加数据行 (exceljs 会自动根据列的key匹配数据)
  worksheet.addRows(list);

  // （可选）如果您需要更复杂的表头，例如合并单元格，可以像您项目中的 tableOutputMethod 那样手动构建表头行：
  // const headerRow = worksheet.getRow(1); // 获取第一行作为表头行
  // headerRow.values = fieldData.map(item => item.fieldName);
  // headerRow.font = { bold: true };
  // headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  // worksheet.insertRow(1, fieldData.map(item => item.fieldName)); // 简单插入表头行
```

在您项目中的 `tableOutputMethod` 里，处理表头的部分非常细致，支持了多级表头和单元格合并。对于简单表头，`exceljs` 可以通过 `worksheet.columns` 的 `header` 属性自动生成。
如果需要复杂表头，可以参考您项目中 `tableOutputMethod` 中对 `tableHead` 和 `rows` 的处理逻辑，通过 `worksheet.insertRows()` 和 `worksheet.mergeCells()` 来实现。

例如，简单设置表头样式：
```javascript
  // 获取表头行并设置样式
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // 加粗，白色字体
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' } // 绿色背景
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
```

## （五）填充数据并设置样式（可选）

数据行可以通过 `worksheet.addRows(list)` 或 `worksheet.insertRows(rowNumber, arrayOfArrays)` 添加。
`exceljs` 会自动根据列定义中的 `key` 将 `list` 中的对象数据填充到对应的单元格。

您可以遍历单元格来设置特定的数据格式或样式。

```javascript
  // （可选）遍历数据行和单元格设置样式或格式
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) { // 跳过表头行
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // 例如，设置所有单元格边框
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // 根据 fieldData 中的 dataType 进行特定处理
        const columnInfo = fieldData[colNumber - 1]; // 获取当前列的定义信息
        if (columnInfo && columnInfo.dataType === 'date' && cell.value) {
          // 如果是日期类型且有值，可以进行格式化，但通常 exceljs 会自动处理 Date 对象
          // cell.value = new Date(cell.value); // 确保是 Date 对象
          // cell.numFmt = columnInfo.dateFormat || 'yyyy-mm-dd'; // 例如 'yyyy-mm-dd hh:mm:ss'
        } else if (columnInfo && columnInfo.dataType === 'number' && typeof cell.value === 'string'){
          cell.value = parseFloat(cell.value); // 字符串转数字
        }

        // 根据内容长度自动调整列宽 (这是一个简化的示例，可能需要更复杂的计算)
        // const column = worksheet.getColumn(colNumber);
        // const dataLength = cell.value ? String(cell.value).length : 0;
        // const headerLength = column.header ? String(column.header).length : 0;
        // column.width = Math.max(column.width || 10, dataLength + 2, headerLength + 2);
      });
    }
  });
```

在您项目 `source/_drafts/前台功能.md` 的 `tableOutputMethod` 中，对日期格式化 `cell.value = $moment(cell.value).format(formatStr);` 是一个很好的处理方式，如果项目中集成了 `moment.js`。

## （六）生成并下载文件

最后，使用 `workbook.xlsx.writeBuffer()` 生成 Excel 文件的 buffer，然后利用 `file-saver` 触发浏览器下载。

```javascript
  // 生成 buffer 并下载
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  }).catch(err => {
    console.error('导出Excel失败:', err);
  });
}
```

## （七）调用导出方法

在您的 Vue 组件中，可以这样调用封装好的导出方法：

```vue
<template>
  <button @click="handleExport">导出Excel</button>
  <!-- 表格显示 -->
</template>

<script>
// import { exportToExcel } from '@/utils/excelExport'; // 假设封装在工具文件中
// 或直接在此组件中定义上述 exportToExcel 方法

export default {
  data() {
    return {
      tableData: [
        { id: 1, name: '张三', age: 30, email: 'zhangsan@example.com' },
        { id: 2, name: '李四', age: 25, email: 'lisi@example.com' }
      ],
      columnsDefinition: [
        { field: 'name', fieldName: '姓名', width: 25 },
        { field: 'age', fieldName: '年龄', dataType: 'number' },
        { field: 'email', fieldName: '邮箱', width: 30 }
      ]
    };
  },
  methods: {
    async handleExport() {
      // 准备要导出的数据，可以是表格的当前数据，也可以是选中的数据
      const dataToExport = this.tableData; // 示例：导出所有表格数据
      const fields = this.columnsDefinition;
      const fileName = '用户数据.xlsx';

      // 调用前面定义的 exportToExcel 方法
      // 如果 exportToExcel 是异步的（例如内部有异步操作），可以 await
      await exportToExcel(dataToExport, fields, fileName);
    }
  }
}
</script>
```

在您项目的 `jxd_960Click` 方法中，逻辑比较完整，包括了处理选中数据导出或查询全部数据导出的情况，这是一个很好的参考。

# 三、高级功能（参考 `exceljs` 文档）

`exceljs` 还支持许多高级功能，例如：
- 设置单元格的字体、颜色、背景、边框等样式。
- 合并单元格。
- 插入图片。
- 设置数据有效性验证。
- 创建图表。
- 密码保护工作表或工作簿 (如您在 `【学习】前端导出Excel——exceljs.md` 中记录的)。

可以查阅 `exceljs` 的官方文档以获取更多详细信息。

# 四、总结

使用 `exceljs` 配合 `file-saver` 可以方便地在 Vue 前端实现表格数据的导出功能。通过合理的封装和配置，可以满足大部分导出需求，并能对导出的 Excel 文件进行丰富的定制。

您项目中 `source/_drafts/前台功能.md` 内的 `tableOutputMethod` 函数提供了一个非常全面和细致的实现案例，特别是对于复杂表头和数据处理方面，具有很好的参考价值。

# 五、参考资料

-   ExcelJS GitHub Repository: [https://github.com/exceljs/exceljs](https://github.com/exceljs/exceljs)
-   FileSaver.js GitHub Repository: [https://github.com/eligrey/FileSaver.js/](https://github.com/eligrey/FileSaver.js/)
-   您的项目笔记: `source/_drafts/前台功能.md` (章节 2.3)
-   您的项目笔记: `source/_posts/【学习】前端导出Excel——exceljs.md`
--- 