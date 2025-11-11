// 下面代码的输出结果是什么

const pro = new Promise((resolve, reject) => {
  resolve(1);
})
  .then((res) => {
    console.log(res);
    return 2;
  })
  .catch((err) => {
    return 3;
  })
  .then((res) => {
    console.log(res);
  });

setTimeout(() => {
  console.log(pro);
}, 1000);


// 运行结果

// 1
// 2
// Promise { undefined }

// 1. 定义一个常量 'pro'，它将引用 *整个* Promise 链的最终结果
//    (即最后一个 .then() 返回的那个 Promise)
const pro = new Promise((resolve, reject) => {
  // 2. 立即将这个 Promise 状态变为 'resolved' (已成功)，值为 1
  resolve(1);
})
  // 3. (同步注册) 为上一步的 'resolved' 注册 .then() 回调
  //    这个回调会在同步代码执行完毕后，作为 *微任务* (Microtask) 立即执行
  .then((res) => { // 7. (微任务) 回调执行，res 值为 1
    // 8. (微任务) 打印 '1'
    console.log(res);
    // 9. (微任务) 返回 2。这使得 .then() 返回的新 Promise 变为 'resolved'，值为 2
    return 2;
  })
  // 4. (同步注册) 注册 .catch() 回调
  .catch((err) => {
    // 10. (微任务) 上一步是 'resolved' 状态，所以这个 .catch() 被跳过
    return 3;
  })
  // 5. (同步注册) 注册第二个 .then() 回调
  //    它监听的是 .catch() 返回的 Promise
  //    这个回调也会被放入 *微任务队列*
  .then((res) => {
    // 11. (微任务) .catch() 被跳过，它透明地传递了上一步的 'resolved' 值 (2)
    //     所以 res 值为 2
    // 12. (微任务) 打印 '2'
    console.log(res);
    // 13. (微任务) 这个回调函数没有显式 'return' 语句，
    //     因此它默认 'return undefined'。
    //     这使得它返回的 Promise (也就是 'pro') 状态变为 'resolved'，值为 undefined
  });

// 6. (同步注册) 设置一个 1000ms (1秒) 后执行的定时器
//    这个回调被放入 *宏任务队列* (Macrotask)
setTimeout(() => {
  // 15. (T=1000ms) 宏任务执行。
  //     此时，所有微任务 (上面的 .then 回调) 早已在 T=0ms+ 时执行完毕
  //     'pro' 变量已经是其最终状态：'resolved' 且值为 'undefined'
  console.log(pro); // 输出: Promise { undefined }
}, 1000);

// 14. (T=0ms) 同步代码执行完毕。
//     JavaScript 引擎开始处理微任务队列 (执行步骤 7, 8, 9, 10, 11, 12, 13)


// 总结
// 这是一个关于 JavaScript 事件循环（Event Loop）中微任务（Microtask）和宏任务（Macrotask）执行顺序的绝佳例子。

// 同步执行 (T=0ms)：

// 整个 Promise 链被同步注册。pro 变量被声明。

// setTimeout 被同步注册，它的回调被放入 1 秒后的宏任务队列。

// 微任务执行 (T=0ms+)：

// 同步代码执行完毕后，引擎立即检查微任务队列。

// 第一个 .then 执行，打印 1，并返回 2。

// .catch 被跳过。

// 第二个 .then 执行，接收到 2，打印 2，并隐式返回 undefined。

// 此时，pro（即最后一个 .then）的状态变为 resolved(undefined)。

// 微任务队列清空。

// 等待 (T=0ms+ 到 T=1000ms)：

// JavaScript 引擎处于空闲或等待状态。

// 宏任务执行 (T=1000ms)：

// 1 秒钟到达，setTimeout 的回调被放入宏任务队列并执行。

// console.log(pro) 执行，打印 pro 变量的最终状态：Promise { undefined }。
