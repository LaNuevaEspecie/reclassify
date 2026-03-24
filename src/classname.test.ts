import { describe, expect, it } from "vite-plus/test";
import { classify, configure, defaultClassify } from "./index";

describe("defaultClassify", () => {
  it("returns strings unchanged", () => {
    expect(defaultClassify("btn primary")).toBe("btn primary");
  });

  it("keeps number tokens including zero", () => {
    expect(defaultClassify(0)).toBe("0");
    expect(defaultClassify(42)).toBe("42");
  });

  it("flattens nested arrays depth-first", () => {
    expect(defaultClassify(["btn", ["primary", ["focus"]], "wide"])).toBe("btn primary focus wide");
  });

  it("includes object keys with truthy values", () => {
    expect(
      defaultClassify({
        btn: true,
        primary: 1,
        disabled: false,
      }),
    ).toBe("btn primary");
  });

  it("supports mixed values while ignoring falsy entries", () => {
    expect(
      defaultClassify([
        "btn",
        0,
        false,
        null,
        undefined,
        { active: true, hidden: false },
        ["nested", { ready: 1 }],
      ]),
    ).toBe("btn 0 active nested ready");
  });

  it("preserves object and array order", () => {
    expect(
      defaultClassify(["first", { second: true, third: true }, ["fourth", { fifth: true }]]),
    ).toBe("first second third fourth fifth");
  });

  it("supports class keys containing spaces", () => {
    expect(
      defaultClassify({
        "btn primary": true,
        hidden: false,
      }),
    ).toBe("btn primary");
  });

  it("returns an empty string when no class names are enabled", () => {
    expect(defaultClassify(false)).toBe("");
    expect(defaultClassify([null, undefined, false, { hidden: 0 }])).toBe("");
  });

  it("drops empty strings", () => {
    expect(defaultClassify("")).toBe("");
    expect(defaultClassify(["btn", "", "primary"])).toBe("btn primary");
  });

  it("returns an empty string for null and undefined", () => {
    expect(defaultClassify(null)).toBe("");
    expect(defaultClassify(undefined)).toBe("");
  });
});

describe("classify", () => {
  it("uses the default normalizer when unconfigured", () => {
    expect(classify(["btn", { active: true }])).toBe("btn active");
  });

  it("uses the configured normalizer", () => {
    const restore = configure({
      fn: (value) => `configured:${defaultClassify(value)}`,
    });

    try {
      expect(classify(["btn", { active: true }])).toBe("configured:btn active");
    } finally {
      restore();
    }

    expect(classify(["btn", { active: true }])).toBe("btn active");
  });

  it("keeps defaultClassify stable while configured", () => {
    const restore = configure({
      fn: () => "configured",
    });

    try {
      expect(defaultClassify(["btn", { active: true }])).toBe("btn active");
      expect(classify(["btn", { active: true }])).toBe("configured");
    } finally {
      restore();
    }
  });

  it("restores nested configuration in LIFO order", () => {
    const restoreOuter = configure({
      fn: (value) => `outer:${defaultClassify(value)}`,
    });
    const restoreInner = configure({
      fn: (value) => `inner:${defaultClassify(value)}`,
    });

    try {
      expect(classify(["btn"])).toBe("inner:btn");
    } finally {
      restoreInner();
    }

    try {
      expect(classify(["btn"])).toBe("outer:btn");
    } finally {
      restoreOuter();
    }

    expect(classify(["btn"])).toBe("btn");
  });
});
