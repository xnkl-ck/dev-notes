# **Promise 构造函数是同步执行还是异步执行？then 方法呢？**

## 前言

理解 Promise 的执行时机是掌握异步编程的关键。在实际开发中，经常会遇到这样的问题：为什么某些代码先执行，某些代码后执行？很多人误以为只要用了 Promise，里面的代码就是异步执行的。但真相并非如此。本文将围绕 Promise 构造函数和 `then` 方法的执行时机进行深入解析，帮助你厘清同步与异步的边界。

## Promise 构造函数是同步执行的

当你创建一个 Promise 实例时，传入构造函数的回调会**立即执行**，并不会异步延迟。

```plain
const p = new Promise((resolve, reject) => {
  console.log('执行 Promise 内部');
  resolve('ok');
});
console.log('外部逻辑');
```

输出结果如下：

```plain
执行 Promise 内部
外部逻辑
```

可以看出，Promise 的构造函数中的内容是**同步执行的**，不会被放到事件队列中等待。

这个同步执行行为很关键，它意味着你在创建 Promise 的时候，就已经开始执行它所封装的逻辑。

## then 方法是异步的（微任务）

与构造函数不同，`then` 方法的回调函数会被推入微任务队列，在当前宏任务完成之后再执行。

```plain
const p = new Promise((resolve) => {
  resolve('ok');
});

p.then((res) => {
  console.log('then 回调');
});

console.log('同步逻辑');
```

输出为：

```plain
同步逻辑
then 回调
```

这说明 `then` 是异步的，哪怕 Promise 已经是 resolved 状态，`then` 注册的回调也不会立刻执行，而是等待当前同步代码全部执行完后再进入微任务阶段执行。

## setTimeout 与 then 的执行顺序比较

进一步地，可以通过比较 `setTimeout` 与 `then` 的执行顺序，加深对微任务与宏任务的理解。

```plain
Promise.resolve().then(() => {
  console.log('微任务');
});

setTimeout(() => {
  console.log('宏任务');
}, 0);

console.log('同步任务');
```

输出结果：

```plain
同步任务
微任务
宏任务
```

说明：

- 同步任务先执行
- 微任务（如 Promise 的 then）优先于宏任务（如 setTimeout）

## 实践中的影响与误区

很多初学者误以为 Promise 的构造函数是异步的，写出如下代码后发现结果不如预期：

```plain
let data;
new Promise((resolve) => {
  resolve(100);
}).then((res) => {
  data = res;
});
console.log(data); // 不是 100，而是 undefined
```

这里的问题在于 `then` 是异步的，`console.log(data)` 在 `then` 回调之前就已经执行。

正确做法是将逻辑写入 `then` 回调或使用 async/await。

## 面试回答

Promise 构造函数是同步执行的，也就是说你在创建 Promise 实例的时候，传进去的那个函数会立即执行。这是一个容易误解的地方，很多人以为只要是 Promise 就是异步的，其实不对。

真正异步的是 `then` 方法的回调，也就是你调用 `promise.then(() => {})` 之后，里面的逻辑不会立刻执行，而是会被放入微任务队列，在当前同步代码和同步任务完成之后才会执行。

这也是为什么你在代码中调用 `then` 后面立即 `console.log()`，会先看到 `console.log` 的结果，再看到 `then` 的回调输出。

总结一下，Promise 的构造函数是同步的，then 是异步的，它的回调被安排在微任务队列中，比宏任务（像 setTimeout）优先执行。

## 总结

Promise 构造函数是同步执行的，这意味着创建 Promise 的那一刻，内部逻辑就已经开始运行。而 then 方法的回调是异步的，属于微任务队列，会在当前调用栈清空之后执行。掌握这一区别，对于理解 Promise 的运行机制、编写正确的异步逻辑、避免常见的逻辑错误至关重要。