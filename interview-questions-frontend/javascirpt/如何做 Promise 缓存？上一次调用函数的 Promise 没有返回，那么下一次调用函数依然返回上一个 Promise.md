# **如何做 Promise 缓存？上一次调用函数的 Promise 没有返回，那么下一次调用函数依然返回上一个 Promise**

## 前言

在前端开发中，某些异步操作，比如接口请求或数据计算，可能会被频繁调用。为了避免重复执行相同的异步任务，提高性能和资源利用率，常用 Promise 缓存机制来复用已有的 Promise 实例。本文将详细讲解 Promise 缓存的实现思路、典型场景及注意事项，帮助你理解并应用这项技术。

## Promise 缓存的核心思路

Promise 缓存的目标是让函数在异步操作未完成时，后续的调用返回同一个 Promise，而不是重复发起新的异步请求。这样，避免了相同请求重复执行，提高了效率。

核心做法是：

1. 在函数外部或闭包中保存一个变量，存储当前正在进行的 Promise。
2. 当函数被调用时，检查缓存变量是否存在且仍然有效（未 resolve 或 reject）。
3. 如果存在，直接返回该 Promise。
4. 如果不存在，执行异步操作，产生新的 Promise 并缓存，最后返回它。
5. Promise 状态变更后，可以选择清空缓存，允许下次调用重新执行。

## 示例代码实现

```plain
function createCachedAsyncFunction(asyncFunc) {
  let cachePromise = null;

  return function () {
    if (cachePromise) {
      return cachePromise;
    }
    cachePromise = asyncFunc().finally(() => {
      cachePromise = null; // 任务完成后清空缓存
    });
    return cachePromise;
  };
}

// 使用示例
const fetchData = createCachedAsyncFunction(() => fetch('/api/data').then(res => res.json()));

fetchData().then(data => console.log('第一次调用', data));
fetchData().then(data => console.log('第二次调用，复用第一次的 Promise', data));
```

在以上代码中，如果第一次调用未完成，第二次调用直接返回同一个 Promise。

## 缓存的适用场景

1. **接口防抖**
   用户短时间内多次点击请求按钮时，避免重复请求。
2. **数据共享**
   多个组件同时请求同一份数据，避免重复拉取。
3. **计算任务缓存**
   复杂计算函数异步执行时，缓存 Promise 避免重复计算。

## 注意事项

- 缓存的 Promise 一旦被清空，下次调用会重新发起请求，要根据业务需要选择缓存时长。
- 如果异步任务失败（reject），也应该清空缓存，避免一直返回错误 Promise。
- 缓存适用于无副作用且结果稳定的异步操作，避免因为缓存导致数据不同步问题。

## 面试回答

实现 Promise 缓存的关键是在函数外部维护一个变量用来存储当前的 Promise。函数调用时，判断这个缓存是否存在，如果存在且异步任务还没完成，直接返回这个 Promise，避免重复执行异步操作。

我会使用 `.finally()` 方法在 Promise 完成（不论成功或失败）后清空缓存，确保缓存不会永久占用，且失败后也能重新尝试。

这样设计非常适合接口防抖和共享数据的场景，比如多个组件请求同一个接口，或者防止用户重复点击发起重复请求。

不过需要注意的是，缓存的 Promise 必须是无副作用且结果稳定的异步任务，避免缓存导致数据不一致。

如果异步任务失败，缓存也需要清理，以防后续调用返回失败的旧 Promise。

整体实现比较简单，但能够显著提升性能和用户体验。

## 总结

Promise 缓存是一种高效复用异步任务结果的方案。它通过缓存当前执行的 Promise，避免重复请求和计算。合理设计缓存时机和清理逻辑，可以让异步操作更高效且稳定。在实际项目中，Promise 缓存常用于接口防抖、多组件共享数据等场景，是前端性能优化的实用技巧。