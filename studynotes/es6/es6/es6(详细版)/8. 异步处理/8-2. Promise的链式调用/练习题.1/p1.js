// 下面代码的输出结果是什么

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
})
  .then((data) => {
    throw 3;
    return data + 1;
  })
  .then((data) => {
    console.log(data);
  });


  // 1. 创建一个新的 Promise
new Promise((resolve, reject) => {
  // 2. 设置一个 1000ms (1秒) 后执行的定时器 (宏任务)
  setTimeout(() => {
    // 3. (T=1000ms) 定时器回调执行，调用 resolve(1)
    //    Promise 状态变为 'resolved' (已成功)，值为 1
    resolve(1);
  }, 1000);
})
  // 4. (T=0ms) 为 'resolved' 状态注册第一个 .then() 回调
  .then((data) => { // 5. (T=1000ms+) 此回调执行，data 值为 1

    // 6. 关键点：立即 'throw 3;'
    //    这会使 .then() 返回的新 Promise 立即变为 'rejected' (已失败) 状态，
    //    并且 'rejected' 的值为 3
    throw 3;

    // 7. 因为 'throw' 会立即终止函数执行，
    //    所以 'return data + 1;' 这一行永远不会被执行
    return data + 1;
  })
  // 8. (T=0ms) 为上一个 .then() 返回的 Promise 注册第二个 .then() 回调
  .then((data) => {
    // 9. (T=1000ms+) 这个 .then() 监听到的是一个 'rejected' 状态的 Promise
    //    由于 .then() 只处理 'resolved' (成功) 状态，
    //    所以这个回调块被完全跳过。
    console.log(data);
  });

// 10. 最终，整个 Promise 链的最终状态是 'rejected' (值为 3)。
//     由于没有 .catch() 来处理这个最终的 'rejected'，
//     因此环境会抛出 "UnhandledPromiseRejectionWarning"。
