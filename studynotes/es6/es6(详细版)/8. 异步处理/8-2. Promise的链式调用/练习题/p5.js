// 下面的代码输出什么

const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject();
  }, 1000);
});
const promise2 = promise1.catch(() => {
  return 2;
});

console.log('promise1', promise1);  
console.log('promise2', promise2); 

setTimeout(() => {
  console.log('promise1', promise1);
  console.log('promise2', promise2);
}, 2000);



// 1. 创建一个新的 Promise, 命名为 promise1
const promise1 = new Promise((resolve, reject) => {
  // 2. 设置一个 1000ms (1秒) 后执行的定时器 (宏任务)
  setTimeout(() => {
    // 4. (T=1000ms) 定时器回调执行，调用 reject()
    //    这使 promise1 的状态变为 'rejected' (已失败)，失败原因为 undefined
    reject();
  }, 1000);
});

// 3. (T=0ms) 立即为 promise1 注册一个 .catch() 处理器
//    .catch() 会返回一个 *新的* Promise，命名为 promise2
//    此时 promise2 的状态是 'pending'，因为它在等待 promise1 的结果
const promise2 = promise1.catch(() => {
  // 5. (T=1000ms后) 当 promise1 变为 'rejected' 时，这个回调会执行 (微任务)
  // 6. 这个回调成功地 'return 2;'
  //    这使得 promise2 的状态变为 'resolved' (已成功)，值为 2
  return 2;
});

// 7. (T=0ms) 立即执行同步代码，打印 'promise1'
//    此时，promise1 内部的 setTimeout 还在等待，所以 promise1 是 'pending'
console.log('promise1', promise1); // 输出: promise1 Promise { <pending> }

// 8. (T=0ms) 立即执行同步代码，打印 'promise2'
//    此时，promise2 也在等待 promise1 的结果，所以 promise2 也是 'pending'
console.log('promise2', promise2); // 输出: promise2 Promise { <pending> }

// 9. (T=0ms) 设置一个 2000ms (2秒) 后执行的定时器 (宏任务)
setTimeout(() => {
  // 10. (T=2000ms) 这个回调在 promise1 被 reject (在1000ms时) 之后执行
  //     打印 promise1 的 *最终* 状态，它已经是 'rejected'
  console.log('promise1', promise1); // 输出: promise1 Promise { <rejected>: undefined }

  // 11. (T=2000ms) 打印 promise2 的 *最终* 状态
  //     在 1000ms 时，promise1 被 reject，其 .catch() 被触发并返回了 2，
  //     所以 promise2 已经变为 'resolved' 状态，值为 2
  console.log('promise2', promise2); // 输出: promise2 Promise { 2 }
}, 2000);





// 1. 创建一个新的 Promise, 命名为 promise1
const promise1 = new Promise((resolve, reject) => {
  // 2. 设置一个 1000ms (1秒) 后执行的定时器 (宏任务)
  setTimeout(() => {
    // 4. (T=1000ms) 定时器回调执行，调用 reject()
    //    这使 promise1 的状态变为 'rejected' (已失败)，失败原因为 undefined
    reject();
  }, 1000);
});

// 3. (T=0ms) 立即为 promise1 注册一个 .catch() 处理器
//    .catch() 会返回一个 *新的* Promise，命名为 promise2
//    此时 promise2 的状态是 'pending'，因为它在等待 promise1 的结果
const promise2 = promise1.catch(() => {
  // 5. (T=1000ms后) 当 promise1 变为 'rejected' 时，这个回调会执行 (微任务)
  // 6. 这个回调成功地 'return 2;'
  //    这使得 promise2 的状态变为 'resolved' (已成功)，值为 2
  return 2;
});

// 7. (T=0ms) 立即执行同步代码，打印 'promise1'
//    此时，promise1 内部的 setTimeout 还在等待，所以 promise1 是 'pending'
console.log('promise1', promise1); // 输出: promise1 Promise { <pending> }

// 8. (T=0ms) 立即执行同步代码，打印 'promise2'
//    此时，promise2 也在等待 promise1 的结果，所以 promise2 也是 'pending'
console.log('promise2', promise2); // 输出: promise2 Promise { <pending> }

// 9. (T=0ms) 设置一个 2000ms (2秒) 后执行的定时器 (宏任务)
setTimeout(() => {
  // 10. (T=2000ms) 这个回调在 promise1 被 reject (在1000ms时) 之后执行
  //     打印 promise1 的 *最终* 状态，它已经是 'rejected'
  console.log('promise1', promise1); // 输出: promise1 Promise { <rejected>: undefined }

  // 11. (T=2000ms) 打印 promise2 的 *最终* 状态
  //     在 1000ms 时，promise1 被 reject，其 .catch() 被触发并返回了 2，
  //     所以 promise2 已经变为 'resolved' 状态，值为 2
  console.log('promise2', promise2); // 输出: promise2 Promise { 2 }
}, 2000);

{/* // 总结
总结
这是一个关于 Promise 状态和事件循环（Event Loop）的经典例子。

T = 0 秒 (同步执行)：

promise1 和 promise2 被创建，两者都是 <pending> 状态。

第一个 console.log 打印 promise1 Promise { <pending> }。

第二个 console.log 打印 promise2 Promise { <pending> }。

两个 setTimeout 被注册到事件队列中。

T = 1 秒 (第一个宏任务 + 微任务)：

第一个 setTimeout (1000ms) 的回调执行。

reject() 被调用，promise1 的状态变为 <rejected>: undefined。

由于 promise1 被 reject，它注册的 .catch() 回调被放入微任务队列。

微任务队列立即执行 .catch() 回调。

回调 return 2;。

promise2（即 .catch() 返回的 Promise）的状态变为 <resolved>: 2。

T = 2 秒 (第二个宏任务)：

第二个 setTimeout (2000ms) 的回调执行。

它打印 promise1 的最终状态：promise1 Promise { <rejected>: undefined }。

它打印 promise2 的最终状态：promise2 Promise { 2 }。 */}



// promise1 Promise { <pending> }
// promise2 Promise { <pending> }
// promise1 Promise { <rejected>: undefined }
// promise2 Promise { 2 }
