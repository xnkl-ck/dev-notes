# **JavaScript 如何判空：覆盖所有常见“空值”类型**

## 前言

在日常开发中，“判空”几乎是每个 JavaScript 开发者最常进行的操作之一。看似简单的任务，其实背后隐藏了许多细节，因为 JavaScript 中“空”的含义可以非常宽泛：不仅包括 `null` 和 `undefined`，还可能包括空字符串、空数组、空对象、数字 `0`、NaN，甚至是空的 `Set`、`Map`、`WeakMap` 等结构。本文将系统讲解如何在各种语义下正确判断“空值”。

## 常见“空值”类型分类

JavaScript 中我们通常会认为以下值是“空”的表现：

- `undefined`：未定义值
- `null`：空值（显式赋空）
- `''`（空字符串）：长度为 0 的字符串
- `[]`（空数组）：数组长度为 0
- `{}`（空对象）：无自有属性的对象
- `0`（数字零）：数值类型的“空”
- `NaN`：非法数字
- `false`：布尔型“假值”
- `new Set()` / `new Map()`：没有元素的集合或映射

## 通用判空方法

### 简单数据类型判空

对简单类型（如字符串、数字、布尔值、null、undefined）可用逻辑非运算符 `!` 快速判断：

```plain
function isEmptySimple(val) {
  return !val;
}
```

这种写法会在以下情况下返回 `true`：

```plain
isEmptySimple(null)        // true
isEmptySimple(undefined)   // true
isEmptySimple('')          // true
isEmptySimple(0)           // true
isEmptySimple(NaN)         // true
isEmptySimple(false)       // true
```

注意，这种方式并不能判断空数组、空对象、空集合，因为它们在布尔环境下是“真”。

```plain
![]        // false
!{}        // false
!new Set() // false
```

### 判断空数组

```plain
function isEmptyArray(arr) {
  return Array.isArray(arr) && arr.length === 0;
}
```

### 判断空对象

```plain
function isEmptyObject(obj) {
  return obj 
    && typeof obj === 'object'
    && !Array.isArray(obj)
    && Object.keys(obj).length === 0;
}
```

也可以使用：

```plain
Object.getOwnPropertyNames(obj).length === 0
```

### 判断空 Map / Set

```plain
function isEmptyMap(map) {
  return map instanceof Map && map.size === 0;
}

function isEmptySet(set) {
  return set instanceof Set && set.size === 0;
}
```

### 综合判空函数

下面是一个处理所有常见情况的通用函数：

```plain
function isTrulyEmpty(val) {
  if (val == null) return true; // covers null and undefined

  if (typeof val === 'string' && val.trim() === '') return true;

  if (typeof val === 'number' && (val === 0 || isNaN(val))) return true;

  if (typeof val === 'boolean' && val === false) return true;

  if (Array.isArray(val) && val.length === 0) return true;

  if (val instanceof Map || val instanceof Set) return val.size === 0;

  if (typeof val === 'object') {
    return Object.keys(val).length === 0;
  }

  return false;
}
```

这个函数基本可以涵盖日常业务中所有对“空”的定义。

------

## 面试回答示范

**问题：在 JS 中如何判断一个值是否为空？请覆盖常见类型如数组、对象、字符串、null、undefined、空集合等。**

回答示例：

“JavaScript 中的‘空’是一个广义概念，包括 null、undefined、空字符串、空数组、空对象、数字 0、NaN、false、空 Map、空 Set 等。

我们可以使用不同的方式判空：

- 简单类型用 `!val` 判断
- 空数组用 `Array.isArray(val) && val.length === 0`
- 空对象用 `Object.keys(val).length === 0`
- 空 Map / Set 用 `val.size === 0`

综合判断可以写成一个统一的函数，结合类型和结构判断实现全覆盖。”

------

## 总结

在 JavaScript 中，判空不仅是语法判断，更是一种对数据结构认知的体现。不同的数据类型在“空值”表现上各不相同，需要灵活使用 `typeof`、`Array.isArray`、`Object.keys`、`val.size` 等方法进行判断。只有理解这些差异，才能在实际项目中写出健壮可靠的判空逻辑，避免出现逻辑漏洞和运行时异常。