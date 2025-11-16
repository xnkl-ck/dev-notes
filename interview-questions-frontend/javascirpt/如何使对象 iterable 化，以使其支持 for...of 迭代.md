# **如何使对象 iterable 化，以使其支持 for...of 迭代**

## 前言

在日常开发中，`for...of` 是一种非常常见且语义清晰的遍历语法，尤其适用于遍历数组、字符串、Map、Set 等内建可迭代对象。但很多人不知道，普通的 JavaScript 对象默认并不支持 `for...of`，这是因为它们不是 iterable 对象。那我们能否让普通对象也支持 `for...of`？答案是可以的，只要我们理解迭代协议，并正确实现它。本文将全面解析如何让一个对象变成可迭代的，并用实际代码演示操作过程。

## 如何让对象支持 for...of：理解迭代器协议

`for...of` 背后依赖的是 JavaScript 的 **可迭代协议**（iterable protocol），它要求对象实现一个特殊方法 `Symbol.iterator`，并返回一个符合 **迭代器协议**（iterator protocol）的对象。

我们从两个关键点入手：

1. **对象必须拥有一个名为 Symbol.iterator 的方法**
2. **该方法返回的迭代器对象必须具有 next() 方法，且每次调用返回** `{ value, done }` **结构的对象**

来看一个例子，如何让一个普通对象 `{ a: 1, b: 2 }` 支持 `for...of`：

```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]() {
    const keys = Object.keys(this)
    let index = 0
    return {
      next: () => {
        if (index < keys.length) {
          const key = keys[index++]
          return { value: [key, this[key]], done: false }
        } else {
          return { value: undefined, done: true }
        }
      }
    }
  }
}

for (const [key, value] of obj) {
  console.log(key, value)
}
```

这里我们定义了一个自定义的 `Symbol.iterator` 方法，使得每次 `next()` 都按顺序返回一个键值对。当所有属性都被遍历后，`done` 变为 `true`，迭代结束。

## Symbol.iterator 也可以抽离为独立生成器

如果你想让实现更简洁，可以利用 ES6 的生成器函数来自动创建迭代器对象：

```javascript
const obj = {
  x: 10,
  y: 20,
  *[Symbol.iterator]() {
    for (const key of Object.keys(this)) {
      yield [key, this[key]]
    }
  }
}

for (const [k, v] of obj) {
  console.log(k, v)
}
```

只需加上 `*` 声明生成器函数，`yield` 自动处理了迭代器协议的逻辑，非常方便。

## 注意事项

并非所有对象都适合直接变成 iterable。如果对象内部结构复杂、不具备有序可枚举属性，或者属性值涉及异步，可能不适合直接实现 `Symbol.iterator`。

同时，不能把 `Symbol.iterator` 用于 `for...in`，二者使用场景不同：`for...in` 用于枚举属性名（包括继承属性），`for...of` 是用于遍历“可迭代的值”。

## 面试回答示范（口语化）

这个问题其实就是在考我对可迭代协议的理解。如果我希望一个普通对象支持 `for...of`，我需要为它实现 `Symbol.iterator` 方法。

这个方法要返回一个符合迭代器协议的对象，也就是说要有一个 `next()` 方法，它每次调用返回一个 `{ value, done }` 的对象。只要我自己能定义出一个这样的逻辑，JavaScript 引擎就能通过 `for...of` 来不断调用 `next()`。

举个例子，我可以通过 `Object.keys(this)` 拿到所有可枚举属性名，然后在 `next()` 里逐个返回。这样做的好处是可以完全自定义迭代行为，比如我想只迭代某些属性，或者对属性值做一些转换，都可以。

当然，我也可以用生成器来简化写法，比如写一个 `*[Symbol.iterator]()` 函数，然后里面用 `yield` 来一步步返回我想要的值，这样会更优雅一些，也符合现代语法。

所以总结来说，只要我实现了 `Symbol.iterator`，并确保返回值满足迭代器协议，我就可以让任何对象变成支持 `for...of` 的 iterable。

## 总结

让一个对象支持 `for...of`，关键是为其实现 `Symbol.iterator` 方法，并返回一个符合迭代器协议的对象。这个对象必须拥有 `next()` 方法，并能按需返回 `{ value, done }` 的结构。你可以手动实现逻辑，也可以通过生成器简化操作。

掌握这一能力，不仅能让你编写更优雅的遍历逻辑，也能加深你对 JavaScript 内部迭代机制的理解。在面试中，这类问题往往是高频考点，属于进阶基础，掌握它可以帮助你在候选人中脱颖而出。