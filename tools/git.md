# Git 使用技巧

记录 Git 使用过程中的常用命令和最佳实践。

---

## 🎯 常用命令速查

### 基础操作
```bash
# 查看状态
git status

# 查看修改
git diff              # 工作区 vs 暂存区
git diff --cached     # 暂存区 vs 最新提交
git diff HEAD         # 工作区 vs 最新提交

# 添加文件
git add .             # 添加所有文件
git add -p            # 交互式添加（推荐）

# 提交
git commit -m "feat: 添加用户登录功能"
git commit --amend    # 修改最后一次提交
```

### 分支操作
```bash
# 查看分支
git branch            # 本地分支
git branch -r         # 远程分支
git branch -a         # 所有分支

# 创建和切换分支
git checkout -b feature/user-auth
git switch -c feature/user-auth  # 新语法（推荐）

# 删除分支
git branch -d feature/old-feature    # 安全删除
git branch -D feature/old-feature    # 强制删除

# 重命名分支
git branch -m old-name new-name
```

### 撤销操作
```bash
# 撤销工作区修改
git checkout -- <file>
git restore <file>         # 新语法（推荐）

# 撤销暂存
git reset HEAD <file>
git restore --staged <file>  # 新语法（推荐）

# 撤销提交
git reset --soft HEAD~1    # 保留修改，撤销提交
git reset --mixed HEAD~1   # 保留工作区，撤销提交和暂存
git reset --hard HEAD~1    # ⚠️ 完全撤销，丢失修改
```

---

## 💡 实用技巧

### 技巧 1：交互式暂存（git add -p）

#### 💬 场景
一个文件中有多处修改,但只想提交其中一部分。

#### ✅ 使用方法
```bash
git add -p filename

# 会逐个展示代码块（hunk），可以选择：
# y - 暂存这个代码块
# n - 不暂存这个代码块
# s - 拆分成更小的代码块
# e - 手动编辑代码块
# q - 退出
```

#### 💡 好处
- 保持提交的原子性
- 避免提交调试代码
- 更清晰的提交历史

---

### 技巧 2：优雅的提交信息

#### ✅ 规范格式（Conventional Commits）
```bash
<type>(<scope>): <subject>

<body>

<footer>
```

#### 常用 type
```bash
feat:     新功能
fix:      修复 bug
docs:     文档修改
style:    代码格式（不影响代码运行）
refactor: 重构（不是新功能也不是修复 bug）
test:     添加测试
chore:    构建过程或辅助工具的变动
perf:     性能优化
```

#### 示例
```bash
# 简单提交
git commit -m "feat: 添加用户注册功能"

# 详细提交
git commit -m "feat(auth): 添加用户注册功能

- 实现邮箱验证
- 添加密码强度检查
- 集成验证码功能

Closes #123"
```

---

### 技巧 3：暂存工作现场（git stash）

#### 💬 场景
正在开发新功能，突然需要切换分支修复紧急 bug。

#### ✅ 使用方法
```bash
# 暂存当前修改
git stash
git stash save "正在开发的用户登录功能"  # 带描述

# 查看暂存列表
git stash list

# 恢复暂存
git stash pop           # 恢复最新的暂存并删除
git stash apply stash@{0}  # 恢复但不删除
git stash apply stash@{1}  # 恢复指定的暂存

# 删除暂存
git stash drop stash@{0}
git stash clear         # 清空所有暂存
```

#### 🎯 工作流示例
```bash
# 1. 正在 feature 分支开发
git stash save "开发到一半的功能"

# 2. 切换到 main 分支修复 bug
git checkout main
git checkout -b hotfix/critical-bug
# ... 修复 bug ...
git commit -m "fix: 修复关键 bug"

# 3. 回到 feature 分支继续开发
git checkout feature/user-auth
git stash pop
```

---

### 技巧 4：查看精简的日志

