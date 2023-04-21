import type { NextResponse } from "next/server";
import { getRuntime } from "../../scheduler/config";
import { onReceiveEdge } from "../receive/runtimes/edge";
import type { IHandler, IReceiveProps } from "./types";

export const onReceive = <JP, JR>(
  props: IReceiveProps<JP, JR>
): IHandler<JR> => {
  const runtime = getRuntime();
  if (runtime === "browser") {
    return async () => new Response("") as NextResponse;
  } else {
    return onReceiveEdge(props);
  }
};
