import {
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
  ServerRuntime,
} from "next";
import { NextRequest, NextResponse } from "next/server";
import { IEdgeApiHandler } from "./handler";

/**
 * edge, nodejs and browser
 */
export type IRuntime = Extract<ServerRuntime, "edge" | "nodejs"> | "browser";

/**
 * Either edge or nodejs
 */
export type IServerRuntime = Omit<ServerRuntime, "browser">;

/**
 *
 * @param req the HTTP request
 * @param runtime nodejs or edge
 * @returns the req object coerced to a type
 */
export const coerceRequestWithServerRuntime = (
  req: NextRequest | NextApiRequest,
  runtime: IServerRuntime
) => {
  if (runtime === "edge") {
    return req as NextRequest;
  } else {
    return req as NextApiRequest;
  }
};

/**
 *
 * @param res the HTTP response
 * @param runtime nodejs or edge
 * @returns the res object coerced to a type
 */
export const coerceResponsetWithServerRuntime = (
  res: NextResponse | NextApiResponse,
  runtime: IServerRuntime
) => {
  if (runtime === "edge") {
    return res as NextResponse;
  } else {
    return res as NextApiResponse;
  }
};

/**
 *
 * @param res the HTTP handler
 * @param runtime nodejs or edge
 * @returns the handler function coerced to a type
 */
export const coerceHandlerWithServerRuntime = <T>(
  handler: NextApiHandler<T> | IEdgeApiHandler,
  runtime: IServerRuntime
) => {
  if (runtime === "edge") {
    return handler as IEdgeApiHandler;
  } else {
    return handler as NextApiHandler;
  }
};

/**
 *
 * @returns best guess for runtime
 */
export const guessRuntime = (maybeRuntime?: IRuntime): IRuntime => {
  // user argument takes priority, they know what they are doing
  if (typeof maybeRuntime !== "undefined") {
    return maybeRuntime;
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
