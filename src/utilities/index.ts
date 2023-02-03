export const isBrowser = () => {
  return typeof window !== "undefined";
};

export * from "./requests";
export * from "./types";
