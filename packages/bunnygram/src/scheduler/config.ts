import { z } from "zod";

export const ZCommonConfig = z.object({
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
});

export type ICommonConfigProps = Partial<z.infer<typeof ZCommonConfig>>;

export const getCommonConfig = (props?: ICommonConfigProps) => {
  const config = ZCommonConfig.parse({
    baseUrl: getBaseUrl(props),
  });
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
