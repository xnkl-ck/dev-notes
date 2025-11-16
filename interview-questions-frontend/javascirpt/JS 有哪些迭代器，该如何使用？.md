# **JS 有哪些迭代器，该如何使用？**

## 前言

自 ES6 起，JavaScript 引入了迭代器和可迭代协议，大大丰富了对集合类型的操作能力。我们常用的结构如数组、字符串、Map、Set 等，都实现了内置迭代器。理解这些迭代器的行为及使用场景，可以让我们更高效地处理数据结构，写出更优雅的代码。

## 可迭代对象与内置迭代器

JavaScript 中，只要一个对象实现了 `Symbol.iterator` 方法，返回一个包含 `next()` 方法的对象，它就是可迭代的。

以下是常见内置可迭代对象及其迭代器行为：

**数组（Array）**
数组默认按顺序返回每一项的值：

```plain
const arr = [1, 2, 3];
const it = arr[Symbol.iterator]();
console.log(it.next()); // { value: 1, done: false }
```

**字符串（String）**
字符串迭代器按字符单位遍历字符串：

```plain
const str = 'hi';
for (const char of str) {
  console.log(char); // h i
}
```

**Map**
Map 提供三种迭代器方法：

```plain
const map = new Map([['a', 1], ['b', 2]]);
map.keys();     // 键的迭代器
map.values();   // 值的迭代器
map.entries();  // 键值对的迭代器
```

这些方法都返回迭代器对象，可用于 `for...of`：

```plain
for (const [key, val] of map.entries()) {
  console.log(key, val);
}
```

**Set**
Set 的迭代器与数组类似，按插入顺序返回值：

```plain
const set = new Set([10, 20]);
for (const val of set) {
  console.log(val);
}
```

**TypedArray（如 Uint8Array）**
也实现了 `Symbol.iterator`，可以用 `for...of` 遍历。

**arguments 对象**
虽然不是数组，但支持迭代器协议，可以 `for...of` 遍历。

**DOM 集合如 NodeList**
现代浏览器中的 `NodeList` 实现了迭代器接口：

```plain
const nodes = document.querySelectorAll('div');
for (const node of nodes) {
  console.log(node);
}
```

## 非迭代对象的情况

一些对象默认不是可迭代的，如：

- 普通对象（Object）
- 自定义类（除非手动实现 `Symbol.iterator`）

你可以手动给这些对象添加迭代器：

```plain
const obj = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => ({
        value: this.data[i++],
        done: i > this.data.length
      })
    };
  }
};

for (const val of obj) {
  console.log(val);
}
```

## 典型用途总结

这些内置迭代器常用于：

- `for...of` 遍历
- 展开运算符（`...`）
- 解构赋值
- 构建新的集合对象，如 `new Set(arr)` 或 `Array.from(map.keys())`

------

## 面试回答示范

**问题：JS 有哪些迭代器，该如何使用？**

回答示例：

“JavaScript 中常见的可迭代对象包括数组、字符串、Map、Set、TypedArray、`arguments` 和 DOM 的 NodeList，它们都实现了 `Symbol.iterator` 方法。每次调用这个方法都会返回一个迭代器对象，包含 `next()` 方法。我们可以用 `for...of`、扩展运算符等方式使用这些迭代器，简化遍历操作。如果是普通对象，可以手动实现 `Symbol.iterator` 方法使其具备迭代能力。”

------

## 总结

JavaScript 提供了多个内置的迭代器，大多数与集合数据类型相关。掌握它们的使用方式不仅能写出更简洁的代码，还能在处理数据转换、惰性计算等高级场景中发挥重要作用。