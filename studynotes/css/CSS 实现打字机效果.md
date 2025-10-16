# **CSS 实现打字机效果**

## 前言

打字机效果是一种常见的动画效果，模拟文字逐字显示的过程，常用于网页欢迎语、介绍文本等场景。通过 CSS 动画配合文字裁剪或显示，可以实现平滑的打字机视觉效果，增强页面的动态感和用户体验。

## 实现打字机效果的原理

打字机效果主要基于对文字容器的宽度或字符显示的动态控制。常用方法包括：

1. 使用 `overflow: hidden` 隐藏超出部分，通过动画逐步改变容器宽度，模拟文字逐字出现。
2. 结合 `ch` 单位，控制宽度变化的精确度，确保每次展开一个字符宽度。
3. 通过 `border-right` 添加闪烁的光标效果，增强真实感。
4. 采用 `steps()` 函数配合 `animation`，实现文字逐步展开而非连续增长，模拟打字节奏。

## 示例代码

```css
.typing {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid black;
  width: 0;
  animation: typing 4s steps(20) forwards, blink 0.75s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 20ch; }
}

@keyframes blink {
  50% { border-color: transparent; }
  100% { border-color: black; }
}
```

这里，`width` 从 0 变到 20 字符宽度，分 20 步骤完成动画，模拟逐字出现。

## 注意事项

- 使用 `steps()` 让动画分段执行，避免文字宽度不均导致动画不自然。
- 容器必须设置 `white-space: nowrap`，防止换行破坏效果。
- 结合光标闪烁，效果更逼真。

## 面试回答

CSS 实现打字机效果通常通过给文字容器设置 `overflow: hidden` 和 `white-space: nowrap`，用动画逐步改变宽度，结合 `steps()` 函数分步展开字符，模拟文字逐字显示。同时用 `border-right` 和闪烁动画做光标效果，增强真实感。

## 总结

打字机效果利用 CSS 动画与文字裁剪技术，简单且高效地实现了动态文本展示。掌握这类动画技巧，可以提升页面的交互体验和视觉表现力。