# **Promise 了解多少？**

## 前言

在现代 JavaScript 开发中，异步编程无处不在。为了简化异步流程控制，Promise 被设计出来，成为 ES6 正式标准的一部分。它不仅能缓解“回调地狱”，还能提供更优雅的链式异步控制。理解 Promise 的本质、用法以及在实际开发中的应用，是每一个前端开发者都必须掌握的技能。

## 什么是 Promise？

Promise 是一种用于表示异步操作最终完成或失败的对象。它有三种状态：等待中（pending）、已完成（fulfilled）、已拒绝（rejected）。一个 Promise 实例只能从 pending 变为 fulfilled 或 rejected，一旦改变就不可逆。

基本用法如下：

```plain
const promise = new Promise((resolve, reject) => {
  if (/* 异步操作成功 */) {
    resolve(value);
  } else {
    reject(error);
  }
});

promise
  .then(result => {
    // 成功处理
  })
  .catch(error => {
    // 错误处理
  });
```

## Promise 的核心原理

Promise 本质上是一个状态机，初始为 pending 状态，在异步任务执行结束后通过 resolve 或 reject 改变状态。

它具备以下特点：

- 状态不可逆：一旦变为 fulfilled 或 rejected，状态就固定了。
- 支持链式调用：每次调用 then 返回一个新的 Promise 实例。
- 内部异步执行：then 和 catch 中的回调总是异步执行的。

## Promise 的常见用法

### 链式调用

可以在一个 then 后面继续接另一个 then，从而按顺序处理多个异步任务：

```plain
doSomething()
  .then(res => doAnother(res))
  .then(final => console.log(final))
  .catch(err => console.error(err));
```

### 并发处理：Promise.all

同时发起多个异步请求，并在全部完成后再继续：

```plain
Promise.all([fetch(url1), fetch(url2)])
  .then(([res1, res2]) => {
    // 两个请求都成功
  })
  .catch(err => {
    // 任一请求失败都会进入这里
  });
```

### 竞争处理：Promise.race

当只需要第一个返回结果时：

```plain
Promise.race([fetch(url1), fetch(url2)])
  .then(res => {
    // 最先返回的结果
  });
```

### 延迟操作

可以通过封装一个 Promise 实现延时：

```plain
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
await sleep(1000);
```

### 手动控制 resolve/reject

```plain
let externalResolve;
const p = new Promise(resolve => {
  externalResolve = resolve;
});
externalResolve('手动触发');
```

这种方式常用于封装复杂异步逻辑，如中断控制、组件状态切换等。

## Promise 的错误处理

Promise 的异常会被传递到最近的 catch 中：

```plain
someAsync()
  .then(() => {
    throw new Error('出错了');
  })
  .catch(err => {
    console.error(err.message); // 出错了
  });
```

也可以通过 `try/catch + async/await` 实现统一错误处理。

## 面试回答

Promise 是 ES6 引入的异步编程解决方案，它的核心作用是将异步操作封装成一个对象，并通过状态的变化来处理异步结果。它有三种状态：pending、fulfilled 和 rejected。通过调用 resolve 和 reject 分别代表异步成功或失败。

我通常使用 `then` 来处理成功逻辑，使用 `catch` 来捕获错误，也会使用 `finally` 来做统一的清理操作。链式调用是 Promise 的一大优势，可以清晰地表达多个异步任务之间的依赖关系。

在实际开发中，我还会用到 `Promise.all` 来并行多个异步请求，比如页面加载时需要同时获取用户信息和系统配置；也会用到 `Promise.race` 来做超时控制，比如发请求时设定 5 秒内无响应就中止。

Promise 的状态流转机制也很重要。比如 Promise 一旦变成 fulfilled 或 rejected 状态就无法再改变，而且 `then` 是异步执行的。

## 总结

Promise 是 JavaScript 异步编程的重要基石。它优雅地解决了回调地狱的问题，提供了强大的异步流程控制能力。在现代前端开发中，Promise 几乎无处不在。掌握 Promise，不仅是对代码可读性和可维护性的保障，也是深入理解 JavaScript 异步机制的前提。