import { z } from "zod";

export const ZQStashSendConfig = z.object({
  qstashToken: z.string({
    description:
      "The qstash token. We try to infer from process.env, so this is optional",
    invalid_type_error:
      "Did you forget to set QSTASH_TOKEN or NEXT_PUBLIC_QSTASH_TOKEN or pass it in via config?",
    required_error:
      "Did you forget to set QSTASH_TOKEN or NEXT_PUBLIC_QSTASH_TOKEN or pass it in via config?",
  }),
});

export const ZQStashVerifyConfig = z.object({
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
});

export type IQStashConfig = Partial<
  z.infer<typeof ZQStashSendConfig> & z.infer<typeof ZQStashVerifyConfig>
>;

export const getQStashSendConfig = (props?: IQStashConfig) => {
  const config = ZQStashSendConfig.parse({
    qstashToken: getToken(props),
  });
  return config;
};

export const getQStashVerifyConfig = (props?: IQStashConfig) => {
  const config = ZQStashVerifyConfig.parse({
    qstashCurrentSigningKey: getCurrentSigningKey(props),
    qstashNextSigningKey: getNextSigningKey(props),
  });
  return config;
};

export const getToken = (props?: IQStashConfig) => {
  return (
    props?.qstashToken ??
    process.env.QSTASH_TOKEN ??
    process.env.NEXT_PUBLIC_QSTASH_TOKEN
  );
};

export const getCurrentSigningKey = (props?: IQStashConfig) => {
  return (
    props?.qstashCurrentSigningKey ?? process.env.QSTASH_CURRENT_SIGNING_KEY
  );
};

export const getNextSigningKey = (props?: IQStashConfig) => {
  return props?.qstashNextSigningKey ?? process.env.QSTASH_NEXT_SIGNING_KEY;
};
