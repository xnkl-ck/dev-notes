# 编程最佳实践

记录在开发过程中总结的最佳实践和经验。

---

## 💡 代码质量

### 1. 保持函数简短
```javascript
// ❌ 不好：函数做了太多事情
function processUser(user) {
  // 验证用户
  if (!user.email) throw new Error('Email required');
  if (!user.name) throw new Error('Name required');
  
  // 保存到数据库
  db.save(user);
  
  // 发送邮件
  sendEmail(user.email, 'Welcome!');
  
  // 记录日志
  logger.info(`User ${user.name} created`);
}

// ✅ 好：单一职责，每个函数做一件事
function validateUser(user) {
  if (!user.email) throw new Error('Email required');
  if (!user.name) throw new Error('Name required');
}

function createUser(user) {
  validateUser(user);
  const savedUser = db.save(user);
  sendWelcomeEmail(savedUser);
  logUserCreation(savedUser);
  return savedUser;
}
```

### 💡 原则
- 一个函数只做一件事
- 函数名清晰表达意图
- 理想长度：10-20 行
- 如果超过 50 行，考虑拆分

---

## 🔖 标签
`#best-practices` `#clean-code` `#programming`

---

**最后更新：** 2025-10-16

