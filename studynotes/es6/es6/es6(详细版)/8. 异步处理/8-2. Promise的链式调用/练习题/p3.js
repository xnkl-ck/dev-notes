// 下面代码的输出结果是什么

new Promise((resolve, reject) => {
  resolve();
})
  .then((res) => {
    console.log(res.toString());
    return 2;
  })
  .catch((err) => {
    return 3;
  })
  .then((res) => {
    console.log(res);
  });
  

  // 1. 创建一个新的 Promise
new Promise((resolve, reject) => {
  // 2. 立即将 Promise 状态变为 'resolved' (已成功)
  //    因为 resolve() 没有传递参数，所以它 'resolve' 的值是 undefined
  resolve();
})
  // 3. 链式调用 .then()，它会接收到上一步传来的 'undefined'
  .then((res) => { // 此时 res 的值是 undefined

    // 4. 关键点：尝试在 undefined 上调用 .toString() 方法
    //    这会立即抛出一个 TypeError (类型错误)
    //    这个错误会导致这个 .then() 返回的 Promise 状态变为 'rejected' (已失败)
    console.log(res.toString());

    // 5. 因为上面一行已经抛出了错误，这行代码永远不会被执行
    return 2;
  })
  // 6. 关键点：.catch() 会捕获它前面链条中（即第一个 .then）
  //    产生的 'rejected' 状态和错误 (TypeError)
  .catch((err) => { // err 参数就是那个 TypeError 对象

    // 7. .catch() 块成功执行。
    //    它同样会返回一个新的 Promise。
    //    因为它成功 'return' 了 3，所以它返回一个 'resolved' 状态的 Promise，值为 3
    //    (这一步通常被称为“错误恢复”)
    return 3;
  })
  // 8. 这个 .then() 监听的是上一步 .catch() 返回的 Promise
  .then((res) => {
    // 9. 由于 .catch() 成功返回了一个 'resolved' 状态的、值为 3 的 Promise，
    //    所以这个 .then() 会被执行。
    //    此时，res 的值是 3
    console.log(res); // 最终输出：3
  });



// JavaScript代码解析

// 1. 创建一个新的 Promise
new Promise((resolve, reject) => {
  // 2. 立即将 Promise 状态变为 'resolved' (已成功)
  //    因为 resolve() 没有传递参数，所以它 'resolve' 的值是 undefined
  resolve();
})
  // 3. 链式调用 .then()，它会接收到上一步传来的 'undefined'
  .then((res) => { // 此时 res 的值是 undefined

    // 4. 关键点：尝试在 undefined 上调用 .toString() 方法
    //    这会立即抛出一个 TypeError (类型错误)
    //    这个错误会导致这个 .then() 返回的 Promise 状态变为 'rejected' (已失败)
    console.log(res.toString());

    // 5. 因为上面一行已经抛出了错误，这行代码永远不会被执行
    return 2;
  })
  // 6. 关键点：.catch() 会捕获它前面链条中（即第一个 .then）
  //    产生的 'rejected' 状态和错误 (TypeError)
  .catch((err) => { // err 参数就是那个 TypeError 对象

    // 7. .catch() 块成功执行。
    //    它同样会返回一个新的 Promise。
    //    因为它成功 'return' 了 3，所以它返回一个 'resolved' 状态的 Promise，值为 3
    //    (这一步通常被称为“错误恢复”)
    return 3;
  })
  // 8. 这个 .then() 监听的是上一步 .catch() 返回的 Promise
  .then((res) => {
    // 9. 由于 .catch() 成功返回了一个 'resolved' 状态的、值为 3 的 Promise，
    //    所以这个 .then() 会被执行。
    //    此时，res 的值是 3
    console.log(res); // 最终输出：3
  });

// 总结
// 第一个 .then 试图对 undefined 执行 .toString()，导致抛出 TypeError。

// 这个 TypeError 被紧随其后的 .catch 捕获。

// .catch 块成功执行并 return 3，这使得 Promise 链的状态从 rejected 恢复为 resolved。

// 最后一个 .then 接收到 .catch 返回的 3，并将其打印出来。