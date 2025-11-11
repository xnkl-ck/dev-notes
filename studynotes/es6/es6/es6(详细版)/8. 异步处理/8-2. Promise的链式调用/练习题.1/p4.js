// 下面代码的输出结果是什么

new Promise((resolve, reject) => {
  resolve(1);
})
  .then((res) => {
    console.log(res);
    return new Error('2');
  })
  .catch((err) => {
    throw err;
    return 3;
  })
  .then((res) => {
    console.log(res);
  });

  // 1
  // Error: 2


  // 1. 创建一个新的 Promise
new Promise((resolve, reject) => {
  // 2. 立即将这个 Promise 状态变为 'resolved' (已成功)，值为 1
  resolve(1);
})
  // 3. (同步注册) 为上一步的 'resolved' 注册 .then() 回调
  //    这个回调会在 *微任务* (Microtask) 队列中立即执行
  .then((res) => { // 6. (微任务) 回调执行，res 值为 1
    // 7. (微任务) 打印 '1'
    console.log(res);

    // 8. (微任务) 关键点：'return' 一个 *new Error('2')* 对象。
    //    'return' 一个 Error 对象 *不等于* 'throw' 一个 Error。
    //    Error 对象本身只是一个普通的 JavaScript 对象。
    //    因此，这个 .then() 成功地 'resolve' 了，值为这个 Error 对象。
    //    它返回的新 Promise 状态变为 'resolved'，值为 Error('2')。
    return new Error('2');
  })
  // 4. (同步注册) 注册 .catch() 回调
  .catch((err) => {
    // 9. (微任务) 上一步 .then() 是 'resolved' 状态，不是 'rejected'。
    //    因此，这个 .catch() 块被完全跳过。
    throw err;
    return 3;
  })
  // 5. (同步注册) 注册第二个 .then() 回调
  //    它监听的是 .catch() 返回的 Promise
  .then((res) => {
    // 10. (微任务) .catch() 被跳过，它会“透明地”传递上一步的 'resolved' 值
    //     (即那个 Error('2') 对象)。
    //     所以这个 .then() 被执行，res 值为 Error('2')。
    // 11. (微任务) 打印 'Error: 2'
    console.log(res);
  });
// 12. (T=0ms) 同步代码执行完毕。
//     JavaScript 引擎开始处理微任务队列 (执行步骤 6 到 11)



// 总结
// 这道题的关键点在于区分 return new Error() 和 throw new Error()：

// new Promise 成功 resolve(1)。

// 第一个 .then 接收到 1，打印 1。

// 关键点： 第一个 .then return 了一个 Error('2') 对象。这被视为一次成功的返回，所以它返回的 Promise resolve(Error('2'))。

// .catch 块因为监听到的是 resolved 状态，所以被跳过。

// 第二个 .then 接收到了从第一个 .then “穿透” .catch 传递过来的 Error('2') 对象，并将其打印出来，即 Error: 2。
