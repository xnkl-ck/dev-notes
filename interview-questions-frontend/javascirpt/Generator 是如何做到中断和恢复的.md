# **Generator 是如何做到中断和恢复的**

## 前言

Generator 是 JavaScript 中一种特殊的函数，能够暂停和恢复执行。它不仅支持函数中间暂停，还可以在暂停点传递和接收值，这种特性使其成为处理异步操作、迭代器和协程的重要工具。理解 Generator 如何实现中断与恢复，有助于掌握异步编程和复杂流程控制。

本文将深入解析 Generator 的工作原理，以及它如何做到函数执行的中断和恢复。

## Generator 函数及其执行流程

Generator 函数用 `function*` 声明，执行后返回一个迭代器对象。迭代器对象有 `next()` 方法，调用它会执行 Generator 内部代码直到遇到 `yield` 关键字暂停。

调用 `next()` 后：

- 函数执行从上次暂停位置恢复
- 遇到第一个 `yield` 表达式时暂停，返回一个包含 `{ value, done }` 的对象
- `value` 是 `yield` 表达式右侧的值，`done` 标识是否执行完成

示例：

```plain
function* gen() {
  console.log('开始');
  const val = yield 1;
  console.log('接收到:', val);
  yield 2;
  return 3;
}

const iterator = gen();
console.log(iterator.next()); // 执行到第一个 yield，输出 { value:1, done:false }
console.log(iterator.next('test')); // 传入 'test'，继续执行，输出 { value:2, done:false }
console.log(iterator.next()); // 执行完成，输出 { value:3, done:true }
```

## 如何实现中断与恢复？

Generator 内部维护一个执行上下文和状态机：

- 状态机的状态包括：初始态、执行中、暂停、结束等
- 每次调用 `next()`，状态机根据当前状态切换执行位置
- 执行上下文保存局部变量、执行栈、指令指针（下一条执行代码位置）
- 遇到 `yield`，暂停执行，保存当前执行上下文状态，返回结果
- 下次调用 `next()`，恢复执行上下文，从暂停处继续

这种机制实现了函数体在多次调用间的“断点续传”，看起来像函数执行被“暂停”和“恢复”。

## 传递参数与异常处理

调用 `next(value)` 可以向 Generator 内部传递值，该值会被赋给上一个 `yield` 表达式的位置。

此外，迭代器还有 `throw()` 方法，可以向 Generator 内部抛出异常，触发内部异常处理逻辑。

这进一步增强了 Generator 控制流的灵活性。

## Generator 中断与恢复的底层实现（原理层面）

JavaScript 引擎在执行 Generator 函数时，会把它转成状态机：

- 将函数代码拆分成多个“状态块”，每个 `yield` 是一个状态转换点
- 执行时根据当前状态跳转执行代码块
- 局部变量和作用域链被封装成执行上下文，保存在内存中，保证多次 `next()` 调用时数据不丢失

这种实现类似协程，使得 Generator 能像线程一样在执行间暂停与恢复，但不涉及多线程。

## 应用场景

- 异步流程控制：配合执行器自动驱动异步流程，如 async/await 底层原理
- 自定义迭代器：实现惰性序列生成等复杂迭代逻辑
- 状态机设计：利用 Generator 控制流程状态，简化代码复杂度

## 面试回答

Generator 是通过内部维护执行上下文和状态机，实现函数执行的中断和恢复。函数执行遇到 `yield` 语句时暂停，保存当前状态，返回 `yield` 后的值。后续调用 `next()` 会恢复执行上下文，从暂停处继续执行。

这种状态机和执行上下文机制使得 Generator 函数能够在多次调用中断点续传，实现复杂的控制流程。传入 `next(value)` 可以向函数内部传递参数，`throw()` 则能向 Generator 内部抛出异常，增强了控制流能力。

JavaScript 引擎通过将 Generator 函数编译成状态机，并管理其上下文，确保每次调用 `next()` 时都能正确恢复执行，这也是 Generator 在异步编程和迭代器设计中的强大基础。

## 总结

Generator 函数利用状态机和执行上下文机制，实现了函数的暂停和恢复。通过 `yield` 关键字，Generator 将函数执行切分成多个阶段，支持传入参数和异常处理。深入理解其内部原理，有助于掌握异步流程控制、复杂迭代以及协程的实现。