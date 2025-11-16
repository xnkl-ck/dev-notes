// 下面代码的输出结果是什么

const pro = new Promise((resolve, reject) => {
  resolve();
})
  .then((res) => {
    console.log(res.toString()); // 报错
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


// 1. 定义一个常量 'pro'，它将引用 *整个* Promise 链的最终结果
//    (即最后一个 .then() 返回的那个 Promise)
const pro = new Promise((resolve, reject) => {
  // 2. 立即将 Promise 状态变为 'resolved' (已成功)
  //    因为 resolve() 没有传递参数，所以它 'resolve' 的值是 undefined
  resolve();
})
  // 3. (同步注册) 为上一步的 'resolved' 注册 .then() 回调
  //    这个回调会在同步代码执行完毕后，作为 *微任务* (Microtask) 立即执行
  .then((res) => { // 7. (微任务) 回调执行，res 值为 undefined

    // 8. (微任务) 关键点：尝试在 undefined 上调用 .toString()
    //    这会立即抛出一个 TypeError (类型错误)
    //    导致这个 .then() 返回的 Promise 状态变为 'rejected' (已失败)
    console.log(res.toString()); // 报错

    // 9. (微任务) 因为上面一行已经抛出了错误，这行代码永远不会被执行
    return 2;
  })
  // 4. (同步注册) 注册 .catch() 回调
  //    它会捕获上一步 .then() 抛出的 TypeError
  .catch((err) => {
    // 10. (微任务) .catch() 块被触发，成功捕获错误
    // 11. (微任务) .catch() 块 'return 3;'
    //     这使得 .catch() 返回的新 Promise 变为 'resolved' 状态，值为 3
    //     (这被称为“错误恢复”)
    return 3;
  })
  // 5. (同步注册) 注册第二个 .then() 回调
  //    它监听的是上一步 .catch() 返回的 Promise
  //    这个回调也会被放入 *微任务队列*
  .then((res) => {
    // 12. (微任务) 由于 .catch() 返回了 'resolved(3)'，这个 .then() 被执行
    //     此时 res 值为 3
    // 13. (微任务) 打印 '3'
    console.log(res);
    // 14. (微任务) 这个回调函数没有显式 'return' 语句，
    //     因此它默认 'return undefined'。
    //     这使得它返回的 Promise (也就是 'pro') 状态变为 'resolved'，值为 undefined
  });

// 6. (同步注册) 设置一个 1000ms (1秒) 后执行的定时器
//    这个回调被放入 *宏任务队列* (Macrotask)
setTimeout(() => {
  // 16. (T=1000ms) 宏任务执行。
  //     此时，所有微任务 (上面的 .then/.catch 回调) 早已在 T=0ms+ 时执行完毕
  //     'pro' 变量已经是其最终状态：'resolved' 且值为 'undefined'
  console.log(pro); // 输出: Promise { undefined }
}, 1000);

// 15. (T=0ms) 同步代码执行完毕。
//     JavaScript 引擎开始处理微任务队列 (执行步骤 7 到 14)

// 运行结果
// 3
// Promise { undefined }


// 总结
// 同步执行 (T=0ms)：

// 整个 Promise 链被同步注册。pro 变量被声明。

// setTimeout 被同步注册，它的回调被放入 1 秒后的宏任务队列。

// 微任务执行 (T=0ms+)：

// 第一个 .then 执行，试图对 undefined 调用 .toString()，抛出 TypeError。

// .catch 捕获了这个 TypeError，并 return 3，将其"恢复"为一个 resolved(3) 的 Promise。

// 第二个 .then 接收到 3，打印 3。

// 第二个 .then（即 pro）隐式返回 undefined，使其最终状态变为 resolved(undefined)。

// 微任务队列清空。

// 宏任务执行 (T=1000ms)：

// 1 秒钟到达，setTimeout 的回调执行。

// console.log(pro) 执行，打印 pro 变量的最终状态：Promise { undefined }。