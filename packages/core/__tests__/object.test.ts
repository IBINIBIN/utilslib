/// <reference types="jest" />

import { omit, pick, createEnum, createEnumWithDescription } from "../src/object.js";

describe("object.ts 测试", () => {
  describe("omit", () => {
    test("从对象中排除指定的属性", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ["a", "c"]);
      expect(result).toEqual({ b: 2, d: 4 });
    });

    test("排除不存在的属性不应抛出错误", () => {
      const obj = { a: 1, b: 2 };
      // @ts-expect-error - 测试运行时行为
      const result = omit(obj, ["c"]);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    test("排除空数组应返回原对象的副本", () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, []);
      expect(result).toEqual(obj);
      expect(result).not.toBe(obj); // 确保返回的是新对象
    });

    test("处理复杂对象", () => {
      const obj = {
        name: "Alice",
        age: 30,
        address: { city: "New York", zip: "10001" },
        hobbies: ["reading", "coding"],
      };
      const result = omit(obj, ["age", "hobbies"]);
      expect(result).toEqual({
        name: "Alice",
        address: { city: "New York", zip: "10001" },
      });
    });
  });

  describe("pick", () => {
    test("从对象中选取指定的属性", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = pick(obj, ["a", "c"]);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    test("选取不存在的属性应被忽略", () => {
      const obj = { a: 1, b: 2 };
      // @ts-expect-error - 测试运行时行为
      const result = pick(obj, ["a", "c"]);
      expect(result).toEqual({ a: 1 });
    });

    test("选取空数组应返回空对象", () => {
      const obj = { a: 1, b: 2 };
      const result = pick(obj, []);
      expect(result).toEqual({});
    });

    test("处理复杂对象", () => {
      const obj = {
        name: "Alice",
        age: 30,
        address: { city: "New York", zip: "10001" },
        hobbies: ["reading", "coding"],
      };
      const result = pick(obj, ["name", "hobbies"]);
      expect(result).toEqual({
        name: "Alice",
        hobbies: ["reading", "coding"],
      });
    });

    test("处理原型链上的属性", () => {
      const proto = { inherited: "value" };
      const obj = Object.create(proto);
      obj.own = "property";

      const result = pick(obj, ["own", "inherited" as keyof typeof obj]);
      expect(result).toEqual({ own: "property" }); // 不应包含继承的属性
    });
  });

  describe("createEnum", () => {
    test("创建具有双向映射的枚举对象", () => {
      const Colors = createEnum({
        RED: "red",
        GREEN: "green",
        BLUE: "blue",
      });

      // 正向映射
      expect(Colors.RED).toBe("red");
      expect(Colors.GREEN).toBe("green");
      expect(Colors.BLUE).toBe("blue");

      // 反向映射
      expect(Colors.red).toBe("RED");
      expect(Colors.green).toBe("GREEN");
      expect(Colors.blue).toBe("BLUE");
    });

    test("支持数字值", () => {
      const StatusCodes = createEnum({
        OK: 200,
        NOT_FOUND: 404,
        SERVER_ERROR: 500,
      });

      // 正向映射
      expect(StatusCodes.OK).toBe(200);
      expect(StatusCodes.NOT_FOUND).toBe(404);
      expect(StatusCodes.SERVER_ERROR).toBe(500);

      // 反向映射
      expect(StatusCodes[200]).toBe("OK");
      expect(StatusCodes[404]).toBe("NOT_FOUND");
      expect(StatusCodes[500]).toBe("SERVER_ERROR");
    });

    test("返回的对象应该是冻结的", () => {
      const Colors = createEnum({
        RED: "red",
        GREEN: "green",
      });

      expect(Object.isFrozen(Colors)).toBe(true);

      // 尝试修改应该失败（在严格模式下会抛出错误）
      expect(() => {
        // @ts-expect-error - 测试运行时行为
        Colors.RED = "changed";
      }).toThrow();

      expect(Colors.RED).toBe("red"); // 值应该保持不变
    });

    test("非字符串或数字值应抛出错误", () => {
      expect(() => {
        createEnum({
          // @ts-expect-error - 测试运行时行为
          INVALID: { something: "wrong" },
        });
      }).toThrow(TypeError);

      expect(() => {
        createEnum({
          // @ts-expect-error - 测试运行时行为
          INVALID: true,
        });
      }).toThrow(TypeError);
    });
  });

  describe("createEnumWithDescription", () => {
    test("创建带有描述信息的枚举对象", () => {
      const Colors = createEnumWithDescription({
        RED: { value: "red", description: "Red color" },
        GREEN: { value: "green", description: "Green color" },
        BLUE: { value: "blue", description: "Blue color" },
      });

      // 正向映射
      expect(Colors.RED).toBe("red");
      expect(Colors.GREEN).toBe("green");
      expect(Colors.BLUE).toBe("blue");

      // 反向映射
      expect(Colors.red).toBe("RED");
      expect(Colors.green).toBe("GREEN");
      expect(Colors.blue).toBe("BLUE");
    });

    test("支持数字值", () => {
      const StatusCodes = createEnumWithDescription({
        OK: { value: 200, description: "Success" },
        NOT_FOUND: { value: 404, description: "Resource not found" },
        SERVER_ERROR: { value: 500, description: "Internal server error" },
      });

      // 正向映射
      expect(StatusCodes.OK).toBe(200);
      expect(StatusCodes.NOT_FOUND).toBe(404);
      expect(StatusCodes.SERVER_ERROR).toBe(500);

      // 反向映射
      expect(StatusCodes[200]).toBe("OK");
      expect(StatusCodes[404]).toBe("NOT_FOUND");
      expect(StatusCodes[500]).toBe("SERVER_ERROR");
    });

    test("返回的对象应该是冻结的", () => {
      const Colors = createEnumWithDescription({
        RED: { value: "red", description: "Red color" },
        GREEN: { value: "green", description: "Green color" },
      });

      expect(Object.isFrozen(Colors)).toBe(true);
    });

    test("可以通过desc属性获取描述信息", () => {
      const StatusCodes = createEnumWithDescription({
        OK: { value: 200, description: "Success" },
        NOT_FOUND: { value: 404, description: "Resource not found" },
      });

      // @ts-expect-error - 测试内部实现
      expect(StatusCodes.desc.OK).toBe("Success");
      // @ts-expect-error - 测试内部实现
      expect(StatusCodes.desc.NOT_FOUND).toBe("Resource not found");
      // @ts-expect-error - 测试内部实现
      expect(StatusCodes.desc[200]).toBe("Success");
      // @ts-expect-error - 测试内部实现
      expect(StatusCodes.desc[404]).toBe("Resource not found");
    });
  });
});
