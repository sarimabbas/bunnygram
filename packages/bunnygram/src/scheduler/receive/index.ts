import { getRuntime } from "../../scheduler/config";
import { onReceiveEdge } from "../receive/runtimes/edge";
import { onReceiveNode } from "../receive/runtimes/node";
import { IHandler, IReceiveProps } from "../types";

export const onReceive = <JP, JR>(
  props: IReceiveProps<JP, JR>
): IHandler<JR> => {
  const runtime = getRuntime();
  if (runtime === "browser") {
    return () => {};
  } else if (runtime === "edge") {
    return onReceiveEdge(props);
  } else {
    return onReceiveNode(props);
  }
};
