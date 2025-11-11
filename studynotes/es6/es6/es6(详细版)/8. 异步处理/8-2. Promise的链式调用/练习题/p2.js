// 下面代码的输出结果是什么

new Promise((resolve, reject) => {
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


  // 这段代码的输出结果是：

  // 1
  // 2
  // 为什么是这个结果？（代码解析）
  // 这段代码展示了 Promise 链式调用中的 resolve（成功）路径和 .catch（失败）的跳过机制。
  
  // 我们一步一步来分析：
  
  // new Promise((resolve, reject) => { resolve(1); })
  
  // 创建了一个新的 Promise。
  
  // resolve(1) 立即被调用，这个 Promise 的状态立刻变为 resolved（已成功），并且值为 1。
  
  // .then((res) => { ... })
  
  // 这是第一个 .then，它会接收上一步 resolve 传来的值 1。
  
  // res 变量的值是 1。
  
  // console.log(res); 执行，打印出 1。
  
  // 这个函数 return 2;。
  
  // 关键点： .then 本身会返回一个新的 Promise。因为这个 .then 成功执行并返回了 2，所以它返回的新 Promise 会 resolve(2)。
  
  // .catch((err) => { ... })
  
  // .catch 是用来捕获 reject（失败）状态的。
  
  // 它所监听的是上一步（即第一个 .then）返回的 Promise。
  
  // 由于上一步的 Promise 是 resolved（成功）状态，值为 2，并不是 rejected 状态。
  
  // 因此，这个 .catch 块被完全跳过。
  
  // .then((res) => { ... })
  
  // 这是第二个 .then。它所监听的是上一步（即 .catch）返回的 Promise。
  
  // 关键点： 尽管 .catch 被跳过了，但它依然会返回一个 Promise。这个 Promise 会“透明地”传递上一个 Promise（即第一个 .then）的成功结果。
  
  // 所以，这个 .then 接收到的 res 值，就是从第一个 .then 传递过来的 2。
  
  // console.log(res); 执行，打印出 2。
  
  // 总结
  // 第一个 console.log 打印的是初始 Promise resolve 的值 1。
  
  // .catch 因为没有监听到错误（reject）而被跳过。
  
  // 第二个 console.log 打印的是第一个 .then 成功 return 的值 2，这个值“穿透”了被跳过的 .catch。

