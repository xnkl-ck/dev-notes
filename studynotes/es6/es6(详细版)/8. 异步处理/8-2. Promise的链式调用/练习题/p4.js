// 下面代码的输出结果是什么

new Promise((resolve, reject) => {
  throw new Error(1);
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


  // 1. 创建一个新的 Promise
new Promise((resolve, reject) => {
  // 2. 在 Promise 的执行器 (executor) 内部立即抛出一个错误。
  //    这会导致这个 Promise 立即变为 'rejected' (已失败) 状态，
  //    并且 'rejected' 的值为 new Error(1)
  throw new Error(1);
})
  // 3. 链式调用 .then()。
  //    .then() 只会处理 'resolved' (成功) 状态。
  //    由于它所监听的 Promise 是 'rejected' 状态，
  //    所以这个 .then() 块被完全跳过。
  .then((res) => {
    console.log(res);
    return new Error('2');
  })
  // 4. 链式调用 .catch()。
  //    .catch() 会捕获前面（即 new Promise）的 'rejected' 状态。
  //    此时，err 变量的值是 new Error(1)。
  .catch((err) => {
    // 5. 关键点：在 .catch() 内部再次 'throw' 错误。
    //    这会导致 .catch() 返回的这个新 Promise 
    //    也立即变为 'rejected' 状态，值为被抛出的 err (即 new Error(1))。
    throw err;

    // 6. 因为 'throw' 会立即终止函数执行，
    //    所以 'return 3;' 这一行永远不会被执行。
    return 3;
  })
  // 7. 链式调用 .then()。
  //    这个 .then() 监听的是上一步 .catch() 返回的 Promise。
  //    由于上一步的 .catch() 抛出了错误，导致其 Promise 变为 'rejected'，
  //    所以这个 .then() 块也被完全跳过。
  .then((res) => {
    console.log(res);
  });

// 8. 最终，整个 Promise 链的最终状态是 'rejected' (值为 new Error(1))。
//    由于没有后续的 .catch() 来处理这个最终的 'rejected'，
//    因此环境会抛出 "UnhandledPromiseRejectionWarning"。

