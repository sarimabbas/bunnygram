import { test, expect, vi } from "vitest";
import {
  getApiRoutePath,
  getBaseUrl,
  getConfig,
  getCurrentSigningKey,
  getNextSigningKey,
  getToken,
} from "./config";

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

test("getToken with override", () => {
  const token = getToken({ qstashToken: "1234" });
  expect(token).toBe("1234");
});

test("getToken with env", () => {
  vi.stubEnv("NEXT_PUBLIC_QSTASH_TOKEN", "5678");
  const token = getToken();
  expect(token).toBe("5678");
});

test("getToken with env and override", () => {
  vi.stubEnv("QSTASH_TOKEN", "5678");
  const token = getToken({ qstashToken: "1234" });
  expect(token).toBe("1234");
});

test("getCurrentSigningKey with env and override", () => {
  vi.stubEnv("QSTASH_CURRENT_SIGNING_KEY", "5678");
  const currentSigningKey = getCurrentSigningKey({
    qstashCurrentSigningKey: "1234",
  });
  expect(currentSigningKey).toBe("1234");
});

test("getNextSigningKey with env and override", () => {
  vi.stubEnv("QSTASH_NEXT_SIGNING_KEY", "5678");
  const nextSigningKey = getNextSigningKey({
    qstashNextSigningKey: "1234",
  });
  expect(nextSigningKey).toBe("1234");
});

test("getApiRoutePath", () => {
  expect(
    getApiRoutePath("/Users/johndoe/Developer/app/api/send-email.ts")
  ).toBe("api/send-email");

  expect(getApiRoutePath("/Users/johndoe/hello/world/sample.ts")).toBe(
    "sample"
  );
});

test("getConfig with valid overrides set", () => {
  const config = getConfig({
    baseUrl: "http://localhost:2000",
    qstashCurrentSigningKey: "1234",
    qstashNextSigningKey: "5678",
    qstashToken: "abcd",
  });
  expect(config).toStrictEqual({
    baseUrl: "http://localhost:2000",
    qstashCurrentSigningKey: "1234",
    qstashNextSigningKey: "5678",
    qstashToken: "abcd",
  });
});

test("getConfig with invalid overrides set", () => {
  expect(() => {
    getConfig({
      baseUrl: "localhost",
    });
  }).toThrow();
});
