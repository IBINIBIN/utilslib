const { catchError } = _utilslibCore;

// 示例1：正常的异步函数
const asyncFunc = async () => {
  return "Hello, world!";
};

catchError(asyncFunc).then(([err, data, errMsg]) => {
  console.log(err); // 输出: 0
  console.log(data); // 输出: "Hello, world!"
  console.log(errMsg); // 输出: null
});

// 示例2：抛出异常的异步函数
const asyncFuncWithError = async () => {
  throw new Error("Something went wrong");
};

catchError(asyncFuncWithError).then(([err, data, errMsg]) => {
  console.log(err); // 输出: 1
  console.log(data); // 输出: null
  console.log(errMsg); // 输出: Error: Something went wrong
});

// 示例3：正常的同步函数
const syncFunc = () => {
  return "Hello, world!";
};

catchError(syncFunc).then(([err, data, errMsg]) => {
  console.log(err); // 输出: 0
  console.log(data); // 输出: "Hello, world!"
  console.log(errMsg); // 输出: null
});

// 示例4：抛出异常的同步函数
const syncFuncWithError = () => {
  throw new Error("Something went wrong");
};

catchError(syncFuncWithError).then(([err, data, errMsg]) => {
  console.log(err); // 输出: 1
  console.log(data); // 输出: null
  console.log(errMsg); // 输出: Error: Something went wrong
});
