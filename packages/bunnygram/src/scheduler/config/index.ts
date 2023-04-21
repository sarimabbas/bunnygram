import type { ServerRuntime } from "next";
import { z } from "zod";
import { IAdapter } from "../../adapters";

export type IRuntime = Extract<ServerRuntime, "nodejs" | "edge"> | "browser";

export interface IConfig<JP, JR> {
  route: string;
  adapter?: IAdapter<JP>;
  baseUrl?: string;
  validator?: z.ZodSchema<JP>;
}

export const makeConfig = <JP, JR>(
  config: IConfig<JP, JR>
): IConfig<JP, JR> => {
  return config;
};

export const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
};

export const getRuntime = (): IRuntime => {
  // neither node nor edge support window
  if (typeof window !== "undefined") {
    return "browser";
  }

  // this variable should be populated for edge
  if (process.env.NEXT_RUNTIME === "edge") {
    return "edge";
  }

  // default to nodejs
  return "nodejs";
};
