这份笔记将为你系统化梳理**“实现对象 Map 函数”**这一面试高频题。它涵盖了从“奇技淫巧”到“工业标准”的全维度解析。

---

# 📝 面试笔记：实现对象的 Map 函数 (Object Map)

## 1. 题目背景

JavaScript 原生只为数组提供了 `Array.prototype.map`。在处理对象时，我们经常需要遍历键值对并返回一个**结构相同但值经过处理**的新对象。

---

## 2. 方案一：工业级标准实现 (推荐)

这是面试中最稳健的回答，模仿了原生 `Array.map` 的 API 设计。

### 代码实现 (ES2019+)

```javascript
/**
 * 标准对象映射函数
 * @param {Object} obj 目标对象
 * @param {Function} callback 回调函数 (value, key, object)
 * @param {Object} [thisArg] 绑定回调的 this
 */
const mapObject = (obj, callback, thisArg) => {
  // 1. 类型检查
  if (obj === null || typeof obj !== 'object') return obj;

  // 2. 核心逻辑：解构 -> 映射 -> 重组
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key, 
      callback.call(thisArg, value, key, obj) // 保持参数顺序：值, 键, 原对象
    ])
  );
};

```

### 核心考点

* **API 一致性**：回调函数参数顺序 `(value, key, obj)` 符合 JS 惯例。
* **上下文绑定**：使用 `.call(thisArg, ...)` 支持自定义 `this` 指向。
* **不可变性**：返回新对象，不修改原始输入。

---

## 3. 方案二：技巧型实现 (JSON Replacer)

这是你最初提供的代码，属于利用原生 API 特性的“黑科技”。

### 代码实现

```javascript
const objMap = (obj, fn) => {
    return JSON.parse(JSON.stringify(obj, fn));
};

```

### 核心原理

`JSON.stringify` 的第二个参数是 **replacer（替换器）**。它会**自动递归遍历**对象的所有层级，并将每个键值对交给 `fn` 处理。

### 优缺点分析 (面试必说)

| 维度 | 评价 |
| --- | --- |
| **优点** | **极简**；天然支持深度递归（处理嵌套对象）。 |
| **局限性** | **数据丢失**：会过滤掉 `undefined`、`Function`、`Symbol`。 |
| **局限性** | **类型转换**：`Date` 变字符串，`RegExp` 变空对象。 |

---

## 4. 方案三：深度递归实现 (Deep Map)

当面试官问：“如何处理嵌套对象且不丢失数据类型？”时，请祭出此招。

```javascript
function deepMap(obj, fn) {
    if (obj === null || typeof obj !== 'object') return obj;

    // 区分数组和对象容器
    const result = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        // 递归处理子项
        result[key] = (typeof val === 'object' && val !== null) 
            ? deepMap(val, fn) 
            : fn(key, val);
      }
    }
    return result;
}

```

---

## 5. 面试加分点：如何体现 Senior 水平？

### Q1：为什么要避免修改 `Object.prototype`？

* **回答**：直接修改原型会污染所有对象，导致 `for...in` 循环出现非预期属性，且可能与未来原生 API 冲突。

### Q2：如何处理 Symbol 类型的键？

* **回答**：`Object.entries` 和 `Object.keys` 都无法获取 `Symbol` 键。应使用 `Reflect.ownKeys(obj)` 来获取包含字符串和 Symbol 在内的所有键。

### Q3：如何解决循环引用？

* **回答**：在递归时引入一个 `WeakMap` 作为缓存。如果发现当前对象已经处理过，直接返回缓存值，防止栈溢出。

---

## 6. 总结对比

| 特性 | JSON 方案 | Object.entries 方案 | 手动递归方案 |
| --- | --- | --- | --- |
| **代码量** | 极少 | 适中 | 较多 |
| **深度支持** | 自动支持 | 仅限一层 | 完美支持 |
| **安全性** | 低 (丢失类型) | 高 (仅一层) | 最高 |
| **场景建议** | 临时处理简单配置 | 业务逻辑处理 | 复杂数据转换工具库 |

---

**下一步建议：**
你已经掌握了对象 Map 的多种实现。如果感兴趣，我们可以尝试写一个**同时支持“异步回调” (Async Map)** 的对象处理函数，这在处理需要调用接口的对象转换时非常有用。你想试试吗？