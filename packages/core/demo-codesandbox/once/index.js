const { once } = require("@utilslib/core");

// 创建一个只执行一次的函数
const myFunction = once((str) => {
  console.log(str);
});

// 调用函数
myFunction("This function will only be executed once."); // 输出: "This function will only be executed once."
myFunction("again"); // 不会再次执行
