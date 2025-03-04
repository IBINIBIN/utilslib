const { listenClickOutside } = _utilslibCore;

// 场景1: target是一个元素
const element1 = document.getElementById("my-element1");
const destroyListener1 = listenClickOutside(element1, () => {
  console.log("Clicked outside of my-element1");
});

// 场景2: target是一个元素数组
const element2 = document.getElementById("my-element2");
const element3 = document.getElementById("my-element3");
const destroyListener2 = listenClickOutside([element2, element3], () => {
  console.log("Clicked outside of my-element2 and my-element3");
});

// 场景3: target是一个CSS选择器
const destroyListener3 = listenClickOutside(".my-class", () => {
  console.log("Clicked outside of any element with my-class");
});

// 场景4: target是一个CSS选择器数组
const destroyListener4 = listenClickOutside([".my-class1", ".my-class2"], () => {
  console.log("Clicked outside of any element with my-class1 or my-class2");
});

// 场景5: target是一个混合的数组
const element4 = document.getElementById("my-element4");
const destroyListener5 = listenClickOutside([element4, ".my-class3"], () => {
  console.log("Clicked outside of my-element4 and any element with my-class3");
});

// 当你想要停止监听点击事件时，可以调用返回的函数：
// destroyListener1();
// destroyListener2();
// destroyListener3();
// destroyListener4();
// destroyListener5();
