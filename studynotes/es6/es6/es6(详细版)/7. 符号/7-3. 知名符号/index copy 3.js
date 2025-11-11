const arr = [1];
const obj = {
    0: 3,
    1: 4,
    length: 2,
    [Symbol.isConcatSpreadable]: true
}

const result = arr.concat(2, obj)

console.log(result)


// 场景,arr2[Symbol.isConcatSpreadable],结果行为
// 你最初的代码,false,"arr2 被视为单个元素。结果：[3, 56, [5, 6, 7, 8]]"
// 现在这个例子,未设置 (默认 true),"arr2 被展开。结果：[3, 56, 5, 6, 7, 8]"