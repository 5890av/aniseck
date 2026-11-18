import { describe, expect, it } from "vitest";
import { parseScore } from "@/lib/watchlist";

describe("personal score", () => {
  it("accepts decimals like 8.5", () => expect(parseScore("8.5")).toBe(8.5));
  it("accepts the bounds 1 and 10", () => { expect(parseScore("1")).toBe(1); expect(parseScore("10")).toBe(10); });
  it("rejects scores below 1", () => expect(parseScore("0.5")).toBeNull());
  it("rejects scores above 10", () => expect(parseScore("10.5")).toBeNull());
});
