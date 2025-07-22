---
title: 【前端】前端导出Excel设置工作区保护
categories: 前端
tags:
  - 前端
  - JS
  - VUE
date: 2025-04-09
---
# 设置导出的文件不可更改
+ 前端可以通过配置来设置导出的excel无法修改数据，或者设置密码来保护文档内容。
```javascript
import ExcelJS from 'exceljs';

// 创建 Workbook 和 Worksheet
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet1');

// 设置工作表保护（密码可选）
worksheet.protect('yourPassword', {
  selectLockedCells: false,   // 禁止选中锁定单元格
  selectUnlockedCells: false, // 禁止选中未锁定单元格
  formatCells: false,         // 禁止格式化
  insertRows: false,          // 禁止插入行
  deleteRows: false           // 禁止删除行
  // 更多选项见 ExcelJS 文档
});

// 将单元格设置为锁定状态（默认所有单元格已锁定）
worksheet.getCell('A1').value = '不可修改内容';
// 如果需要某些单元格可编辑，需显式解锁：
// worksheet.getCell('B1').protection = { locked: false };
```