import type { IHandler } from "../types";

export const makeOnReceiveNoop = <JR>(): IHandler<JR> => {
  return async () => new Response("");
};
