# JavaScript 踩坑记录

记录 JavaScript 开发中遇到的常见问题和陷阱。

---

## 🐞 问题 1：浮点数计算精度问题

### 💬 发现场景
在计算金额时，发现 `0.1 + 0.2` 不等于 `0.3`！

### ❌ 错误示例
```javascript
console.log(0.1 + 0.2); // 输出: 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false 🚨

// 金额计算错误
const price = 19.90;
const quantity = 3;
const total = price * quantity; // 59.699999999999996 🚨
```

### ✅ 正确写法

**方法 1：使用 toFixed() 并转换**
```javascript
const result = parseFloat((0.1 + 0.2).toFixed(10)); // 0.3 ✅

// 金额计算
const price = 19.90;
const quantity = 3;
const total = parseFloat((price * quantity).toFixed(2)); // 59.70 ✅
```

**方法 2：转换为整数计算**
```javascript
// 金额计算：以分为单位
const price = 1990; // 19.90 元 = 1990 分
const quantity = 3;
const total = (price * quantity) / 100; // 59.70 元 ✅
```

**方法 3：使用专门的库**
```javascript
// 使用 decimal.js 或 big.js
import Decimal from 'decimal.js';

const result = new Decimal(0.1).plus(0.2).toNumber(); // 0.3 ✅
```

### 🔍 原因分析
- JavaScript 使用 IEEE 754 双精度浮点数标准
- 某些十进制小数无法精确表示为二进制
- 0.1 在二进制中是无限循环小数，会被截断

### 💡 总结与延伸
- **金额计算**：永远以分（或最小单位）为单位计算
- **比较浮点数**：使用 `Math.abs(a - b) < Number.EPSILON`
- **展示金额**：使用 `toFixed()` 格式化
- 需要高精度计算时，使用专门的库

### 🔖 标签
`#javascript` `#floating-point` `#precision` `#money`

---

## 🐞 问题 2：异步操作中的循环问题

### 💬 发现场景
在 `for` 循环中使用 `var` 声明变量，setTimeout 中获取到的都是最后一个值。

### ❌ 错误示例
```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i); // 输出 5 个 "5" 🚨
  }, 100);
}
```

### ✅ 正确写法

**方法 1：使用 let（推荐）**
```javascript
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i); // 输出 0, 1, 2, 3, 4 ✅
  }, 100);
}
```

**方法 2：使用 IIFE（立即执行函数）**
```javascript
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j); // 输出 0, 1, 2, 3, 4 ✅
    }, 100);
  })(i);
}
```

**方法 3：使用 forEach**
```javascript
[0, 1, 2, 3, 4].forEach(i => {
  setTimeout(() => {
    console.log(i); // 输出 0, 1, 2, 3, 4 ✅
  }, 100);
});
```

### 🔍 原因分析
- `var` 是函数作用域，不是块级作用域
- 循环结束后，`i` 的值已经是 5
- setTimeout 中的回调函数访问的是同一个 `i` 变量（闭包）

### 💡 总结与延伸
- 优先使用 `let` 和 `const`，避免使用 `var`
- 理解闭包和作用域的概念
- 使用 ESLint 规则禁用 `var`：`"no-var": "error"`

### 🔖 标签
`#javascript` `#closure` `#async` `#var-let`

---

## 🐞 问题 3：数组的浅拷贝与深拷贝

### 💬 发现场景
修改拷贝后的数组，发现原数组也被修改了。

### ❌ 错误示例
```javascript
const original = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const copied = original; // 🚨 只是引用赋值

copied[0].name = 'Charlie';
console.log(original[0].name); // "Charlie" - 原数组也被修改了！

// 浅拷贝的陷阱
const copied2 = [...original]; // 🚨 只是浅拷贝
copied2[0].name = 'David';
console.log(original[0].name); // "David" - 嵌套对象还是被修改了！
```

### ✅ 正确写法

**方法 1：JSON 序列化（简单场景）**
```javascript
const original = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const copied = JSON.parse(JSON.stringify(original)); // ✅ 深拷贝

copied[0].name = 'Charlie';
console.log(original[0].name); // "Alice" - 原数组未被修改 ✅
```

**注意：JSON 方法的限制**
- 无法处理函数、undefined、Symbol
- 无法处理循环引用
- Date 对象会变成字符串

