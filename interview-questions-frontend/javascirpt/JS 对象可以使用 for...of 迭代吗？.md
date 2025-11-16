# **JS 对象可以使用 for...of 迭代吗？**

## 前言

`for...of` 是 ES6 引入的一种更简洁的数据遍历方式，它基于可迭代协议（`Symbol.iterator`）进行数据迭代。但在实际开发中，许多初学者会尝试使用 `for...of` 直接遍历对象字面量（如 `{ a: 1, b: 2 }`），却发现程序会抛出错误。本篇文章将深入讲解为何普通对象不能直接使用 `for...of`，以及如何实现对象的可迭代性，并介绍更合适的对象遍历方式。

## 对象不是可迭代对象

JavaScript 中的普通对象（Object）默认不实现 `Symbol.iterator` 接口。因此，直接对对象使用 `for...of` 会抛出错误：

```plain
const obj = { a: 1, b: 2 };

for (const item of obj) {
  console.log(item);
}
// TypeError: obj is not iterable
```

这是因为 `for...of` 只能用于**可迭代对象**，如数组、字符串、Set、Map 等，而对象并不属于这个范畴。

## 正确的遍历方式

遍历对象的推荐方式是使用以下三种 Object 方法：

1. `Object.keys(obj)`：返回对象所有的**自有属性名**
2. `Object.values(obj)`：返回对象所有的**属性值**
3. `Object.entries(obj)`：返回一个数组，元素是 `[key, value]` 键值对

这些方法都返回数组，可以配合 `for...of` 使用：

```plain
const obj = { a: 1, b: 2 };

for (const [key, value] of Object.entries(obj)) {
  console.log(`${key}: ${value}`);
}
```

这样间接实现了对对象的遍历，实用且语义清晰。

## 如何让对象支持 for...of

如果你确实希望某个对象能够直接使用 `for...of`，可以手动实现 `Symbol.iterator` 接口：

```plain
const obj = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]() {
    const entries = Object.entries(this);
    let index = 0;
    return {
      next() {
        if (index < entries.length) {
          return { value: entries[index++], done: false };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  }
};

for (const [key, value] of obj) {
  console.log(key, value);
}
```

这个例子中，我们让对象通过 `Symbol.iterator` 返回一个可以逐项遍历 `[key, value]` 的迭代器，从而实现 `for...of` 支持。

## 与 for...in 的区别

另一个常被混淆的遍历语法是 `for...in`。它可以遍历对象的**所有可枚举属性（包括继承的）**，但不推荐在现代开发中频繁使用，因为它可能带来继承链上的干扰项。

例如：

```plain
const obj = { a: 1 };
Object.prototype.b = 2;

for (const key in obj) {
  console.log(key); // a, b
}
```

而 `Object.keys(obj)` 只返回自有属性，不包含原型链上的 `b`，更安全可靠。

------

## 面试回答示范

**问题：JS 对象可以使用 for...of 迭代吗？**

回答示例：

“普通 JavaScript 对象不支持 `for...of`，因为它们没有实现 `Symbol.iterator` 接口。`for...of` 只能用于可迭代对象，比如数组、Set、Map、字符串等。如果要遍历对象属性，推荐使用 `Object.keys()`、`Object.values()` 或 `Object.entries()` 配合 `for...of` 使用。如果确实需要对对象本身使用 `for...of`，可以手动实现 `Symbol.iterator` 方法，让对象具备可迭代协议。”

------

## 总结

普通对象在 JavaScript 中默认不是可迭代的，不能直接使用 `for...of`。但我们可以通过 `Object.entries()` 等方法实现间接迭代，也可以手动为对象添加 `Symbol.iterator` 使其具备迭代能力。了解这背后的机制有助于我们选择正确的遍历方式，避免运行时错误并提升代码可维护性。