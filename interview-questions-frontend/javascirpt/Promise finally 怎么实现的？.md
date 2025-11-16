# **Promise finally 怎么实现的？**

## 前言

在使用 Promise 处理异步任务的过程中，我们经常需要在任务完成之后执行一些清理操作，比如关闭 loading、释放资源、重置状态等。无论 Promise 最终是成功还是失败，我们都希望这些收尾逻辑能够被执行。这正是 `Promise.prototype.finally()` 的用途所在。

本篇文章将深入讲解 finally 的行为特性、底层实现原理以及实际使用场景，帮助你全面理解这个方法在异步编程中的价值。

## finally 的作用与特性

`finally` 方法可以在 Promise 被 resolve 或 reject 之后执行一个不带参数的回调函数，不影响链式调用的值传递。

示例：

```plain
fetch('/api/data')
  .then(res => res.json())
  .catch(err => console.error('请求出错', err))
  .finally(() => {
    console.log('请求完成，关闭 loading');
  });
```

不管上面的请求成功还是失败，finally 都会执行。它更像是一个“兜底收尾”，但它不会接收到 `then` 或 `catch` 的参数，也不会更改后续链式调用的值。

## finally 的执行时机和返回值

- finally 是在前一个 then 或 catch 执行完成后触发的。
- finally 的返回值不会影响后续的 Promise 链。
- 如果 finally 抛出了异常或返回了一个 reject 状态的 Promise，那么最终链式调用将进入 reject 分支。

示例1：正常执行

```plain
Promise.resolve('ok')
  .finally(() => {
    console.log('finally');
  })
  .then(res => {
    console.log('then:', res);
  });
```

输出为：

```plain
finally
then: ok
```

示例2：finally 抛出异常

```plain
Promise.resolve('ok')
  .finally(() => {
    throw new Error('出错了');
  })
  .then(res => {
    console.log('then:', res);
  })
  .catch(err => {
    console.log('catch:', err.message);
  });
```

输出为：

```plain
catch: 出错了
```

说明 finally 本身也可能中断 Promise 链。

## finally 的底层实现原理（简化模拟）

在没有 finally 的时候，我们通常会这么写：

```plain
promise
  .then(res => {
    // 处理结果
  })
  .catch(err => {
    // 处理错误
  })
  .then(() => {
    // 相当于 finally
  });
```

而 finally 本质上也是一种链式封装，可以模拟实现如下：

```plain
Promise.prototype.myFinally = function (callback) {
  return this.then(
    value => Promise.resolve(callback()).then(() => value),
    reason => Promise.resolve(callback()).then(() => { throw reason })
  );
};
```

这个实现的核心思路是：不管当前 Promise 是成功还是失败，都先执行 `callback()`，再将原始的 value 或 reason 继续传递下去。

## 实际使用场景

1. 接口请求后的 loading 关闭：

```plain
this.loading = true;
axios.get('/api')
  .then(res => {
    this.data = res.data;
  })
  .catch(() => {
    this.error = true;
  })
  .finally(() => {
    this.loading = false;
  });
```

1. 提交表单后无论成功失败都重置按钮状态：

```plain
submitForm()
  .finally(() => {
    this.isSubmitting = false;
  });
```

1. 数据上传完成后清理临时文件、关闭文件句柄等资源释放场景。

## 面试回答

finally 是 Promise 提供的一个方法，用来在任务无论成功还是失败之后执行一个回调。这个回调不接收任何参数，主要用途是做一些收尾动作，比如关闭 loading，或者清除临时数据。

它的执行时机是在 then 或 catch 执行之后，不管前面是 resolve 还是 reject，finally 都会被调用。而且 finally 不会影响后续 Promise 链的值传递。比如如果 Promise 原本是 resolve('ok')，执行完 finally 后还是会把 'ok' 传到后面的 then。

但是有个需要注意的点：如果 finally 自己内部抛出了异常，或者返回的是一个 rejected 的 Promise，那整个链就会中断，进入 catch 分支。这是实际开发中要特别注意的。

另外，finally 也可以用 then + catch 模拟实现，原理就是在成功和失败的分支里都执行 callback，然后继续传递原本的值或者错误。

实际工作中，我用 finally 最多的场景就是在异步请求结束后关闭 loading 状态，不管请求成功还是失败，finally 都会被调用，很适合做 loading 状态的清理。

## 总结

Promise 的 finally 方法是异步编程中的一个小而强大的工具。它能让代码更加简洁、清晰，特别适合在异步任务完成后做统一的资源清理和 UI 更新操作。它本身不会改变 Promise 的值传递逻辑，但如果使用不当也可能影响错误处理流程。理解其原理与行为特性，有助于写出更健壮、更具可维护性的异步逻辑。