# **CSS 如何实现文本溢出？**

## 前言

文本溢出是指文本内容超出其容器范围时的显示处理问题。在网页设计中，为保证界面美观且信息清晰，合理控制文本溢出非常重要。CSS 提供了多种属性来处理文本溢出情况，包括显示省略号、隐藏溢出内容等。

## 文本溢出的常见处理方法

1. 单行文本溢出
   通过设置容器的 `white-space: nowrap`，禁止文本换行，同时设置 `overflow: hidden` 隐藏超出的部分，配合 `text-overflow: ellipsis` 显示省略号，实现单行文本溢出省略效果。

示例：

```css
.container {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

1. 多行文本溢出
   CSS 原生没有直接支持多行省略号的标准属性，但可以使用 WebKit 私有属性实现。

示例：

```css
.container {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 显示3行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

这种方式限制容器最多显示三行，超出部分隐藏并显示省略号。兼容性主要集中在基于 WebKit 的浏览器。

1. 其他方法
   利用 JavaScript 截断文本，或结合 CSS 变量和自定义属性实现更复杂的文本溢出控制。

## 注意事项

- `text-overflow: ellipsis` 只能在 `overflow` 不是可见且文本不换行时生效。
- 多行溢出处理存在兼容性限制，需根据项目需求选择合适方案。

## 面试回答

文本溢出处理常用单行方式是设置 `white-space: nowrap`，`overflow: hidden`，`text-overflow: ellipsis` 实现省略号效果。多行省略号可以使用 `-webkit-line-clamp` 配合 `display: -webkit-box` 来实现，但兼容性有限。对于复杂需求，也可借助 JavaScript 处理。

## 总结

文本溢出控制是前端常见需求，通过合理使用 CSS 属性可以优雅地处理单行和多行溢出，提升页面的视觉效果和用户体验。理解各属性的作用和兼容性，有助于做出合适的设计决策。