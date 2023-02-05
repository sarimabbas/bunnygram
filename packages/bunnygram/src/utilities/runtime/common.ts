import { ServerRuntime } from "next";

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
