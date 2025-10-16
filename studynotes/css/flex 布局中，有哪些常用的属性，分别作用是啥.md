# **flex 布局中，有哪些常用的属性，分别作用是啥**

## 前言

Flexbox（弹性盒布局）是现代 CSS 中解决一维布局问题的强大工具。它简化了复杂的布局需求，尤其是在响应式设计中表现出色。理解常用的 flex 属性及其作用，是灵活构建布局的基础。

## 常用的 flex 容器属性

1. `display: flex` 或 `inline-flex`
   定义弹性盒容器，激活 Flexbox 布局模式。
2. `flex-direction`
   设置主轴方向。常见值有 `row`（默认，从左到右）、`row-reverse`、`column`（从上到下）、`column-reverse`。
3. `justify-content`
   定义主轴（水平或垂直，取决于方向）上子元素的对齐方式，如 `flex-start`、`center`、`space-between`、`space-around` 等。
4. `align-items`
   定义交叉轴上所有子元素的对齐方式，如 `stretch`（默认，拉伸填满）、`center`、`flex-start`、`flex-end`。
5. `flex-wrap`
   控制是否换行，默认不换行。`nowrap`、`wrap`、`wrap-reverse`。
6. `align-content`
   当有多行时，定义多行在交叉轴上的对齐方式，类似于 `justify-content` 但针对多行。

## 常用的 flex 子元素属性

1. `flex-grow`
   定义子元素在剩余空间的放大比例，默认为 0，不放大。
2. `flex-shrink`
   定义子元素在空间不足时的缩小比例，默认为 1。
3. `flex-basis`
   定义子元素在主轴上的初始大小，默认 `auto`。
4. `flex`
   是 `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写，常用写法如 `flex: 1`。
5. `align-self`
   允许单个子元素覆盖容器的 `align-items` 属性，独立设置自身在交叉轴上的对齐。

## 面试回答

Flexbox 常用容器属性有 `display: flex` 激活布局，`flex-direction` 设置主轴方向，`justify-content` 控制主轴对齐，`align-items` 控制交叉轴对齐，`flex-wrap` 控制换行，`align-content` 控制多行对齐。子元素常用属性有 `flex-grow` 定义放大比例，`flex-shrink` 定义缩小比例，`flex-basis` 设置初始大小，`flex` 是三者简写，`align-self` 用于单独对齐。

## 总结

Flexbox 提供丰富的属性控制布局方向、对齐和伸缩行为，帮助开发者轻松实现灵活响应式设计。熟练掌握这些属性，可以显著提高前端布局的效率和质量。