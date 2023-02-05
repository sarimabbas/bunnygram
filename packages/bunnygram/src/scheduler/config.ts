import { z } from "zod";

const ZRuntime = z.enum(["browser", "nodejs", "edge"]);

const ZCommonConfig = z.object({
  baseUrl: z
    .string({
      invalid_type_error:
        "We couldn't figure out a baseUrl for your app. Maybe try passing it via config e.g. https://example.com",
      required_error:
        "We couldn't figure out a baseUrl for your app. Maybe try passing it via config e.g. https://example.com",
      description:
        "Where the scheduler can be reached. We try to infer, so this is optional",
    })
    .url(),
  runtime: ZRuntime,
});

export type IRuntime = z.infer<typeof ZRuntime>;

export type ICommonConfigProps = Partial<z.infer<typeof ZCommonConfig>>;

export const getCommonConfig = (props?: ICommonConfigProps) => {
  const config = ZCommonConfig.parse({
    baseUrl: getBaseUrl(props),
    runtime: getRuntime(props),
  } as ICommonConfigProps);
  return config;
};

export const getBaseUrl = (props?: ICommonConfigProps) => {
  if (props?.baseUrl) {
    return props.baseUrl;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
};

export const getRuntime = (props?: ICommonConfigProps) => {
  // user argument takes priority, they know what they are doing
  if (typeof props?.runtime !== "undefined") {
    return props?.runtime;
  }

  // neither node nor edge support window
  if (typeof window !== "undefined") {
    return "browser";
  }

  // this variable should be populated for edge
  if (process.env.NEXT_RUNTIME === "edge") {
    return "edge";
  }

  // default to nodejs (the most common case)
  return "nodejs";
};
