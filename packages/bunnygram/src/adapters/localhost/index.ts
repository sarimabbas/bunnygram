import { IAdapter } from "../common";

export interface ILocalhostAdapterProps {}

export const LocalhostAdapter = <JP>(): IAdapter<JP> => {
  return {
    send: async (sendProps) => {
      const { payload, url } = sendProps;
      try {
        await fetch(url, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        });
        return {
          error: false,
          message: "POST to localhost succeeded",
          messageId: new Date().toISOString(),
        };
      } catch (err) {
        console.error(err);
        return {
          error: true,
          message: "POST to localhost failed",
        };
      }
    },
    verify: async () => {
      return {
        verified: true,
      };
    },
  };
};
