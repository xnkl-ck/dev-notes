# **JS 里面哪些类型是可以互转的？**

## 前言

JavaScript 是一门动态类型语言，类型转换是日常开发中非常常见的操作。理解哪些类型之间可以相互转换，以及转换的规则和注意事项，对于避免类型相关的错误和写出健壮代码非常重要。本文将系统讲解 JavaScript 中常见类型的互转及其原理。

## JavaScript 的数据类型互转

JavaScript 支持多种类型转换，主要包括以下几种常见类型：

- 基本类型：字符串（String）、数字（Number）、布尔值（Boolean）、undefined、null、Symbol、BigInt
- 引用类型：对象（Object）、数组（Array）、函数（Function）等

### 1. 转为字符串（String）

绝大多数类型都可以转换成字符串，常见方式是调用 `String()` 函数或 `.toString()` 方法。

- 数字、布尔值、Symbol 等可直接转字符串
- `null` 转为 `"null"`，`undefined` 转为 `"undefined"`
- 对象转字符串时，会调用对象的 `toString()` 方法，默认返回 `[object Object]`，数组转为元素逗号连接的字符串

示例：

```plain
String(123);       // "123"
String(true);      // "true"
String(null);      // "null"
String(undefined); // "undefined"
String([1,2,3]);   // "1,2,3"
```

### 2. 转为数字（Number）

可以通过 `Number()` 函数、`parseInt()`、`parseFloat()` 进行转换。

- 字符串中纯数字字符能成功转换
- 布尔值 `true` 转为 `1`，`false` 转为 `0`
- `null` 转为 `0`，`undefined` 转为 `NaN`
- 对象转换为数字时，调用 `valueOf()` 或 `toString()` 转为原始值，再尝试转换

示例：

```plain
Number("123");    // 123
Number(true);     // 1
Number(false);    // 0
Number(null);     // 0
Number(undefined);// NaN
Number([10]);     // 10
Number([1,2]);    // NaN
```

### 3. 转为布尔值（Boolean）

使用 `Boolean()` 或双重否定 `!!`，JavaScript 中“假值”有 `false`, `0`, `""`（空字符串）, `null`, `undefined`, `NaN`，其他均为真。

示例：

```plain
Boolean(0);       // false
Boolean("");      // false
Boolean(null);    // false
Boolean("abc");   // true
Boolean([]);      // true
Boolean({});      // true
```

### 4. 引用类型与基本类型的转换

对象类型转基本类型时，首先调用对象的 `valueOf()` 方法，如果返回原始值则使用，否则调用 `toString()`。

示例：

```plain
let obj = {
  valueOf() { return 42; },
  toString() { return "hello"; }
};
Number(obj);  // 42
String(obj);  // "hello"
```

### 5. 其他特殊转换

- BigInt 与 Number 不能自动转换，需显式转换，否则抛出错误。
- Symbol 不能直接转为数字或字符串，转换时抛错或特殊行为。

------

## 面试回答示范

**问题：JavaScript 中哪些类型是可以互转的？**

回答示例：

“JavaScript 支持多种类型间转换，比如数字、字符串和布尔值可以相互转换。数字和布尔值转换比较直接，比如 `true` 转为 `1`，`0` 转为 `false`。字符串转数字时要注意格式是否正确，否则会得到 `NaN`。对象转基本类型时会先调用 `valueOf` 或 `toString`，然后再尝试转换。BigInt 和 Number 之间不能自动转换，需要显式处理。Symbol 类型不能直接转为字符串或数字，否则会报错。总的来说，JavaScript 类型转换灵活，但也容易出现隐式转换导致的错误，开发中应谨慎处理。”

------

## 总结

类型转换是 JavaScript 的重要特性，但同时也是常见的错误来源。理解不同类型间的转换规则及细节，有助于避免隐式转换的陷阱，写出更健壮、可维护的代码。