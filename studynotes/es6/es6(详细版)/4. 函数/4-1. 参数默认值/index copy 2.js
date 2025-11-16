// function getContainer() {
//     console.log("abc");
//     return document.getElementById("container");
// }

// /**
//  * 创建一个元素
//  * @param {*} name 元素的名称
//  * @param {*} container 元素的父元素
//  * @param {*} content 元素的内容
//  */
// f             unction createElement(name = "div", container = getContainer(), content = "") {
//     const ele = document.createElement(name)
//     if (content) {
//         ele.innerHTML = content;
//     }
//     container.appendChild(ele);
// }

// createElement(undefined, undefined, "手动阀手动阀十分")
// createElement(undefined, undefined, "234242342424")
// createElement(undefined, document.getElementById("container"), "234242342424")

function createElement(name = "div", container = getContainer(), content = "") {
  const ele = document.createElement(name);
  if (content) {
    ele.innerHTML = content;
  }
  container.appendChild(ele);
}
console.log(createElement());
createElement(undefined, undefined, "dsadsa   ");
createElement(undefined, document.getElementById("GETCONTAINER"), "dsadsa");
