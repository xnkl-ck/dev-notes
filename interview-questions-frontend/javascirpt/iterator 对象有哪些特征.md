# **iterator 对象有哪些特征**

## 前言

在 ES6 引入迭代器（Iterator）和可迭代协议之后，JavaScript 中的许多原生结构都具备了可迭代能力，比如数组、字符串、Set、Map 等。掌握 iterator 的特征和工作机制，对于我们理解 `for...of`、解构赋值、扩展运算符等语法行为的底层实现大有帮助。本文将系统介绍 iterator 对象的特征、结构组成及其实际意义，并结合代码案例讲透相关机制。

## iterator 的基本特征

Iterator 是一种接口机制，目的是为各种数据结构提供统一的访问机制。只要一个对象实现了 `Symbol.iterator` 方法，并返回一个具有 `next()` 方法的对象，我们就称它为“可迭代对象”。

Iterator 对象本质上是一个**具有特定接口约定的对象**，最核心的特征如下：

### 1. 必须具有 `next()` 方法

这个方法每次调用都会返回一个结果对象 `{ value, done }`：

- `value`：当前迭代返回的值。
- `done`：布尔值，表示是否已经迭代完成。

### 2. 每个 iterator 都是状态持久的

迭代器会记住当前的遍历位置，不像传统的 for 循环每次从头开始，iterator 是**一次性消费的**，不能重置。

### 3. 可通过 `for...of` 遍历

只要对象实现了 `Symbol.iterator` 方法，它就可以被 `for...of`、扩展运算符、解构赋值等 ES6 的语法支持。

### 4. 是“惰性求值”的

即使是一个无限序列（如斐波那契数列），也可以通过 iterator 来表达，因为它每次只在调用 `next()` 的时候生成值。

## 自定义 iterator 的例子

```javascript
const myIterable = {
  data: [10, 20, 30],
  [Symbol.iterator]() {
    let index = 0
    const data = this.data
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false }
        } else {
          return { value: undefined, done: true }
        }
      }
    }
  }
}

for (const item of myIterable) {
  console.log(item)
}
// 输出：10 20 30
```

这个对象 `myIterable` 自己实现了 `Symbol.iterator`，因此具备 iterator 特征，可以被 `for...of` 遍历。

## 与内建可迭代对象的关系

JavaScript 中许多内建结构都内置了 iterator 接口：

- 数组的 `[Symbol.iterator]` 返回的是 ArrayIterator 对象
- Map、Set 也内置了自己的 iterator
- 字符串、TypedArray、DOM 的 NodeList 也支持迭代

这些 iterator 的行为是自动定义好的，我们可以通过调用 `obj[Symbol.iterator]()` 获取它们的迭代器对象。

## 与生成器的关系

生成器（generator）其实是创建 iterator 的一种更高级的语法糖形式。任何生成器函数（使用 `function*` 定义）返回的都是一个符合 iterator 协议的对象。

```javascript
function* generator() {
  yield 1
  yield 2
  yield 3
}

const iter = generator()
console.log(iter.next()) // { value: 1, done: false }
console.log(iter.next()) // { value: 2, done: false }
console.log(iter.next()) // { value: 3, done: false }
console.log(iter.next()) // { value: undefined, done: true }
```

这个例子中的 `iter` 就是一个标准 iterator 对象，具备所有的行为。

## 面试回答示范（口语化）

**面试官问：iterator 对象有什么特征？**

我会这么回答：

“iterator 是 ES6 引入的一种接口协议，它主要用来支持像 `for...of`、扩展运算符这样的新语法，能让我们以统一的方式遍历不同数据结构。它有几个关键特征：

第一，它必须有一个 `next()` 方法，每次调用返回一个对象，这个对象里面有两个属性：`value` 表示当前值，`done` 表示是否遍历结束。

第二，iterator 是有状态的，每次 `next()` 调用都会推进内部的遍历指针，这意味着它是一次性消费、不会重置的。

第三，iterator 一般是和 `Symbol.iterator` 方法配合使用的，只要一个对象实现了这个方法并返回一个 iterator，就可以认为它是“可迭代的”，就能被 `for...of` 遍历。

第四，它是惰性求值的，不会一次性生成所有值，这个特点对于处理流式数据或无限数据非常有用。

另外我还会提到，像数组、Set、Map、字符串、NodeList 等结构都已经内置了 iterator 接口，也就是说它们都可以直接用 `for...of` 来遍历。

如果需要自定义 iterator，我们可以手动实现 `Symbol.iterator` 方法，或者用 generator 函数来简化这个过程。”

## 总结

iterator 对象的核心特征在于拥有 `next()` 方法，能够返回包含 `value` 和 `done` 的结果对象，并具备惰性、状态持久等优点。理解 iterator 是深入掌握可迭代协议、异步编程（如 async iterator）以及生成器等 ES6+ 新特性的基础。在实际开发中，虽然我们经常使用 `for...of` 或扩展运算符来消费 iterator，但深入理解其原理会让我们在处理数据结构或自定义类行为时更加得心应手。