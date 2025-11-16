# **null 和 undefined 的区别，如何让一个属性变为 null？**

## 前言

`null` 和 `undefined` 是 JavaScript 中两个常见的表示“无值”的数据类型，很多初学者经常混淆它们。理解两者的区别及其语义，有助于正确处理变量和对象属性的状态。本文将深入解析 `null` 和 `undefined` 的本质区别，并讲解如何将对象属性赋值为 `null`。

## null 与 undefined 的区别

### 定义和语义

- **undefined**
  表示变量已声明但未赋值，是 JavaScript 运行时默认赋予的初始值。例如，声明了变量但未初始化，函数没有返回值时，默认返回 `undefined`，访问对象不存在的属性时也返回 `undefined`。
- **null**
  表示“无值”或“空值”，是开发者主动赋予变量或属性的特殊值，用于表示变量明确没有值。

### 类型

`undefined` 是 JavaScript 的基本类型之一；`null` 在 `typeof` 操作符下返回 `"object"`，这是历史遗留问题，但 `null` 被视为特殊的空引用值。

### 使用场景

- `undefined` 更多用作变量未赋值、属性不存在、函数无返回值的标识。
- `null` 用作显式的空值，表示变量已定义但暂时无值，通常由程序员手动赋值。

### 代码示例

```plain
let a;
console.log(a);           // undefined，未赋值变量

const obj = {};
console.log(obj.prop);    // undefined，不存在的属性

let b = null;
console.log(b);           // null，明确赋值为空
```

## 如何让对象属性变为 null？

将对象的某个属性设置为 `null`，表示该属性已定义但目前无值。赋值操作直接修改属性值即可：

```plain
const obj = { name: 'Alice' };
obj.name = null;
console.log(obj.name); // null
```

与删除属性不同，`null` 属性依然存在于对象中，只是值为空。

------

## 面试回答示范

**问题：null 和 undefined 有什么区别？如何让一个对象属性变为 null？**

回答示例：

“`undefined` 表示变量声明了但未赋值，是系统默认的状态；而 `null` 是程序员主动赋值的空值，表示变量有意设为空。`undefined` 多用于标识变量未初始化或属性不存在，`null` 用于明确表示空对象或空值。要让对象属性变为 `null`，直接给属性赋值 `null` 即可，比如 `obj.prop = null`。这样属性依然存在，但值为空。”

------

## 总结

清晰区分 `null` 和 `undefined`，理解它们在变量状态和语义上的差异，能帮助开发者更好地控制程序状态，避免类型混淆和潜在的逻辑错误。