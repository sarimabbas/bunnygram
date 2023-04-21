import { getRuntime } from "../../scheduler/config";
import { makeOnReceiveNoop } from "./runtimes/browser";
import { makeOnReceiveRouteHandler } from "./runtimes/isomorphic";
import type { IHandler, IReceiveProps } from "./types";

export const onReceive = <JP, JR>(
  props: IReceiveProps<JP, JR>
): IHandler<JR> => {
  const runtime = getRuntime();
  if (runtime === "browser") {
    return makeOnReceiveNoop();
  } else {
    return makeOnReceiveRouteHandler(props);
  }
};
