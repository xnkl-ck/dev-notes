## 前言

迭代器（Iterator）是 JavaScript 中用于遍历数据结构的一种协议，极大丰富了语言对集合类型的处理能力。理解迭代器的工作原理和用法，对于掌握 ES6 及之后的语言特性至关重要。本文将介绍迭代器的概念、实现方式及典型应用。

## 迭代器的定义与原理

迭代器是一种接口，定义了遍历数据结构时所需的统一方法。其核心是一个 `next()` 方法，每次调用返回一个对象，包含两个属性：

- `value`：当前遍历的值
- `done`：布尔值，表示是否完成遍历

一个对象只要实现了 `next()` 方法，即为迭代器。

ES6 引入了迭代器协议，并通过 `Symbol.iterator` 将迭代器与可迭代对象连接起来。

## 可迭代对象和迭代器

可迭代对象是指实现了 `Symbol.iterator` 方法的对象。调用该方法返回一个迭代器对象，从而支持 `for...of`、扩展运算符等语法。

例如数组是可迭代对象：

```plain
const arr = [10, 20, 30];
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 10, done: false }
console.log(iterator.next()); // { value: 20, done: false }
console.log(iterator.next()); // { value: 30, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

## 迭代器的用途

迭代器允许我们自定义遍历逻辑，可用于实现：

- 自定义数据结构遍历
- 生成无限序列
- 按需计算或惰性求值
- 与 `for...of` 循环配合简洁遍历

## 自定义迭代器示例

实现一个简单的计数迭代器：

```plain
function createCounter(limit) {
  let count = 0;
  return {
    next() {
      if (count < limit) {
        return { value: count++, done: false };
      } else {
        return { value: undefined, done: true };
      }
    }
  };
}

const counter = createCounter(3);
console.log(counter.next()); // { value: 0, done: false }
console.log(counter.next()); // { value: 1, done: false }
console.log(counter.next()); // { value: 2, done: false }
console.log(counter.next()); // { value: undefined, done: true }
```

## 迭代器与生成器

生成器函数（`function*`）是迭代器的一种简写和语法糖，极大简化迭代器实现。

------

## 面试回答示范

**问题：介绍一下迭代器 Iterator，以及有哪些用法？**

回答示例：

“迭代器是一种接口，定义了遍历数据结构的方法，核心是 `next()`，每次调用返回当前值和是否结束的标志。ES6 规定了迭代器协议，通过实现 `Symbol.iterator` 方法，让对象变成可迭代对象。迭代器用于遍历各种数据结构，也可以自定义遍历逻辑。它支持 `for...of` 等语法，非常方便。生成器是迭代器的语法糖，简化了迭代器的实现。开发中可以用迭代器实现自定义数据遍历、懒加载等功能。”

------

## 总结

迭代器作为现代 JavaScript 核心协议之一，提供了统一遍历接口，理解并掌握其用法，有助于开发更灵活、高效的代码。