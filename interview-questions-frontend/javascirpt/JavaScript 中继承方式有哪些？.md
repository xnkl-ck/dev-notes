# **JavaScript 中继承方式有哪些？**

## 前言

继承是面向对象编程的核心概念之一，JavaScript 作为一种基于原型的语言，继承机制与传统类继承有所不同。理解 JavaScript 的各种继承方式，有助于写出更加灵活、高效的代码。本文将系统介绍 JavaScript 中常见的继承方式及其优缺点。

## 常见继承方式解析

### 原型链继承

通过让子类的原型指向父类的实例，实现继承父类属性和方法。

```plain
function Parent() {
  this.name = 'parent';
}
Parent.prototype.say = function () {
  console.log(this.name);
};

function Child() {}
Child.prototype = new Parent();

const c = new Child();
c.say(); // 'parent'
```

优点：简单，能够继承父类所有属性和方法。

缺点：引用类型属性被所有实例共享；无法向父类构造函数传参。

### 借用构造函数继承（经典继承）

在子类构造函数内部调用父类构造函数，借用其作用域。

```plain
function Parent(name) {
  this.name = name;
}
function Child(name) {
  Parent.call(this, name);
}
const c = new Child('child');
console.log(c.name); // 'child'
```

优点：解决了引用类型共享问题，可以传参。

缺点：方法都在构造函数中定义，无法实现函数复用。

### 组合继承

结合原型链继承和借用构造函数继承的优点。

```plain
function Parent(name) {
  this.name = name;
}
Parent.prototype.say = function () {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}
Child.prototype = new Parent();
Child.prototype.constructor = Child;
```

优点：避免引用共享，方法复用。

缺点：父类构造函数会调用两次，性能略有影响。

### 原型式继承

基于 `Object.create()`，创建一个新对象作为原型。

```plain
const parent = {
  name: 'parent',
  say() {
    console.log(this.name);
  }
};
const child = Object.create(parent);
child.name = 'child';
child.say(); // 'child'
```

优点：实现继承的简单方式。

缺点：无法实现构造函数传参。

### 寄生式继承

基于原型式继承，在创建对象基础上增强功能。

```plain
function createChild(parent) {
  const child = Object.create(parent);
  child.sayHello = function () {
    console.log('hello');
  };
  return child;
}
```

### 寄生组合继承

优化组合继承，避免调用两次父类构造函数。

```plain
function inheritPrototype(child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
}
```

此为 ES5 中继承的最优方案。

### ES6 class 继承

使用 `class` 和 `extends` 关键字语法，底层依旧是原型链继承。

```plain
class Parent {
  constructor(name) {
    this.name = name;
  }
  say() {
    console.log(this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
}
```

语法简洁，易读，且支持 `super` 调用。

------

## 面试回答示范

**问题：请说说 JavaScript 中有哪些继承方式？它们有什么区别？**

回答示例：

“JavaScript 中继承主要有原型链继承、借用构造函数继承、组合继承、原型式继承、寄生式继承、寄生组合继承和 ES6 的 class 继承。原型链继承简单但会导致引用类型共享问题，借用构造函数继承能解决共享问题但方法不能复用，组合继承结合两者优点但调用了两次父构造函数，寄生组合继承优化了组合继承调用次数，ES6 class 继承语法更简洁，功能更强。”

------

## 总结

理解各种继承方式的原理及优缺点，有助于选择最合适的继承方案，应对不同业务场景。ES6 语法大大简化了继承的书写和理解，但底层依然是原型链机制。熟悉传统继承方式也能帮助我们更好地理解 JavaScript 的对象模型。