#### ✅ 实用命令
```bash
# 单行显示
git log --oneline

# 图形化显示分支
git log --oneline --graph --all

# 自定义格式
git log --pretty=format:"%h - %an, %ar : %s"

# 查看最近 5 次提交
git log -5

# 查看某个文件的历史
git log --follow filename

# 查看某个作者的提交
git log --author="张三"
```

#### 🎨 创建别名
在 `~/.gitconfig` 中添加：
```ini
[alias]
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    st = status -sb
    co = checkout
    br = branch
    cm = commit -m
    ca = commit --amend
    unstage = restore --staged
```

使用：
```bash
git lg      # 漂亮的日志
git st      # 简短的状态
git co main # 切换分支
```

---

### 技巧 5：Cherry-pick 挑选提交

#### 💬 场景
想把某个分支的特定提交应用到当前分支。

#### ✅ 使用方法
```bash
# 挑选单个提交
git cherry-pick <commit-hash>

# 挑选多个提交
git cherry-pick <hash1> <hash2> <hash3>

# 挑选一个范围的提交
git cherry-pick <start-hash>^..<end-hash>

# 如果有冲突
git cherry-pick --continue  # 解决冲突后继续
git cherry-pick --abort     # 放弃 cherry-pick
```

---

### 技巧 6：Rebase 保持清晰的提交历史

#### ✅ 场景 1：合并分支时使用 rebase
```bash
# 传统 merge（会产生合并提交）
git checkout feature
git merge main

# 使用 rebase（保持线性历史）
git checkout feature
git rebase main
git checkout main
git merge feature  # 快进合并
```

#### ✅ 场景 2：交互式 rebase 整理提交
```bash
# 整理最近 3 次提交
git rebase -i HEAD~3

# 编辑器会打开，可以选择：
# pick   - 保留这个提交
# reword - 保留但修改提交信息
# edit   - 保留但停下来修改
# squash - 合并到前一个提交
# fixup  - 合并到前一个提交（丢弃提交信息）
# drop   - 删除这个提交
```

#### ⚠️ 注意事项
- **不要 rebase 已经推送到远程的提交**
- Rebase 会改变提交历史
- 如果不确定，使用 merge 更安全

---

## 🚨 常见问题解决

### 问题 1：误提交了敏感信息

```bash
# 方法 1：修改最后一次提交
git reset --soft HEAD~1
# 移除敏感文件
git reset HEAD sensitive-file.txt
git commit -c ORIG_HEAD

# 方法 2：从历史中彻底删除（⚠️ 慎用）
git filter-branch --tree-filter 'rm -f sensitive-file.txt' HEAD
```

### 问题 2：合并冲突

```bash
# 1. 查看冲突文件
git status

# 2. 手动解决冲突（编辑文件）
# <<<<<<< HEAD
# 当前分支的内容
# =======
# 要合并的分支的内容
# >>>>>>> feature-branch

# 3. 标记为已解决
git add resolved-file.txt

# 4. 完成合并
git commit
```

### 问题 3：不小心删除了分支

```bash
# 查找被删除分支的最后一次提交
git reflog

# 恢复分支
git checkout -b recovered-branch <commit-hash>
```

---

## 📚 最佳实践

### ✅ 提交规范
1. **频繁提交**：小步快跑，每个功能点都提交
2. **原子性**：一个提交只做一件事
3. **清晰的消息**：使用规范的提交信息
4. **提交前检查**：使用 `git diff --cached` 检查

### ✅ 分支策略
```
main (生产环境)
  ├── develop (开发环境)
  │    ├── feature/user-auth
  │    ├── feature/payment
  │    └── feature/notification
  └── hotfix/critical-bug
```

### ✅ 工作流
1. 从 `main` 或 `develop` 创建功能分支
2. 在功能分支上开发和提交
3. 定期从主分支 rebase 获取最新代码
4. 功能完成后发起 Pull Request
5. Code Review 通过后合并

---

**最后更新：** 2025-10-16

