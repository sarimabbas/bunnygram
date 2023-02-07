import { Client, Receiver, type PublishJsonRequest } from "@upstash/qstash";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import type { IAdapter } from "../types";
import {
  getQStashSendConfig,
  getQStashVerifyConfig,
  type IQStashConfig,
} from "./config";

export interface IQStashAdapterProps {
  /**
   * override the qstash.publishJSON method
   */
  sendOptions?: Omit<PublishJsonRequest, "body">;

  /**
   * env vars that need to be set
   */
  config?: IQStashConfig;
}

export const QStashAdapter = <JP>(props: IQStashAdapterProps): IAdapter<JP> => {
  const { config, sendOptions } = props;

  return {
    send: async (sendProps) => {
      const sendConfig = getQStashSendConfig(config);

      let qstashClient: Client;
      try {
        qstashClient = new Client({
          token: sendConfig.qstashToken,
        });
      } catch (e) {
        console.error(e);
        return {
          error: true,
          message:
            e instanceof Error
              ? e.message
              : "Failed to initialize qstash client",
        };
      }

      const { payload, url } = sendProps;

      let messageId: string;
      try {
        const response = await qstashClient.publishJSON({
          url,
          body: payload,
          ...sendOptions,
        });
        messageId = response.messageId;
      } catch (e) {
        console.error(e);
        return {
          error: true,
          message: e instanceof Error ? e.message : "qstash.publishJSON failed",
        };
      }

      return {
        error: false,
        message: "POST to QStash succeeded",
        messageId,
      };
    },
    verify: async (verifyProps) => {
      const { req, rawBody, runtime } = verifyProps;
      if (runtime === "browser") {
        return {
          verified: true,
        };
      }

      const verifyConfig = getQStashVerifyConfig();

      const receiver = new Receiver({
        currentSigningKey: verifyConfig.qstashCurrentSigningKey,
        nextSigningKey: verifyConfig.qstashNextSigningKey,
      });

      let signature: any = "";
      if (runtime === "edge") {
        signature = (req as NextRequest).headers.get("upstash-signature");
      } else {
        signature = (req as NextApiRequest).headers["upstash-signature"];
      }

      if (!signature) {
        return {
          verified: false,
          message: "`Upstash-Signature` header is missing",
        };
      }

      if (typeof signature !== "string") {
        return {
          verified: false,
          message: "`Upstash-Signature` header is not a string",
        };
      }

      const isValid = await receiver.verify({
        signature,
        body: rawBody,
      });

      if (!isValid) {
        return {
          verified: false,
          message: "Invalid signature",
        };
      }

      return {
        verified: true,
      };
    },
  };
};
