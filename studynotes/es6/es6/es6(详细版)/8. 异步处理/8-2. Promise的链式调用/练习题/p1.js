// 下面代码的输出结果是什么
const pro1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});

const pro2 = pro1.then((data) => {
  console.log(data);
  return data + 1;
});

const pro3 = pro2.then((data) => {
  console.log(data);
});

console.log(pro1, pro2, pro3);

setTimeout(() => {
  console.log(pro1, pro2, pro3);
}, 2000);

// 代码执行分析
// 我们将按照代码的执行顺序（Event Loop 机制）来分析：

// 1. 同步代码执行（T = 0 秒）
// 代码从上到下开始执行：

// const pro1 = ...

// pro1 被创建。

// Promise 内部的 setTimeout 被放入宏任务（Macrotask）队列，计划在 1000ms 后执行。

// 此时 pro1 的状态是 <pending>。

// const pro2 = ...

// pro1.then() 被调用，它会返回一个新的 Promise，赋值给 pro2。

// .then() 里的回调函数（console.log(data); return data + 1;）被放入 pro1 的微任务（Microtask）队列，等待 pro1 状态变为 resolved 时执行。

// 此时 pro2 的状态是 <pending>。

// const pro3 = ...

// pro2.then() 被调用，返回一个新的 Promise，赋值给 pro3。

// .then() 里的回调函数（console.log(data);）被放入 pro2 的微任务队列，等待 pro2 状态变为 resolved 时执行。

// 此时 pro3 的状态是 <pending>。

// console.log(pro1, pro2, pro3);

// 这是第一个同步执行的输出。

// 它会立即打印 pro1, pro2, pro3 当前的状态。

// 输出结果 1： Promise { <pending> } Promise { <pending> } Promise { <pending> }

// setTimeout(() => { ... }, 2000);

// 第二个 setTimeout 被放入宏任务队列，计划在 2000ms 后执行。

// 同步代码执行完毕。

// 2. 异步执行（T = 1 秒）
// 1000ms 到达： pro1 的 setTimeout 宏任务到期，被执行。

// resolve(1) 被调用。pro1 的状态从 <pending> 变为 resolved，并且值为 1。

// 微任务队列检查： 由于 pro1 状态变更，注册在它上面的 .then 回调（即 pro2 的回调）被推入微任务队列。

// 执行 pro2 的回调：

// console.log(data); 执行（此时 data 是 pro1 resolve 传来的 1）。

// 输出结果 2： 1

// return data + 1; 执行（返回 1 + 1 = 2）。

// 这个返回值 2 被用来 resolve pro2。pro2 的状态从 <pending> 变为 resolved，值为 2。

// 微任务队列检查： 由于 pro2 状态变更，注册在它上面的 .then 回调（即 pro3 的回调）被推入微任务队列。

// 执行 pro3 的回调：

// console.log(data); 执行（此时 data 是 pro2 resolve 传来的 2）。

// 输出结果 3： 2

// 这个回调函数没有 return 语句，所以它默认 return undefined。

// pro3 的状态从 <pending> 变为 resolved，值为 undefined。

// 微任务队列清空。

// 在 T=1000ms 之后的瞬间，所有 Promise 链都已执行完毕。

// 3. 异步执行（T = 2 秒）
// 2000ms 到达： 第二个 setTimeout 宏任务（console.log(pro1, pro2, pro3);）到期，被执行。

// 此时，它会打印 pro1, pro2, pro3 在这个时间点的最终状态：

// pro1 已经在 1000ms 时 resolved，值为 1。

// pro2 已经在 1000ms+ 之后 resolved，值为 2。

// pro3 已经在 1000ms++ 之后 resolved，值为 undefined。

// 输出结果 4： Promise { 1 } Promise { 2 } Promise { undefined }