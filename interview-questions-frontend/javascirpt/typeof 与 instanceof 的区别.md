# **typeof 与 instanceof 的区别**

## 前言

在 JavaScript 中，`typeof` 和 `instanceof` 是两种常用的类型检测手段，但它们各自的用途和工作机制有明显区别。理解这两者的不同，对于准确判断变量类型、避免类型判断错误非常重要。本文将详细分析 `typeof` 和 `instanceof` 的区别和适用场景。

## typeof 的工作机制与特点

`typeof` 是一个一元操作符，用于返回操作数的类型字符串。它适用于检测基本数据类型和函数，但对引用类型区分能力有限。

常见返回值包括：

- `"undefined"`：变量未定义
- `"boolean"`：布尔值
- `"number"`：数字
- `"string"`：字符串
- `"symbol"`：符号
- `"bigint"`：大整数
- `"function"`：函数
- `"object"`：对象、数组、null 等

`typeof` 的优点是简单、快速，缺点是不能区分对象的具体类型，如数组和普通对象都会返回 `"object"`，且 `typeof null` 返回 `"object"` 是历史遗留问题。

## instanceof 的工作机制与特点

`instanceof` 是一个二元操作符，用于判断一个对象是否是某个构造函数的实例。它通过检查对象的原型链中是否存在构造函数的 `prototype`。

示例：

```javascript
[] instanceof Array;          // true
({}) instanceof Object;       // true
new Date() instanceof Date;   // true
```

`instanceof` 的优点是可以判断复杂对象的具体类型。缺点是它依赖于构造函数和原型链，跨环境（比如 iframe）对象可能导致判断失效，因为不同环境的构造函数不一样。

## 适用场景对比

- 使用 `typeof` 判断基本数据类型和函数是否存在或类型。
- 使用 `instanceof` 判断对象是否是某个类或构造函数的实例，适合检测自定义类型或内置对象。
- 对数组判断，建议用 `Array.isArray()` 而非 `instanceof`，以避免跨环境问题。

## 总结

`typeof` 是简单的类型判断，适合基本类型。`instanceof` 是基于原型链的实例判断，适合复杂对象。两者配合使用，能够覆盖绝大多数类型检测需求。

------

## 面试回答示范

**问题：请说说 typeof 和 instanceof 的区别？**

回答示例：

“`typeof` 用于判断变量的基础类型，返回一个字符串，比如 ‘number’、‘string’、‘object’ 等，适合判断基本数据类型和函数，但对对象具体类型区分不够，数组和对象都会返回 ‘object’。`instanceof` 用来判断一个对象是否是某个构造函数的实例，它通过检查原型链实现，能区分数组、日期等复杂对象。但 `instanceof` 依赖构造函数，跨 iframe 等环境可能失效。开发中通常结合使用，`typeof` 判断基本类型，`instanceof` 判断复杂对象。”

------

## 总结

掌握 `typeof` 和 `instanceof` 的原理和区别，有助于更准确地进行类型判断，提高代码的健壮性和可维护性。