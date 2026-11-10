import { describe, expect, it } from "vitest";
import { isModuleLoadError } from "@/lib/module-load-error";

describe("stale route module detection", () => {
  it("recognizes the reported email chunk failure", () => {
    expect(isModuleLoadError(new TypeError("Failed to fetch dynamically imported module: /@oj-start/email-C2v9W_Wt.js"))).toBe(true);
  });
  it("does not treat an AI connection failure as a stale page", () => {
    expect(isModuleLoadError(new Error("Couldn't reach the AI service. Check your internet connection."))).toBe(false);
  });
});