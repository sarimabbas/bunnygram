import { run } from "node:test";
import { test, expect, vi } from "vitest";
import { getBaseUrl, getRuntime } from ".";

test("getBaseUrl with env", () => {
  vi.stubEnv("VERCEL_URL", "example.vercel.app");
  let baseUrl = getBaseUrl();
  expect(baseUrl).toBe("https://example.vercel.app");

  vi.unstubAllEnvs();
  vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "world.vercel.app");
  baseUrl = getBaseUrl();
  expect(baseUrl).toBe("https://world.vercel.app");
});

test("getRuntime with env", () => {
  vi.stubEnv("NEXT_RUNTIME", "edge");
  let runtime = getRuntime();
  expect(run).toBe("edge");

  vi.unstubAllEnvs();
  vi.stubEnv("NEXT_RUNTIME", "nodejs");
  runtime = getRuntime();
  expect(runtime).toBe("nodejs");
});
