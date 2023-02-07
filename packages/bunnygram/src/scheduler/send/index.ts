import { BasicAdapter, IAdapterSendReturnValue } from "../../adapters";
import { getBaseUrl, getRuntime, IConfig } from "../config";

export interface ISendProps<JP, JR> {
  config: IConfig<JP, JR>;
  payload: JP;
}

export const send = async <JP, JR>(
  props: ISendProps<JP, JR>
): Promise<IAdapterSendReturnValue> => {
  const { payload, config } = props;
  const {
    route,
    adapter = BasicAdapter(),
    baseUrl = getBaseUrl(),
    validator,
  } = config;
  const runtime = getRuntime();

  const url = new URL(route, baseUrl).href;

  if (validator) {
    const p = validator.safeParse(payload);
    if (!p.success) {
      console.error(p.error);
      return {
        error: true,
        message: "Could not validate payload",
      };
    }
  }

  const response = await adapter.send({
    payload,
    url,
    runtime,
  });

  return response;
};
