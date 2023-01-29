import { z } from "zod";

export const ZRequiredConfig = z.object({
  qstashToken: z.string({
    description:
      "The qstash token. We try to infer from process.env, so this is optional",
    invalid_type_error:
      "Did you forget to set QSTASH_TOKEN or pass it in via config?",
    required_error:
      "Did you forget to set QSTASH_TOKEN or pass it in via config?",
  }),
  qstashCurrentSigningKey: z.string({
    invalid_type_error:
      "Did you forget to set QSTASH_CURRENT_SIGNING_KEY or pass it in via config?",
    required_error:
      "Did you forget to set QSTASH_CURRENT_SIGNING_KEY or pass it in via config?",
  }),
  qstashNextSigningKey: z.string({
    invalid_type_error:
      "Did you forget to set QSTASH_NEXT_SIGNING_KEY or pass it in via config?",
    required_error:
      "Did you forget to set QSTASH_NEXT_SIGNING_KEY or pass it in via config?",
  }),
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

export type IGetConfigProps = Partial<z.infer<typeof ZRequiredConfig>>;

export const getConfig = (props?: IGetConfigProps) => {
  const config = ZRequiredConfig.parse({
    baseUrl: getBaseUrl(props),
    qstashToken: getToken(props),
    qstashCurrentSigningKey: getCurrentSigningKey(props),
    qstashNextSigningKey: getNextSigningKey(props),
  });
  return config;
};

export const getBaseUrl = (props?: IGetConfigProps) => {
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

export const getToken = (props?: IGetConfigProps) => {
  return (
    props?.qstashToken ??
    process.env.QSTASH_TOKEN ??
    process.env.NEXT_PUBLIC_QSTASH_TOKEN
  );
};

export const getCurrentSigningKey = (props?: IGetConfigProps) => {
  return (
    props?.qstashCurrentSigningKey ?? process.env.QSTASH_CURRENT_SIGNING_KEY
  );
};

export const getNextSigningKey = (props?: IGetConfigProps) => {
  return props?.qstashNextSigningKey ?? process.env.QSTASH_NEXT_SIGNING_KEY;
};

export const getApiRoutePath = (filename: string) => {
  const x = filename.split("/");
  const y = x.slice(x.indexOf("api")).join("/");
  const z = y.split(".");
  z.pop();
  return z.join(".");
};
