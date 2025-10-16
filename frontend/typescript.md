# TypeScript 学习笔记

---

## 📝 基础类型

### 常用类型定义
```typescript
// 基础类型
let name: string = '张三';
let age: number = 25;
let isStudent: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 数组
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ['a', 'b', 'c'];

// 元组
let tuple: [string, number] = ['hello', 10];

// 枚举
enum Color {
  Red,
  Green,
  Blue
}
let color: Color = Color.Red;

// Any（尽量避免使用）
let anything: any = 'can be anything';

// Unknown（更安全的 any）
let unknown: unknown = 'something';
```

---

## 🎯 接口与类型别名

### Interface vs Type

```typescript
// Interface（接口）- 推荐用于对象类型
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // 可选属性
  readonly createdAt: Date; // 只读属性
}

// Type（类型别名）- 更灵活
type UserType = {
  id: number;
  name: string;
  email: string;
};

// Type 可以定义联合类型
type Status = 'pending' | 'success' | 'error';
type ID = string | number;
```

### 💡 何时使用 Interface vs Type
- **Interface**：定义对象结构、需要继承扩展时
- **Type**：定义联合类型、交叉类型、函数类型时

---

## 🔧 函数类型

```typescript
// 函数类型定义
function add(a: number, b: number): number {
  return a + b;
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b;

// 可选参数
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}!`;
}

// 默认参数
function createUser(name: string, role: string = 'user'): User {
  return { name, role };
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

// 函数重载
function getValue(key: string): string;
function getValue(key: number): number;
function getValue(key: string | number): string | number {
  // 实现
}
```

---

## 🔖 标签
`#typescript` `#basic` `#types`

---

**最后更新：** 2025-10-16

