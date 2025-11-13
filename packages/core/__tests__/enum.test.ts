import { createEnum, createEnumWithDescription } from "../src/enum";

describe("Enum Utils", () => {
  describe("createEnum", () => {
    it("should create a bidirectional enum with string values", () => {
      const Direction = createEnum({
        NORTH: "north",
        SOUTH: "south",
        EAST: "east",
        WEST: "west",
      } as const);

      // Test forward mapping
      expect(Direction.NORTH).toBe("north");
      expect(Direction.SOUTH).toBe("south");
      expect(Direction.EAST).toBe("east");
      expect(Direction.WEST).toBe("west");

      // Test reverse mapping
      expect((Direction as any).north).toBe("NORTH");
      expect((Direction as any).south).toBe("SOUTH");
      expect((Direction as any).east).toBe("EAST");
      expect((Direction as any).west).toBe("WEST");
    });

    it("should create a bidirectional enum with number values", () => {
      const Status = createEnum({
        PENDING: 0,
        IN_PROGRESS: 1,
        COMPLETED: 2,
        CANCELLED: 3,
      } as const);

      // Test forward mapping
      expect(Status.PENDING).toBe(0);
      expect(Status.IN_PROGRESS).toBe(1);
      expect(Status.COMPLETED).toBe(2);
      expect(Status.CANCELLED).toBe(3);

      // Test reverse mapping
      expect((Status as any)[0]).toBe("PENDING");
      expect((Status as any)[1]).toBe("IN_PROGRESS");
      expect((Status as any)[2]).toBe("COMPLETED");
      expect((Status as any)[3]).toBe("CANCELLED");
    });

    it("should create a bidirectional enum with mixed value types", () => {
      const Mixed = createEnum({
        STRING_VALUE: "test",
        NUMBER_VALUE: 42,
        ZERO: 0,
      } as const);

      // Test forward mapping
      expect(Mixed.STRING_VALUE).toBe("test");
      expect(Mixed.NUMBER_VALUE).toBe(42);
      expect(Mixed.ZERO).toBe(0);

      // Test reverse mapping
      expect((Mixed as any).test).toBe("STRING_VALUE");
      expect((Mixed as any)[42]).toBe("NUMBER_VALUE");
      expect((Mixed as any)[0]).toBe("ZERO");
    });

    it("should throw error for non-string/number values", () => {
      expect(() => {
        createEnum({
          BOOLEAN_VALUE: true,
          OBJECT_VALUE: { test: true },
          ARRAY_VALUE: [1, 2, 3],
        } as any);
      }).toThrow("Enum value must be string or number");
    });

    it("should return a frozen object", () => {
      const TestEnum = createEnum({
        A: "a",
        B: "b",
      } as const);

      expect(Object.isFrozen(TestEnum)).toBe(true);
    });

    it("should handle empty enum", () => {
      const EmptyEnum = createEnum({} as const);
      expect(Object.keys(EmptyEnum)).toHaveLength(0);
      expect(Object.isFrozen(EmptyEnum)).toBe(true);
    });

    it("should preserve prototype with reverse mappings", () => {
      const TestEnum = createEnum({
        KEY: "value",
      } as const);

      const proto = Object.getPrototypeOf(TestEnum);
      expect(proto.value).toBe("KEY");
    });

    it("should handle duplicate values", () => {
      // Skip this test as duplicate values throw an error in the implementation
      expect(() => {
        createEnum({
          FIRST: "same",
          SECOND: "same",
          THIRD: "different",
        } as const);
      }).toThrow();
    });
  });

  describe("createEnumWithDescription", () => {
    it("should create enum with descriptions", () => {
      const Status = createEnumWithDescription({
        PENDING: { value: "pending", description: "Waiting to be processed" },
        IN_PROGRESS: { value: "in_progress", description: "Currently being processed" },
        COMPLETED: { value: "completed", description: "Successfully finished" },
      } as const);

      // Test forward mapping
      expect(Status.PENDING).toBe("pending");
      expect(Status.IN_PROGRESS).toBe("in_progress");
      expect(Status.COMPLETED).toBe("completed");

      // Test reverse mapping
      expect((Status as any).pending).toBe("PENDING");
      expect((Status as any).in_progress).toBe("IN_PROGRESS");
      expect((Status as any).completed).toBe("COMPLETED");
    });

    it("should provide description access via prototype", () => {
      const Status = createEnumWithDescription({
        ACTIVE: { value: "active", description: "Currently active" },
        INACTIVE: { value: "inactive", description: "Currently inactive" },
      } as const);

      const proto = Object.getPrototypeOf(Status);
      expect(proto.desc.active).toBe("Currently active");
      expect(proto.desc.inactive).toBe("Currently inactive");
      expect(proto.desc.PENDING).toBe(undefined);
    });

    it("should handle mixed string and number values with descriptions", () => {
      const Mixed = createEnumWithDescription({
        STRING_KEY: { value: "test_string", description: "String value description" },
        NUMBER_KEY: { value: 42, description: "Number value description" },
        ZERO_KEY: { value: 0, description: "Zero value description" },
      } as const);

      // Test forward mapping
      expect(Mixed.STRING_KEY).toBe("test_string");
      expect(Mixed.NUMBER_KEY).toBe(42);
      expect(Mixed.ZERO_KEY).toBe(0);

      // Test reverse mapping
      expect((Mixed as any).test_string).toBe("STRING_KEY");
      expect((Mixed as any)[42]).toBe("NUMBER_KEY");
      expect((Mixed as any)[0]).toBe("ZERO_KEY");

      // Test descriptions
      const proto = Object.getPrototypeOf(Mixed);
      expect(proto.desc.test_string).toBe("String value description");
      expect(proto.desc[42]).toBe("Number value description");
      expect(proto.desc[0]).toBe("Zero value description");
    });

    it("should return a frozen object", () => {
      const TestEnum = createEnumWithDescription({
        KEY: { value: "value", description: "description" },
      } as const);

      expect(Object.isFrozen(TestEnum)).toBe(true);
    });

    it("should handle empty enum with descriptions", () => {
      const EmptyEnum = createEnumWithDescription({} as const);
      expect(Object.keys(EmptyEnum)).toHaveLength(0);
      expect(Object.isFrozen(EmptyEnum)).toBe(true);
    });

    it("should create description proxy that handles missing keys", () => {
      const TestEnum = createEnumWithDescription({
        KEY1: { value: "value1", description: "Description 1" },
      } as const);

      const proto = Object.getPrototypeOf(TestEnum);

      // Existing key
      expect(proto.desc.value1).toBe("Description 1");

      // Non-existing key should return undefined
      expect(proto.desc.nonexistent).toBeUndefined();
      expect(proto.desc[999]).toBeUndefined();
    });

    it("should handle enum values that are numbers and strings in descriptions", () => {
      const Enum = createEnumWithDescription({
        STRING_VAL: { value: "abc", description: "String description" },
        NUMERIC_VAL: { value: 123, description: "Numeric description" },
        ZERO_VAL: { value: 0, description: "Zero description" },
      } as const);

      const proto = Object.getPrototypeOf(Enum);

      // Access by both value types
      expect(proto.desc.abc).toBe("String description");
      expect(proto.desc[123]).toBe("Numeric description");
      expect(proto.desc[0]).toBe("Zero description");

      // Access by enum key
      expect(proto.desc.STRING_VAL).toBe("String description");
      expect(proto.desc.NUMERIC_VAL).toBe("Numeric description");
      expect(proto.desc.ZERO_VAL).toBe("Zero description");
    });

    it("should work with TypeScript strict type checking", () => {
      const StrictEnum = createEnumWithDescription({
        OPTION_A: { value: "a", description: "Option A" },
        OPTION_B: { value: "b", description: "Option B" },
      } as const);

      // These should compile without TypeScript errors
      const aValue: "a" | "b" = StrictEnum.OPTION_A;
      const aKey: "OPTION_A" | "OPTION_B" = (StrictEnum as any).a;

      expect(aValue).toBe("a");
      expect(aKey).toBe("OPTION_A");
    });
  });
});
