const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject();
  }, 1000);
});
const promise2 = promise1.catch(() => {
  return 2;
});

console.log('promise1', promise1);
console.log('promise2', promise2);

setTimeout(() => {
  console.log('promise1', promise1);
  console.log('promise2', promise2);
}, 2000);



// promise1 Promise { <pending> }
// promise2 Promise { <pending> }
// promise1 Promise { <rejected>: undefined }
// promise2 Promise { 2 }
