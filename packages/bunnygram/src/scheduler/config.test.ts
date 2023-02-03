import { test, expect, vi } from "vitest";
import { getBaseUrl } from "./config";

test("getBaseUrl with override", () => {
  const baseUrl = getBaseUrl({ baseUrl: "https://example.com" });
  expect(baseUrl).toBe("https://example.com");
});

test("getBaseUrl with env", () => {
  vi.stubEnv("VERCEL_URL", "example.vercel.app");
  let baseUrl = getBaseUrl();
  expect(baseUrl).toBe("https://example.vercel.app");

  vi.unstubAllEnvs();
  vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "world.vercel.app");
  baseUrl = getBaseUrl();
  expect(baseUrl).toBe("https://world.vercel.app");
});

test("getBaseUrl with env and override", () => {
  vi.stubEnv("VERCEL_URL", "example.vercel.app");
  const baseUrl = getBaseUrl({ baseUrl: "https://example.com" });
  expect(baseUrl).toBe("https://example.com");
});