**方法 2：使用 structuredClone（现代方法）**
```javascript
const original = [{ id: 1, name: 'Alice', date: new Date() }];
const copied = structuredClone(original); // ✅ 深拷贝

copied[0].name = 'Charlie';
console.log(original[0].name); // "Alice" ✅
console.log(copied[0].date instanceof Date); // true ✅
```

**方法 3：使用 Lodash**
```javascript
import _ from 'lodash';

const original = [{ id: 1, name: 'Alice' }];
const copied = _.cloneDeep(original); // ✅ 深拷贝
```

**方法 4：手动递归拷贝**
```javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
```

### 🔍 原因分析
- JavaScript 中对象和数组是**引用类型**
- 直接赋值只是复制引用，不是复制内容
- 扩展运算符 `...` 和 `slice()` 只是浅拷贝

### 💡 总结与延伸
| 方法 | 深度 | 优点 | 缺点 |
|------|------|------|------|
| `=` | 引用 | 快 | 会修改原对象 |
| `...` / `slice` | 浅拷贝 | 简单 | 嵌套对象仍是引用 |
| `JSON` | 深拷贝 | 简单 | 无法处理特殊类型 |
| `structuredClone` | 深拷贝 | 处理多种类型 | 较新的 API |
| `lodash` | 深拷贝 | 功能完整 | 需要额外依赖 |

### 🔖 标签
`#javascript` `#array` `#copy` `#deep-clone`

---

## 🐞 问题 4：== 与 === 的区别导致的 Bug

### 💬 发现场景
使用 `==` 进行比较时，出现了意料之外的结果。

### ❌ 错误示例
```javascript
console.log(0 == '0');        // true 🚨
console.log(0 == []);         // true 🚨
console.log('0' == []);       // false 🤔
console.log(null == undefined); // true 🚨
console.log(false == '0');    // true 🚨

// 实际场景中的 Bug
function getUserAge(age) {
  if (age == null) { // 🚨 这会匹配 null 和 undefined
    return '未知';
  }
  return age;
}

getUserAge(0); // 返回 0（正确）
getUserAge(null); // 返回 '未知'（正确）
getUserAge(undefined); // 返回 '未知'（可能不是期望的）
```

### ✅ 正确写法
```javascript
// 永远使用 === 进行比较
console.log(0 === '0');        // false ✅
console.log(0 === []);         // false ✅
console.log(null === undefined); // false ✅

// 明确的空值检查
function getUserAge(age) {
  if (age === null || age === undefined) {
    return '未知';
  }
  return age;
}

// 或使用空值合并运算符
function getUserAge(age) {
  return age ?? '未知'; // ✅ 只有 null 和 undefined 才返回 '未知'
}
```

### 🔍 原因分析
- `==` 会进行**类型转换**（隐式转换）
- `===` 是**严格相等**，不进行类型转换
- `==` 的转换规则复杂且难以记忆

**常见的隐式转换：**
```javascript
// 字符串转数字
'3' == 3      // true

// 布尔转数字
true == 1     // true
false == 0    // true

// 对象转原始值
[] == ''      // true（[] 转为 ''）
[1] == 1      // true（[1] 转为 '1' 再转为 1）
```

### 💡 总结与延伸
- **始终使用 `===` 和 `!==`**
- 唯一可以用 `==` 的场景：`x == null`（同时检测 null 和 undefined）
- 现代推荐：使用 `??` 空值合并运算符
- 配置 ESLint：`"eqeqeq": ["error", "always"]`

### 🔖 标签
`#javascript` `#equality` `#type-coercion` `#best-practice`

---

## 📌 JavaScript 常见陷阱速查表

| 陷阱 | 问题 | 解决方案 |
|------|------|---------|
| `0.1 + 0.2 !== 0.3` | 浮点数精度 | 使用整数计算或 decimal.js |
| `var` in loop | 闭包陷阱 | 使用 `let` |
| `==` vs `===` | 隐式类型转换 | 始终使用 `===` |
| Array copy | 浅拷贝问题 | 使用 `structuredClone` 或 JSON |
| `typeof null` | 返回 "object" | 使用 `=== null` 检查 |
| `this` binding | 上下文丢失 | 使用箭头函数或 bind |
| Async in loop | 并发控制 | 使用 `Promise.all` 或 `for await` |

---

**最后更新：** 2025-10-16

