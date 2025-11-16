# **ES6 class 装饰器是如何实现的？**

## 前言

装饰器（Decorator）是一种用于修改类或类成员行为的设计模式。虽然 JavaScript 正式标准中尚未完全支持装饰器，但在 ES6+ 以及 TypeScript 等环境中，装饰器已经被广泛应用。它可以极大地增强代码的灵活性和可复用性。本文将介绍装饰器的基本原理及其在 ES6 class 中的实现方式。

## 装饰器的基本概念

装饰器是一个函数，接收目标（类、属性、方法等）作为参数，返回一个修改或替换后的目标。它用于在不修改原始代码的前提下，扩展或增强类的功能。

### 类装饰器

类装饰器接收类的构造函数，可以替换或扩展该类。

```plain
function classDecorator(target) {
  target.prototype.decorated = true;
}

@classDecorator
class MyClass {}
console.log(new MyClass().decorated); // true
```

### 方法装饰器

方法装饰器用于修改类的方法描述符。

```plain
function log(target, key, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`Calling ${key} with`, args);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

class MyClass {
  @log
  greet(name) {
    return `Hello, ${name}`;
  }
}
```

## ES6 环境下装饰器的实现方式

目前，JavaScript 尚未在标准中完全支持装饰器语法，但可以通过手动调用装饰器函数实现类似效果。

示例：

```plain
function classDecorator(target) {
  target.prototype.decorated = true;
  return target;
}

function methodDecorator(target, key, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`Called ${key}`);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

class MyClass {
  greet(name) {
    return `Hello, ${name}`;
  }
}

// 手动应用装饰器
MyClass = classDecorator(MyClass);
const descriptor = Object.getOwnPropertyDescriptor(MyClass.prototype, 'greet');
Object.defineProperty(MyClass.prototype, 'greet', methodDecorator(MyClass.prototype, 'greet', descriptor));

const obj = new MyClass();
console.log(obj.decorated); // true
obj.greet('World'); // Called greet  Hello, World
```

在实际开发中，通常借助 Babel 或 TypeScript 来支持装饰器语法并自动编译。

## 装饰器的应用场景

- 日志记录
- 权限校验
- 缓存处理
- 性能监控
- 自动绑定 `this`

## 注意事项

- 装饰器目前属于实验性特性，语法可能变更
- 需要借助编译工具支持
- 可能影响代码可读性，需合理使用

------

## 面试回答示范

**问题：ES6 class 装饰器是如何实现的？**

回答示例：

“装饰器是一个函数，可以用来扩展或修改类和类成员的行为。虽然 ES6 标准中尚未原生支持装饰器语法，但可以通过手动调用装饰器函数，传入类或方法描述符来实现类似功能。通常，借助 Babel 或 TypeScript 等编译工具，可以使用装饰器语法糖来简化开发。装饰器常用于日志、权限校验等场景。”

------

## 总结

装饰器为类的设计和扩展提供了灵活的机制，极大提升了代码的模块化和复用性。掌握装饰器原理及实现方式，有助于应对复杂业务逻辑，实现优雅的代码扩展方案。随着标准的成熟，装饰器将在 JavaScript 生态中扮演更重要的角色。