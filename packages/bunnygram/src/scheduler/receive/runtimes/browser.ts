import type { NextResponse } from "next/server";
import type { IHandler } from "../types";

export const makeOnReceiveNoop = <JR>(): IHandler<JR> => {
  return async () => new Response("") as NextResponse;
};
