# **JS 里是否可能存在：对象有一个 name 属性，原型链上也有一个同名 name 属性？**

## 前言

JavaScript 中的对象系统支持继承机制，其中原型链是实现继承的核心。由于对象和它的原型链可以分别拥有自己的属性，现实中可能会出现对象本身与其原型链上存在同名属性的情况。本文将围绕“对象自身和原型链是否能有同名属性”这个问题，进行深入解析。

## 属性覆盖与同名属性机制

JavaScript 中的属性查找是“从下往上”的机制：即从对象本身开始查找，找不到再去其原型查找，再往上查找原型的原型，直到 `Object.prototype` 为止。

如果一个对象自身拥有某个属性，即使它的原型链上也有同名属性，访问时会优先使用对象自身的那个。这种现象称为“属性屏蔽”（property shadowing）或“属性覆盖”。

### 举个例子：

```javascript
function Person() {}
Person.prototype.name = 'PrototypeName';

const p = new Person();
p.name = 'OwnName';

console.log(p.name); // 输出 OwnName
```

在这个例子中：

- `p` 是一个实例
- `p` 自身有一个 `name` 属性，值为 `'OwnName'`
- 它的原型 `Person.prototype` 上也有一个 `name` 属性，值为 `'PrototypeName'`

虽然 `p` 的原型链上有一个 `name`，但由于 `p` 自身就有该属性，所以原型链上的属性被“覆盖”。

### 再看一个对比例子：

```javascript
function Animal() {}
Animal.prototype.name = 'from prototype';

const a = new Animal();
console.log(a.name); // from prototype

delete a.name;
console.log(a.name); // 依然是 from prototype

a.name = 'from instance';
console.log(a.name); // from instance
```

这说明：当实例自身没有某个属性时，会去原型查找。一旦自身有了同名属性，就不会再读取原型中的了。

## 判断是否存在“同名属性”

可以通过以下方法来检测：

```javascript
'name' in a && !a.hasOwnProperty('name') 
// true 表示属性来自原型

a.hasOwnProperty('name') 
// true 表示属性是实例自己的
```

## 属性覆盖是否会影响原型

不会。对象自身的属性只是“屏蔽”原型上的属性，但不会删除或修改原型上的值：

```javascript
console.log(Animal.prototype.name); // 'from prototype'
```

无论实例怎么改自己的 `name`，原型上的 `name` 依然存在且不变。

------

## 面试回答示范

**问题：JS 中是否可能出现对象本身有一个 name 属性，而原型链上也有一个同名的 name 属性？如果是，会发生什么？**

回答示例：

“是完全可能的。在 JavaScript 中，属性查找是通过原型链完成的，如果对象本身就拥有某个属性，比如 `name`，那么即使原型链上也存在同名的属性，访问时也只会返回对象自身的属性。这叫属性覆盖或属性屏蔽。

也就是说，对象的 `name` 属性会屏蔽原型链上的同名属性，除非删除对象自身的该属性，才会回退使用原型上的值。”

------

## 总结

JavaScript 中对象与原型链之间的同名属性并非冲突，而是一种继承机制下的常见现象。对象自身的属性优先于原型链上的同名属性，形成所谓的“属性屏蔽”。理解这种机制，有助于我们更清晰地控制对象行为、避免误读属性来源，也为调试复杂继承关系提供技术基础。