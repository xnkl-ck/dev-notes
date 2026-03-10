# Cursor Remote SSH Segmentation Fault 完整排查记录与知识梳理

> 文档版本：v1.0
> 更新日期：2026-03-09
> 作者：chenkang

---

## 目录

1. [问题概述](#一问题概述)
2. [排查过程](#二排查过程)
3. [根因分析](#三根因分析)
4. [解决方案](#四解决方案)
5. [技术知识点详解](#五技术知识点详解)
6. [给同事的操作指南](#六给同事的操作指南)
7. [简历写法](#七简历写法)
8. [面试话术](#八面试话术)
9. [面试追问与回答](#九面试追问与回答)
10. [参考资料](#十参考资料)

---

## 一、问题概述

### 现象

使用 Cursor IDE 通过 Remote SSH 连接远程 Linux 服务器（10.239.121.106）时：

- Cursor Server 下载、解压均正常（89MB 完整下载）
- Node.js `--version` 正常输出 v20.18.2
- cursor-server 能绑定端口、开始监听
- **启动后 1 秒内立即崩溃：Segmentation fault (core dumped)**
- Cursor 弹窗报错：`Couldn't install Cursor Server, install script returned non-zero exit status: Code server did not start successfully`

### 时间线

```
2025年4月    团队首次遇到此问题（推测）
             → 没有深入排查
             → 决定全员换 Mac 绕过问题

2025年12月   服务器上发现 /tmp/core.node.2466956（用户 lwj 的 core dump）
             → 其他用户也遇到过，但未上报

2026年3月9日  重新尝试连接，问题依然存在
             → 通过 strace 系统性排查
             → 定位根因为 V8 JIT + PKU 兼容性 Bug
             → 找到 --jitless 临时方案
             → 向 Cursor 官方提交 Bug Report
             → 官方开发人员确认为已知缺陷，纳入修复计划
```

### 环境信息

| 项目 | 值 |
|------|-----|
| 本地系统 | Windows 10 (10.0.19045) |
| 远程系统 | Ubuntu 22.04.5 LTS |
| 远程内核 | 5.15.0-143-generic |
| 远程 glibc | 2.35 |
| 远程架构 | x86_64 |
| Cursor 版本 | 2026.01.17-d239e66 |
| Cursor Server commit | eb1c4e0702d201d1226d2a7afb25c501c2e56080 |
| Node.js 版本 | v20.18.2（Cursor 自带） |
| Remote SSH 扩展 | anysphere.remote-ssh-1.0.46 |
| CPU PKU 支持 | 无（`grep pku /proc/cpuinfo` 为空） |

---

## 二、排查过程

### 第一步：排除常见原因

```bash
# 检查 glibc 版本
ldd --version
# 结果：2.35 ✅ 满足要求（需 >= 2.28）

# 检查系统版本
cat /etc/os-release
# 结果：Ubuntu 22.04.5 LTS ✅

# 检查架构
uname -a
# 结果：x86_64 ✅

# 清除缓存重新下载
rm -rf ~/.cursor-server
# 重新连接后：问题依旧 ❌ 排除文件损坏

# 检查动态链接库
ldd ~/.cursor-server/bin/linux-x64/.../node | grep "not found"
# 结果：无输出 ✅ 所有库都在

# 检查 LD_PRELOAD
env | grep -i ld_
cat /etc/ld.so.preload
# 结果：无 ✅

# 检查 GPU/NVIDIA
nvidia-smi
ls /usr/lib/x86_64-linux-gnu/libcuda*
# 结果：无 GPU ✅

# 检查环境变量
env | grep -i gpu
env | grep -i display
# 结果：无 ✅
```

**结论：所有常见原因均已排除，问题在 cursor-server 进程本身。**

### 第二步：手动测试

```bash
# 测试 node 本身
~/.cursor-server/bin/linux-x64/.../node --version
# 结果：v20.18.2 ✅ node 二进制没问题

# 手动启动 cursor-server
~/.cursor-server/bin/linux-x64/.../bin/cursor-server \
    --start-server --host=127.0.0.1 --port=0 \
    --telemetry-level off --accept-server-license-terms
# 结果：
# Server bound to 127.0.0.1:33751 (IPv4)
# Extension host agent listening on 33751
# Segmentation fault (core dumped)
```

**结论：cursor-server 能启动、能绑定端口，但随后立即崩溃。**

### 第三步：strace 追踪（关键步骤）

```bash
strace -f -o /tmp/cursor_strace.log \
    ~/.cursor-server/bin/linux-x64/.../bin/cursor-server \
    --start-server --host=127.0.0.1 --port=0 \
    --telemetry-level off --accept-server-license-terms
```

查看日志末尾：

```bash
tail -100 /tmp/cursor_strace.log
```

**关键发现：**

```
398687 openat(AT_FDCWD, ".../@vscode/spdlog/index.js", O_RDONLY) = 23
398687 read(23, "const path = require('path');\nco"..., 8192) = 902
398687 close(23) = 0
398687 --- SIGSEGV {si_signo=SIGSEGV, si_code=SEGV_PKUERR, si_addr=0x205c03c04790} ---
```

**三个关键信息：**

1. 崩溃发生在加载 `@vscode/spdlog` 原生模块之后
2. 信号类型是 `SIGSEGV`（段错误）
3. 信号码是 `SEGV_PKUERR`（不是常见的 SEGV_MAPERR 或 SEGV_ACCERR）

### 第四步：验证假设

```bash
# 检查 CPU 是否支持 PKU
grep pku /proc/cpuinfo | head -1
# 结果：空 → CPU 不支持 PKU

# 用 --jitless 禁用 V8 JIT
NODE_OPTIONS="--no-node-snapshot --jitless" \
    ~/.cursor-server/bin/linux-x64/.../bin/cursor-server \
    --start-server --host=127.0.0.1 --port=0 \
    --telemetry-level off --accept-server-license-terms
# 结果：
# Extension host agent listening on 37915
# Extension host agent started.  ✅ 正常启动！
```

**结论确认：V8 JIT 编译器是崩溃的根因。**

### 其他尝试（未成功）

| 方案 | 结果 |
|------|------|
| `NODE_OPTIONS="--no-node-snapshot"` | 仍然段错误 ❌ |
| `NODE_OPTIONS="--no-node-snapshot --no-pku"` | 参数不被 NODE_OPTIONS 允许 ❌ |
| `V8_FLAGS="--no-memory-protection-keys"` | 环境变量不被 cursor-server 读取 ❌ |
| `NODE_OPTIONS="--no-node-snapshot --no-maglev --no-turbofan"` | 参数不被 NODE_OPTIONS 允许 ❌ |
| `NODE_OPTIONS="--no-node-snapshot --jitless"` | **成功 ✅** |

---

## 三、根因分析

### 一句话总结

**Cursor 自带的 Node.js v20.18.2 中，V8 引擎的 JIT 编译器在不支持 Intel PKU 特性的 CPU 上，错误地使用了 PKU 相关的内存保护代码路径，导致 SEGV_PKUERR 段错误。**

### 详细技术链条

```
Cursor 更新 → 自带的 Node.js/V8 版本更新
→ 新版 V8 JIT 编译器引入了 PKU 代码路径
→ cursor-server 启动后加载 @vscode/spdlog 原生模块
→ V8 JIT 编译器编译执行 JavaScript 代码
→ JIT 编译后的机器码使用了 PKU/MPK 内存保护指令
→ 但 CPU 不支持 PKU（grep pku /proc/cpuinfo 为空）
→ CPU 无法执行 PKU 相关指令
→ 触发 SIGSEGV (SEGV_PKUERR)
→ cursor-server 进程崩溃
→ Cursor SSH 连接失败
```

### 为什么"有段时间能连，后来又不行了"

因为 Cursor 在某次版本更新中更新了自带的 Node.js/V8 版本：

- **旧版 V8**：没有使用 PKU 特性，或者正确检测了 CPU 能力 → 正常工作
- **新版 V8**：引入了 PKU 代码路径，但没有正确检测 CPU 是否支持 → 崩溃

这是一个典型的**版本回归 Bug（Regression Bug）**。

### 为什么 .bashrc 设置 NODE_OPTIONS 不生效

Cursor 远程安装脚本的启动方式：

```bash
# 安装脚本中的启动命令
/path/to/cursor-server --start-server ... &> /path/to/logfile &
```

- `&>` 重定向了所有输出
- `&` 使其在后台运行
- 这个子进程不是交互式 shell，**不会读取 `.bashrc`**
- 所以必须在 cursor-server 启动脚本**内部**设置 NODE_OPTIONS

---

## 四、解决方案

### 方案 A：修改启动脚本（当前使用的方案）

```bash
# cursor-server 是一个 shell 脚本
# 路径：~/.cursor-server/bin/linux-x64/<commit>/bin/cursor-server

# 原始最后一行：
"$ROOT/node" ${INSPECT:-} "$ROOT/out/server-main.js" "$@"

# 修改为（在前面加一行）：
export NODE_OPTIONS="--no-node-snapshot --jitless"
"$ROOT/node" ${INSPECT:-} "$ROOT/out/server-main.js" "$@"
```

修改命令：

```bash
sed -i '/"\$ROOT\/node"/i export NODE_OPTIONS="--no-node-snapshot --jitless"' \
    ~/.cursor-server/bin/linux-x64/eb1c4e0702d201d1226d2a7afb25c501c2e56080/bin/cursor-server
```

### 方案 B：一键修复脚本（推荐）

```bash
cat > ~/fix-cursor-server.sh << 'EOF'
#!/bin/bash
SCRIPT=$(find ~/.cursor-server/bin -name "cursor-server" -path "*/bin/cursor-server" 2>/dev/null | head -1)
if [ -z "$SCRIPT" ]; then
    echo "[失败] 未找到 cursor-server 脚本"
    echo "[提示] 请先用 Cursor 连接一次（会失败），等下载完成后再运行此脚本"
    exit 1
fi
if grep -q "jitless" "$SCRIPT"; then
    echo "[跳过] 已经修复过了，无需重复操作"
else
    sed -i '/"\$ROOT\/node"/i export NODE_OPTIONS="--no-node-snapshot --jitless"' "$SCRIPT"
    echo "[成功] 修复完成！请重新用 Cursor 连接远程服务器"
fi
echo ""
echo "当前脚本最后 3 行："
tail -3 "$SCRIPT"
EOF
chmod +x ~/fix-cursor-server.sh
```

### 注意事项

- Cursor 版本更新后会重新下载 Server 文件，**修改会被覆盖**，需要重新运行修复脚本
- `--jitless` 禁用了 V8 JIT，扩展加载会稍慢，但日常编码基本无感
- 官方已确认此 Bug，等待正式修复

---

## 五、技术知识点详解

### 5.1 什么是段错误（Segmentation Fault）

段错误是程序访问了不允许访问的内存区域时，操作系统发送给进程的信号（SIGSEGV）。

常见的 SIGSEGV 子类型（si_code）：

| si_code | 含义 |
|---------|------|
| SEGV_MAPERR | 访问的内存地址没有被映射（最常见） |
| SEGV_ACCERR | 访问的内存地址有映射但权限不够（如写只读内存） |
| **SEGV_PKUERR** | **违反了 Memory Protection Keys 的权限设置（本次遇到的）** |

### 5.2 什么是 Intel PKU / MPK

**PKU（Protection Keys for Userspace）** 也叫 **MPK（Memory Protection Keys）**，是 Intel 从 Skylake-SP (2017) 开始引入的 CPU 特性。

**原理：**

```
传统内存保护：
  页表 → 每个内存页有 读/写/执行 权限
  修改权限需要系统调用（很慢）

PKU 增强：
  页表 → 每个内存页多了一个 4-bit 的 Protection Key（0-15）
  PKRU 寄存器 → 控制每个 Key 的读写权限
  修改 PKRU 只需要用户态指令 WRPKRU（很快，不需要系统调用）
```

**V8 为什么用 PKU：**

V8 JIT 编译器会把 JavaScript 编译成机器码存在内存中。为了安全性，V8 用 PKU 来保护这些机器码内存区域：

- 正常时：机器码内存设为"可执行但不可写"
- 需要修改时：通过 WRPKRU 临时允许写入
- 这样可以防止安全漏洞利用 JIT 生成的代码

**问题所在：**

如果 CPU 不支持 PKU，但 V8 的代码仍然尝试使用 PKU 相关的内存区域或指令，就会触发 SEGV_PKUERR。

### 5.3 什么是 V8 JIT 编译器

**V8** 是 Google 开发的 JavaScript 引擎，用在 Chrome 和 Node.js 中。

**执行 JavaScript 的两种方式：**

```
方式 1：解释执行（Ignition 解释器）
  JavaScript → 字节码 → 逐条解释执行
  优点：启动快
  缺点：运行慢

方式 2：JIT 编译执行（TurboFan/Maglev 编译器）
  JavaScript → 字节码 → 检测热点代码 → 编译成机器码 → 直接在 CPU 上执行
  优点：运行快（接近 C++ 速度）
  缺点：需要编译时间，更复杂
```

**V8 的分层编译：**

```
代码首次执行 → Ignition 解释器（解释执行）
     ↓ （检测到是热点代码）
Sparkplug → 快速基线编译器
     ↓ （运行次数更多）
Maglev → 中层优化编译器
     ↓ （运行次数非常多）
TurboFan → 最高级优化编译器（生成高度优化的机器码）
```

**`--jitless` 的作用：** 禁用所有 JIT 编译器（Sparkplug、Maglev、TurboFan），所有代码只走 Ignition 解释器。这样就不会生成机器码，也就不会触发 PKU 相关的代码路径。

### 5.4 什么是 strace

**strace** 是 Linux 上的系统调用追踪工具，通过 ptrace 机制拦截目标进程的所有系统调用和信号。

**常用参数：**

```bash
strace -f              # 追踪子进程
       -o file.log     # 输出到文件
       -p PID          # 附加到已运行的进程
       -e trace=open   # 只追踪特定的系统调用
       -c              # 统计模式（显示各系统调用的次数和耗时）
```

**本次排查中的关键用法：**

```bash
strace -f -o /tmp/cursor_strace.log <command>
```

- `-f`：cursor-server 会创建子进程，需要追踪所有子进程
- `-o`：输出到文件，因为 strace 输出量很大
- 查看崩溃位置：`tail -100 /tmp/cursor_strace.log`

**strace 能看到什么：**

| 系统调用 | 说明 |
|---------|------|
| `openat(...)` | 打开文件 |
| `read(...)` | 读取文件内容 |
| `mmap(...)` | 内存映射 |
| `--- SIGSEGV {...} ---` | 收到段错误信号 |
| `+++ killed by SIGSEGV +++` | 进程被段错误杀死 |

### 5.5 什么是 @vscode/spdlog

**spdlog** 是一个高性能的 C++ 日志库。`@vscode/spdlog` 是 VS Code/Cursor 用的 Node.js 绑定，它是一个 **native addon**（原生模块），包含一个 `.node` 文件（本质是编译好的 C++ 动态链接库）。

```
@vscode/spdlog/
├── index.js          ← JavaScript 入口（strace 看到加载了这个文件）
├── build/Release/
│   └── spdlog.node   ← C++ 编译的原生模块（ELF shared object）
└── package.json
```

**为什么崩溃发生在加载 spdlog 时：**

不是 spdlog.node 本身有问题（它的动态链接库完整），而是加载 spdlog.node 时触发了 V8 JIT 编译 JavaScript 胶水代码，JIT 编译过程中使用了 PKU → 崩溃。

### 5.6 Linux 信号（Signal）基础

| 信号 | 编号 | 含义 |
|------|------|------|
| SIGTERM | 15 | 终止请求（可被捕获） |
| SIGKILL | 9 | 强制杀死（不可捕获） |
| SIGSEGV | 11 | 段错误（非法内存访问） |
| SIGBUS | 7 | 总线错误（内存对齐问题） |
| SIGABRT | 6 | 异常终止（如 assert 失败） |

**SIGSEGV 的 si_code 含义：**

```c
SEGV_MAPERR  // 地址未映射（最常见，如空指针访问）
SEGV_ACCERR  // 权限不足（如写只读内存）
SEGV_BNDERR  // 数组越界（Intel MPX）
SEGV_PKUERR  // PKU 违规（本次遇到的，较罕见）
```

### 5.7 /proc/cpuinfo 与 CPU 特性检测

```bash
# 查看 CPU 型号
cat /proc/cpuinfo | grep "model name" | head -1

# 查看所有 CPU 特性标志
cat /proc/cpuinfo | grep "flags" | head -1

# 检查是否支持特定特性
grep pku /proc/cpuinfo     # PKU (Protection Keys for Userspace)
grep ospke /proc/cpuinfo   # OS 已启用 PKU
```

**常见 CPU 特性标志：**

| 标志 | 含义 |
|------|------|
| sse, sse2, sse4_1, sse4_2 | SIMD 指令集 |
| avx, avx2, avx512 | 高级向量扩展 |
| aes | AES 加密加速 |
| pku | Protection Keys for Userspace |
| ospke | OS 支持的 PKU |

### 5.8 Node.js 启动参数

| 参数 | 作用 |
|------|------|
| `--jitless` | 禁用 V8 JIT 编译器，所有代码走解释器 |
| `--no-node-snapshot` | 禁用 Node.js 启动快照 |
| `--max-old-space-size=N` | 设置 V8 堆内存上限（MB） |
| `--inspect` | 启用 Chrome DevTools 调试 |
| `--prof` | 启用 V8 性能分析 |

**NODE_OPTIONS 环境变量：**

```bash
# 通过环境变量传递 Node.js 参数
export NODE_OPTIONS="--no-node-snapshot --jitless"
```

注意：出于安全考虑，不是所有参数都允许通过 NODE_OPTIONS 传递。例如 `--no-pku` 就不允许。

---

## 六、给同事的操作指南

### 快速修复步骤

1. SSH 登录远程服务器

```bash
ssh 106
```

2. 创建修复脚本（首次）

```bash
cat > ~/fix-cursor-server.sh << 'EOF'
#!/bin/bash
SCRIPT=$(find ~/.cursor-server/bin -name "cursor-server" -path "*/bin/cursor-server" 2>/dev/null | head -1)
if [ -z "$SCRIPT" ]; then
    echo "[失败] 未找到 cursor-server 脚本"
    echo "[提示] 请先用 Cursor 连接一次（会失败），等下载完成后再运行此脚本"
    exit 1
fi
if grep -q "jitless" "$SCRIPT"; then
    echo "[跳过] 已经修复过了，无需重复操作"
else
    sed -i '/"\$ROOT\/node"/i export NODE_OPTIONS="--no-node-snapshot --jitless"' "$SCRIPT"
    echo "[成功] 修复完成！请重新用 Cursor 连接远程服务器"
fi
echo ""
echo "当前脚本最后 3 行："
tail -3 "$SCRIPT"
EOF
chmod +x ~/fix-cursor-server.sh
```

3. 运行修复

```bash
~/fix-cursor-server.sh
```

4. 重新用 Cursor 连接

### FAQ

**Q: 提示"未找到 cursor-server 脚本"怎么办？**
A: 先用 Cursor 连接一次（会失败但会下载文件），然后再运行脚本。

**Q: Cursor 更新后又崩溃了怎么办？**
A: 重新运行 `~/fix-cursor-server.sh`。

**Q: 会影响性能吗？**
A: 扩展加载会稍慢，日常编码基本无感。

---

## 七、简历写法

### 精简版（1-2 行）

```
- 排查 Cursor IDE Remote SSH 段错误问题，通过 strace 定位为 V8 JIT 引擎
  在非 PKU CPU 上的兼容性 Bug（SEGV_PKUERR），提交官方 Bug Report 获确认修复，
  编写自动化修复脚本恢复团队远程开发环境，避免了不必要的硬件更换成本
```

### 展开版

```
Cursor IDE V8 引擎兼容性 Bug 排查与修复                    2026.03

背景：团队使用 Cursor IDE 通过 Remote SSH 连接远程 Linux 开发服务器，
     某次版本更新后 Server 端启动即崩溃（Segmentation Fault），
     影响团队全员远程开发环境

排查：
• 系统性排除 glibc、动态链接库、GPU 驱动、LD_PRELOAD 等常见因素
• 使用 strace 追踪崩溃进程，定位到加载原生模块时触发 SEGV_PKUERR
• 结合 CPU feature flags 确认为 V8 JIT 编译器 PKU 兼容性回归 Bug
• 通过 --jitless 参数禁用 JIT 验证根因假设

解决：
• 编写启动脚本补丁及一键修复脚本，输出团队操作文档
• 向 Cursor 官方提交 Bug Report，获开发人员确认并纳入修复计划

技术栈：Linux / strace / Node.js V8 / Intel PKU(MPK) / Shell
```

### 关联技能标签

```
Linux 系统调试 | strace | Node.js/V8 | CPU 架构 |
问题排查与根因分析 | 技术文档输出 | 开源社区协作
```

---

## 八、面试话术

### 讲述框架（STAR 法则）

#### Situation（背景，30 秒）

> 我们团队使用 Cursor IDE 通过 Remote SSH 连接远程 Linux 服务器进行开发。
> 之前一直用得好好的，但某次 Cursor 更新之后，所有人都连不上了，
> Server 端一启动就崩溃，报 Segmentation Fault。
>
> 这个问题其实早在去年就出现过，当时因为没人深入排查，
> 团队直接选择了全员换 Mac 来绕过这个问题。
> 后来我需要在 Windows 环境下重新连接这台服务器，问题再次出现，
> 我决定从根源上搞清楚。

#### Task（任务，10 秒）

> 我负责排查这个问题的根本原因并找到解决方案。

#### Action（行动，2 分钟，重点）

> 首先我做了系统性的排除。远程服务器是 Ubuntu 22.04，glibc 2.35，
> 完全满足要求。我用 ldd 检查了 Cursor 自带的 Node.js 二进制文件，
> 动态链接库全部正常。也排除了 GPU 驱动、LD_PRELOAD 等干扰因素。
> 清除缓存重新下载后问题依旧，排除了文件损坏。
>
> 然后我手动执行了 Cursor Server 的启动命令，确认是 cursor-server 
> 进程本身在崩溃——它能绑定端口，但大概 1 秒后就段错误了。
>
> 关键的一步是我用了 strace 来追踪崩溃前的系统调用。
> strace 日志显示段错误发生在加载 @vscode/spdlog 原生模块之后，
> 而且错误信号非常特殊——不是普通的 SEGV_MAPERR，
> 而是 SEGV_PKUERR。
>
> 这个信号码让我联想到 Intel 的 PKU（Protection Keys for Userspace）技术。
> 我立刻检查了 CPU 的 feature flags，
> 发现 grep pku /proc/cpuinfo 结果为空——CPU 不支持 PKU。
>
> 到这里我有了假设：V8 JIT 编译器在执行编译后的机器码时，
> 使用了 PKU 相关的内存保护机制，但 CPU 不支持。
>
> 为了验证，我用 --jitless 参数禁用了 V8 JIT，
> cursor-server 完全正常启动了，证实了我的判断。

#### Result（结果，30 秒）

> 我做了三件事：
>
> 第一，修改了 cursor-server 启动脚本注入修复参数，
> 并写了一键修复脚本，因为 Cursor 每次更新都会覆盖。
>
> 第二，写了详细的内部文档发给团队所有同事。
>
> 第三，向 Cursor 官方提交了完整的 Bug Report。
> 官方开发人员很快确认了这是已知缺陷，纳入了修复计划。
>
> 回过头看，去年团队花了不少钱全员换 Mac，
> 其实只需要几个小时的底层排查就能找到零成本的解决方案。

---

## 九、面试追问与回答

### Q1: 什么是 PKU / Memory Protection Keys？

> PKU 是 Intel 从 Skylake-SP 开始引入的 CPU 特性。
> 它给每个内存页分配一个 4-bit 的 Protection Key（0-15），
> 程序可以通过 PKRU 寄存器来快速控制不同 Key 的读写权限，
> 只需要用户态指令 WRPKRU，不需要系统调用，所以非常快。
> V8 JIT 用它来保护编译后的机器码内存，防止被恶意修改。

### Q2: strace 的基本原理是什么？

> strace 通过 ptrace 系统调用来拦截目标进程的所有系统调用和信号。
> 它能看到进程做了哪些 open、read、mmap 等操作，
> 以及收到了什么信号。
> 非常适合排查段错误、文件找不到、权限问题等。

### Q3: 为什么 --jitless 能解决问题？

> --jitless 禁用了 V8 所有 JIT 编译器，
> 代码只走 Ignition 解释器执行，不会生成机器码。
> 既然不生成机器码，就不会走到 PKU 相关的内存保护路径，
> 所以不会触发 SEGV_PKUERR。
> 代价是性能下降，因为解释执行比 JIT 编译后的机器码慢很多。

### Q4: 为什么"有段时间能连，后来又不行了"？

> 因为 Cursor 在某次版本更新中更新了自带的 Node.js/V8 版本，
> 新版 V8 引入了或启用了 PKU 相关的代码路径。
> 旧版可能没有使用 PKU，所以不会触发这个问题。
> 这是一个典型的版本回归 Bug（Regression Bug）。

### Q5: 为什么 .bashrc 设置 NODE_OPTIONS 不生效？

> 因为 Cursor 的安装脚本启动 cursor-server 时用了后台进程方式，
> 命令是类似 `/path/to/cursor-server ... &> logfile &`
> 这个子进程不是交互式 shell，不会读取 .bashrc。
> 所以必须在 cursor-server 启动脚本内部设置环境变量。

### Q6: V8 的 JIT 编译有哪几层？

> V8 有分层编译：
> - Ignition：解释器，逐条执行字节码
> - Sparkplug：快速基线编译器
> - Maglev：中层优化编译器
> - TurboFan：最高级优化编译器
>
> 代码首次执行走解释器，检测到是热点代码后逐步提升到更高层级的编译器，
> 生成越来越优化的机器码。

### Q7: SIGSEGV 有哪些子类型？

> 常见的有：
> - SEGV_MAPERR：地址未映射（最常见，如空指针）
> - SEGV_ACCERR：权限不足（如写只读内存）
> - SEGV_BNDERR：MPX 边界检查失败
> - SEGV_PKUERR：PKU 权限违规（本次遇到的）

### Q8: 你觉得官方应该怎么修复？

> 两个方向：
> 第一，运行时检测 CPU 是否支持 PKU，如果不支持就不走 PKU 代码路径。
> 其实 V8 源码中应该已经有这个检测，可能是某个条件分支写错了。
>
> 第二，提供配置机制让用户可以通过 Cursor 设置传递 NODE_OPTIONS 
> 到远程 Server 进程，这样用户不需要每次都手动改脚本。

---

## 十、参考资料

### 官方文档

- [V8 引擎官方文档](https://v8.dev/docs)
- [Node.js CLI 参数文档](https://nodejs.org/api/cli.html)
- [Cursor 官方论坛](https://forum.cursor.com)

### 技术参考

- [Intel PKU/MPK 技术文档](https://www.kernel.org/doc/html/latest/core-api/protection-keys.html)
- [strace 手册](https://man7.org/linux/man-pages/man1/strace.1.html)
- [V8 JIT 编译器架构](https://v8.dev/blog/maglev)
- [Linux 信号手册 (signal.7)](https://man7.org/linux/man-pages/man7/signal.7.html)

### 相关 Issue

- Cursor 官方论坛 Bug Report：（补充链接）
- V8 Bug Tracker: https://bugs.chromium.org/p/v8/issues/list
- Node.js Issues: https://github.com/nodejs/node/issues
