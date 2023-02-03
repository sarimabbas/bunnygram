export interface IErrorResponse {
  message: string;
  error: boolean;
}

export const isBrowser = () => {
  return typeof window !== "undefined";
};

export * from "./requests";
