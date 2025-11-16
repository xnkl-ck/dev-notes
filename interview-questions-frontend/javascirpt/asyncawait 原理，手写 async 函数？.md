# **async/await 原理，手写 async 函数？**

## 前言

async/await 是现代 JavaScript 处理中复杂异步流程的利器。它基于 Promise，使用同步的写法表现异步操作，大大提升了代码的可读性和维护性。深入理解 async/await 的原理以及手写 async 函数的过程，有助于全面掌握异步编程的底层机制。

## async/await 的基本原理

async 函数返回一个 Promise，await 表达式会暂停 async 函数的执行，等待 Promise 解决后恢复执行并返回结果。

本质上，async 函数是 Generator 函数和 Promise 的结合体，JavaScript 引擎内部会将 async 函数转成 Generator 函数，然后用一个执行器自动驱动 Generator，管理异步流程。

具体表现为：

- async 函数执行立即返回 Promise
- await 后的表达式被 Promise.resolve 包裹
- 函数暂停等待 Promise 解决，恢复时拿到结果继续执行
- 若 await 的 Promise 被拒绝，会抛出异常，可以用 try/catch 捕获

## 手写 async 函数的思路

用 Generator 实现 async/await，需要一个自动执行 Generator 的“执行器”，驱动 Generator 每次执行 `next()`，并处理返回的 Promise，等待它 resolve 后再继续。

示例手写实现如下：

```plain
function asyncToGenerator(genFn) {
  return function (...args) {
    const gen = genFn.apply(this, args);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let info;
        try {
          info = gen[key](arg);
        } catch (error) {
          reject(error);
          return;
        }
        const { value, done } = info;
        if (done) {
          resolve(value);
        } else {
          // 将 value 包装为 Promise，等待解决后继续执行
          Promise.resolve(value).then(
            val => step('next', val),
            err => step('throw', err)
          );
        }
      }
      step('next');
    });
  };
}
```

这个 `asyncToGenerator` 函数接收一个 Generator 函数，返回一个函数执行后返回 Promise，异步执行 Generator 里的代码，模拟 async 函数的行为。

## 示例对比

下面是一个用 async/await 和手写 Generator 的例子对比：

```plain
// async/await 版本
async function fetchData() {
  const res = await fetch('/api/data');
  const data = await res.json();
  return data;
}

// 手写 Generator + 执行器
function* fetchDataGen() {
  const res = yield fetch('/api/data');
  const data = yield res.json();
  return data;
}

const fetchDataManual = asyncToGenerator(fetchDataGen);
fetchDataManual().then(console.log);
```

这说明 async 函数背后就是 Generator + Promise 的组合，通过执行器自动驱动异步流程。

## 面试回答

async 函数其实是语法糖，本质上是 Generator 函数和 Promise 的结合。async 函数执行时会返回一个 Promise，函数体内用 await 暂停执行，等待 Promise 解决。

手写 async 的关键是实现一个执行器，这个执行器自动调用 Generator 的 next 方法，每次拿到一个 Promise，然后等待它 resolve，再继续调用 next，直到 Generator 执行完毕，最终返回一个 Promise。

这个执行器实现要能处理异常，通过 try/catch 捕获 Generator 执行时的错误，并通过 Promise 的 reject 传递。

理解 async/await 的原理，有助于更深入掌握异步编程，尤其是调试复杂异步代码和优化异步流程。

## 总结

async/await 极大提升了异步代码的可读性，本质是 Generator 函数与 Promise 的结合。手写 async 函数需要实现一个自动执行 Generator 的函数，递归处理每一步的 Promise。深入理解其原理，可以帮助更好地使用和调试异步代码，也便于掌握底层执行机制。