# Node.js 学习笔记

---

## 📝 Node.js 基础概念

### 什么是 Node.js
- 基于 Chrome V8 引擎的 JavaScript 运行时
- 非阻塞 I/O 模型
- 事件驱动架构
- 适合构建高并发、I/O 密集型应用

---

## 🎯 常用模块

### 文件系统（fs）
```javascript
const fs = require('fs');
const fsPromises = require('fs').promises;

// 异步读取文件
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 使用 Promise（推荐）
async function readFileAsync() {
  try {
    const data = await fsPromises.readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

// 写入文件
await fsPromises.writeFile('output.txt', 'Hello World');

// 追加内容
await fsPromises.appendFile('log.txt', 'New log entry\n');
```

---

## 🔖 标签
`#nodejs` `#backend` `#javascript`

---

**最后更新：** 2025-10-16

