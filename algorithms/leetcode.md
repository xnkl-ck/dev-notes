# LeetCode 刷题笔记

记录刷题过程中的思路、技巧和总结。

---

## 🎯 题目 1：两数之和 (Two Sum)

**难度：** 简单  
**标签：** `#array` `#hash-table`

### 📝 题目描述
给定一个整数数组 `nums` 和一个目标值 `target`，在数组中找出和为目标值的两个整数，并返回它们的数组下标。

```
输入：nums = [2, 7, 11, 15], target = 9
输出：[0, 1]
解释：nums[0] + nums[1] = 2 + 7 = 9
```

### ❌ 暴力解法（不推荐）
```javascript
function twoSum(nums, target) {
  // 时间复杂度：O(n²)
  // 空间复杂度：O(1)
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}
```

### ✅ 哈希表解法（推荐）
```javascript
function twoSum(nums, target) {
  // 时间复杂度：O(n)
  // 空间复杂度：O(n)
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}

// 测试
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));      // [1, 2]
console.log(twoSum([3, 3], 6));         // [0, 1]
```

### 💡 思路总结
1. 使用哈希表存储 **已遍历的数字和它的索引**
2. 对于每个数字，计算 `complement = target - nums[i]`
3. 如果 complement 在哈希表中，说明找到了答案
4. 否则，将当前数字加入哈希表

### 🎓 学到的知识点
- **时间换空间**：用额外空间优化时间复杂度
- **哈希表查找**：O(1) 时间复杂度
- 这是 LeetCode 第一题，很多公司面试必考

### 🔖 标签
`#leetcode` `#array` `#hash-table` `#easy`

---

## 🎯 题目 2：反转链表 (Reverse Linked List)

**难度：** 简单  
**标签：** `#linked-list` `#recursion`

### 📝 题目描述
反转一个单链表。

```
输入：1 -> 2 -> 3 -> 4 -> 5 -> NULL
输出：5 -> 4 -> 3 -> 2 -> 1 -> NULL
```

### ✅ 解法 1：迭代（推荐）
```javascript
function reverseList(head) {
  // 时间复杂度：O(n)
  // 空间复杂度：O(1)
  let prev = null;
  let curr = head;
  
  while (curr !== null) {
    const nextTemp = curr.next; // 保存下一个节点
    curr.next = prev;           // 反转指针
    prev = curr;                // prev 前进一步
    curr = nextTemp;            // curr 前进一步
  }
  
  return prev; // prev 是新的头节点
}
```

### ✅ 解法 2：递归
```javascript
function reverseList(head) {
  // 时间复杂度：O(n)
  // 空间复杂度：O(n)（递归调用栈）
  
  // 递归终止条件
  if (head === null || head.next === null) {
    return head;
  }
  
  // 递归反转后面的链表
  const newHead = reverseList(head.next);
  
  // 反转当前节点
  head.next.next = head;
  head.next = null;
  
  return newHead;
}
```

### 🖼️ 图解过程（迭代法）

```
初始状态：
prev -> null
curr -> 1 -> 2 -> 3 -> 4 -> 5 -> null

第一步：
prev -> 1 -> null
curr -> 2 -> 3 -> 4 -> 5 -> null

第二步：
prev -> 2 -> 1 -> null
curr -> 3 -> 4 -> 5 -> null

...依此类推
```

### 💡 思路总结
- **迭代法**：使用三个指针（prev、curr、next）
- **递归法**：先递归到链表末尾，再回溯反转
- 迭代法空间复杂度更优，实际工作中更常用

### 🎓 学到的知识点
- 链表操作的基本技巧
- 递归思维：将问题分解为子问题
- 注意边界条件：空链表和单节点链表

### 🔖 标签
`#leetcode` `#linked-list` `#recursion` `#easy`

---

## 🎯 题目 3：有效的括号 (Valid Parentheses)

**难度：** 简单  
**标签：** `#stack` `#string`

### 📝 题目描述
给定一个只包括 `'('`、`')'`、`'{'`、`'}'`、`'['`、`']'` 的字符串，判断字符串是否有效。

```
输入："()[]{}"
输出：true

输入："([)]"
输出：false
```

### ✅ 栈解法
```javascript
function isValid(s) {
  // 时间复杂度：O(n)
  // 空间复杂度：O(n)
  
  const stack = [];
  const pairs = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (const char of s) {
    // 如果是右括号
    if (char in pairs) {
      // 栈为空或栈顶不匹配
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) {
        return false;
      }
      stack.pop();
    } else {
      // 如果是左括号，入栈
      stack.push(char);
    }
  }
  
  // 最后栈应该为空
  return stack.length === 0;
}

// 测试
console.log(isValid("()"));     // true
console.log(isValid("()[]{}"));  // true
console.log(isValid("(]"));     // false
console.log(isValid("([)]"));   // false
console.log(isValid("{[]}"));   // true
```

### 💡 思路总结
1. 使用**栈**存储左括号
2. 遇到右括号时，检查栈顶是否匹配
3. 最后检查栈是否为空

### 🎓 学到的知识点
- **栈**是处理括号匹配的经典数据结构
- LIFO（后进先出）特性完美适配括号匹配
- JavaScript 可以用数组模拟栈

### 🔖 标签
`#leetcode` `#stack` `#string` `#easy`

---

## 📊 刷题进度统计

| 难度 | 已完成 | 总数 | 进度 |
|------|--------|------|------|
| 简单 | 3 | ? | 🟩🟩🟩⬜⬜ |
| 中等 | 0 | ? | ⬜⬜⬜⬜⬜ |
| 困难 | 0 | ? | ⬜⬜⬜⬜⬜ |

---

## 🎯 常见题型和技巧

### 数组/字符串
- **双指针**：左右指针、快慢指针
- **滑动窗口**：处理子数组/子字符串问题
- **哈希表**：快速查找和计数

### 链表
- **虚拟头节点**：简化边界条件处理
- **快慢指针**：检测环、找中点
- **递归**：反转、合并链表

### 栈和队列
- **单调栈**：下一个更大元素
- **括号匹配**：有效性检查
- **BFS/DFS**：树和图的遍历

### 二叉树
- **递归**：最自然的解法
- **层序遍历**：使用队列
- **路径问题**：DFS + 回溯

---

**最后更新：** 2025-10-16

