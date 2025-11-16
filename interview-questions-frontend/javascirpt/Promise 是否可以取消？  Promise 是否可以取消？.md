# Promise 是否可以取消？

## 前言

在前端开发中，我们经常使用 Promise 来处理异步任务，例如发起网络请求、读取文件等。但有一个明显的痛点是：Promise 一旦开始执行，就无法中断。相比之下，像 `XMLHttpRequest.abort()` 或某些事件监听器是可以取消的。那么，Promise 是否可以取消？如果不能，我们该如何实现「伪取消」机制？本文将围绕这个问题展开分析。

## Promise 为什么本身不能取消？

Promise 的设计初衷是“一旦创建就代表着某个将来会完成或失败的值”。它强调确定性和不可变性：状态一旦改变就无法再修改。

这就意味着，如果你发起了一个 Promise，它就一定会执行 resolve 或 reject，不论你是否还需要它的结果。

```plain
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve('完成'), 3000);
});

// 没有办法取消这个3秒的操作
```

即使你已经不再需要这个结果，Promise 仍然会继续执行内部逻辑。

## 如何实现可取消的异步任务？

虽然 Promise 本身不能取消，但我们可以借助其他机制来实现**「伪取消」**，最常见的方法有两种：标志位控制 和 利用 AbortController。

### 方法一：通过标志位手动控制是否处理结果

```plain
function cancellablePromise() {
  let canceled = false;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (canceled) return;
      resolve('完成');
    }, 3000);
  });

  return {
    promise,
    cancel: () => (canceled = true),
  };
}

const task = cancellablePromise();

task.promise.then(console.log); // 不会输出
task.cancel(); // 主动取消
```

这种方式是对外暴露一个 `cancel()` 方法，实质上没有停止定时器，只是忽略了结果处理。

### 方法二：使用 AbortController 搭配 Fetch 实现真正的取消

现代浏览器的 `fetch` 接口支持与 `AbortController` 结合使用：

```plain
const controller = new AbortController();

fetch('https://example.com/data', { signal: controller.signal })
  .then(res => res.json())
  .then(console.log)
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求被取消');
    }
  });

// 3秒后取消请求
setTimeout(() => controller.abort(), 3000);
```

这种方式可以真正中断底层的请求，是目前推荐的处理异步取消的方式。

### 第三方库支持取消

一些第三方库（如 Axios）也提供了取消功能，Axios 旧版本用 CancelToken，新版本支持原生 AbortController，使用方式类似。

## 取消 Promise 的未来可能

TC39 提案中曾提出 `Cancelable Promise`，但由于与现有语义冲突较大，已经被撤回。目前官方并没有内置取消功能的打算。

## 面试回答

Promise 本身是不能取消的，它设计成一旦开始就会完成或失败，状态一旦确定就不可逆。这是 Promise 的特性决定的。

但在实际开发中，我们确实经常需要「中断」一些异步操作，比如取消网络请求或防止用户点击后重复处理。虽然不能真正取消 Promise 本身，但我们可以通过一些机制来间接实现：

一种方式是使用标志位控制，只在 Promise 执行完后判断是否还需要处理结果。这种方式不能阻止内部操作，比如 setTimeout 还是会继续执行，只是我们忽略了 resolve 之后的处理。

另一种更优雅的方式是使用 AbortController，搭配 fetch 或支持该信号的库，能够真正中止网络请求，是目前前端比较标准的异步取消方案。

所以，总结来说，Promise 自身不支持取消，但通过标志位、AbortController 或第三方库可以实现异步任务的取消控制。

## 总结

Promise 的不可取消性是其一大限制，但在实际开发中我们有多种手段来规避这一问题。理解 Promise 的设计哲学，结合 AbortController、标志位或适配库的使用，我们依然可以灵活掌控异步任务的执行与中断，为用户带来更优的交互体验。