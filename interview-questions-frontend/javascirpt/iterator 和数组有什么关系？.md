# **iterator 和数组有什么关系？**

## 前言

在 JavaScript 中，数组是我们日常开发中使用最频繁的数据结构之一。你可能已经习惯了用 `for`、`forEach`、`map` 来遍历数组，但你是否想过背后的机制是如何实现的？为什么数组能被 `for...of` 循环？其实这背后正是 **iterator（迭代器）协议**在发挥作用。本文将深入讲解 iterator 与数组的关系，从底层协议到实际使用场景，带你真正理解 JavaScript 的可迭代机制。

------

## 数组是“天生可迭代”的对象

在 ES6 中引入了一个概念叫做 **可迭代对象（iterable）**。只要一个对象实现了 `[Symbol.iterator]()` 方法，并返回一个具有 `next()` 方法的对象，那么它就是可迭代的，可以被 `for...of`、展开运算符 `...`、解构赋值等语法使用。

数组天生就实现了 `[Symbol.iterator]()` 方法，因此它们是“内建的可迭代对象”。你可以直接在数组上调用这个方法：

```plain
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

这个返回值是一个**迭代器对象（iterator）**，每次调用 `next()` 都返回一个 `{ value, done }` 结构，直到遍历完成。

------

## iterator 和数组的本质关联

可以从几个方面理解它们之间的关系：

1. **数组自动实现了 iterator 协议**
   每个数组实例上都有 `[Symbol.iterator]` 方法，这个方法在内部维护了一个“游标”，从头到尾返回数组中的每一个元素。
2. **数组的 for...of、解构等语法依赖 iterator 协议**
   当你使用 `for...of arr` 或者 `[...arr]` 时，JavaScript 引擎会自动调用 `arr[Symbol.iterator]()` 来获取迭代器对象，随后依次调用它的 `next()` 方法。
3. **数组可以与其他 iterable 协议的对象互操作**
   比如 Set、Map、字符串等都实现了 iterator 接口，因此你可以将这些对象与数组一起使用，比如 `Array.from(set)` 就是通过迭代器一个个读取元素转换成数组的。
4. **数组的某些方法返回的也是 iterator**
   如 `arr.entries()`、`arr.keys()`、`arr.values()` 都返回一个迭代器对象，而不是普通数组。

------

## iterator 协议的标准形式回顾

一个迭代器对象必须有一个 `next()` 方法，它返回一个形如 `{ value: any, done: boolean }` 的对象。

而 iterable 对象必须实现 `Symbol.iterator` 方法，且该方法返回一个 iterator。

所以数组之所以可以被 `for...of` 迭代，是因为它满足了 **iterable 协议**，返回了符合 **iterator 协议** 的对象。

------

## 面试回答示范（口语化 + 结构化）

**面试官问**：iterator 和数组有什么关系？

**回答参考**：

这个问题可以从协议的角度解释。iterator 是一种协议，而数组是这个协议的内建实现者。在 ES6 中，只要一个对象实现了 `[Symbol.iterator]()` 方法，并返回一个带有 `next()` 方法的对象，它就是一个 iterable。数组默认就实现了这个方法，所以数组是“天生”的 iterable。

也就是说，当我们对数组使用 `for...of`、`...扩展符`、或者像 `[...arr]` 这样的解构语法时，实际上背后调用的是 `arr[Symbol.iterator]()`, 得到一个迭代器对象，然后通过不断调用 `next()` 来遍历数组。

举个例子，如果我们手动调用这个接口，可以这样写：

```plain
const arr = ['a', 'b', 'c'];
const it = arr[Symbol.iterator]();
console.log(it.next()); // { value: 'a', done: false }
```

这个 iterator 和数组的下标访问不一样，它是一次一个值地“吐出”，每次调用都能记住上次的位置。

此外，数组的某些方法像 `arr.values()`、`arr.entries()` 返回的也都是 iterator 对象，它们可以配合 `for...of` 或手动使用。

总之，数组是对 iterator 协议的原生实现者，iterator 是支撑数组迭代能力的底层机制。理解了这个协议，我们就能自定义自己的可迭代对象，让它像数组一样被遍历。

------

## 总结

数组和 iterator 的关系说到底就是：**数组是 iterator 协议的实现者**。得益于此，数组可以被许多现代语法结构所操作，比如 `for...of`、扩展符、解构赋值等。通过深入了解 iterator 协议的原理，不仅能更好地理解数组的行为，还能自定义更多高级用法，例如构造类数组对象、懒序列、生成器等功能模块。