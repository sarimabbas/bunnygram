import { NextApiRequest, NextApiResponse, ServerRuntime } from "next";
import { NextRequest, NextResponse } from "next/server";

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
 * @returns best guess for runtime, since neither node nor edge support window
 */
export const guessRuntime = (): IRuntime => {
  if (typeof window !== "undefined") {
    return "browser";
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    return "edge";
  }

  return "nodejs";
};
