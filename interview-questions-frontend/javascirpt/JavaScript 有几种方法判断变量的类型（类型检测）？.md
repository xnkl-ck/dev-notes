# **JavaScript 有几种方法判断变量的类型（类型检测）？**

## 前言

JavaScript 是动态类型语言，变量类型灵活多变。正确判断变量类型是开发中常见且重要的需求，尤其在函数参数校验、数据处理和调试时。本文将详细介绍 JavaScript 中几种常用且有效的类型检测方法，讲解它们的原理和适用场景。

## 常见的类型检测方法

### 1. typeof 操作符

`typeof` 是最基础的类型检测方法，返回一个表示变量类型的字符串。

常见结果包括：

- "undefined"
- "boolean"
- "number"
- "string"
- "symbol"
- "bigint"
- "function"
- "object"（包括 null、数组、对象等）

缺点是对于 `null` 返回 "object"，无法区分数组和普通对象。

示例：

```plain
typeof 123;           // "number"
typeof "abc";         // "string"
typeof true;          // "boolean"
typeof undefined;     // "undefined"
typeof null;          // "object"
typeof [];            // "object"
typeof function(){};  // "function"
```

### 2. instanceof 操作符

用于判断对象是否为某个构造函数的实例。

```plain
[] instanceof Array;       // true
({}) instanceof Object;    // true
new Date() instanceof Date;// true
```

缺点是对跨 iframe 等不同执行环境对象判断可能失效。

### 3. Object.prototype.toString.call()

这是一个更精确的类型检测方式，适用于区分各种内置对象类型。

返回类似字符串格式：`"[object Type]"`

示例：

```plain
Object.prototype.toString.call(null);        // "[object Null]"
Object.prototype.toString.call([]);          // "[object Array]"
Object.prototype.toString.call({});          // "[object Object]"
Object.prototype.toString.call(new Date());  // "[object Date]"
Object.prototype.toString.call(/regex/);     // "[object RegExp]"
```

### 4. Array.isArray()

专门用于判断是否为数组。

```plain
Array.isArray([]);     // true
Array.isArray({});     // false
```

### 5. 判断 null

`typeof null` 返回 "object"，所以判断 null 需要额外判断：

```plain
value === null
```

### 6. 判断是否为对象（排除 null）

```plain
typeof value === 'object' && value !== null
```

------

## 面试回答示范

**问题：JavaScript 有几种方法判断变量的类型？**

回答示例：

“JavaScript 中判断变量类型，最常用的是 `typeof`，它能区分基本类型和函数，但不能准确区分数组、null 和对象。为了更精确判断类型，常用 `Object.prototype.toString.call(value)`，它返回格式固定的字符串，可以区分数组、日期、正则等。判断数组最好用 `Array.isArray()`。`instanceof` 可以判断对象实例，但跨 iframe 场景可能不准。对于 null，需特别判断 `value === null`。根据实际需求，选择合适的判断方法。”

------

## 总结

类型检测是前端开发基础技能，熟练掌握各种检测方法及其适用场景，有助于编写健壮和高效的代码，避免类型错误导致的问题。