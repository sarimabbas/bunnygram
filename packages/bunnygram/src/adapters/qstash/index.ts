import { Client, PublishJsonRequest, Receiver } from "@upstash/qstash";
import { IAdapter } from "../common";
import {
  getQStashSendConfig,
  getQStashVerifyConfig,
  IQStashConfig,
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

      const qstashClient = new Client({
        token: sendConfig.qstashToken,
      });

      const { payload, url } = sendProps;

      const { messageId } = await qstashClient.publishJSON({
        url,
        body: payload,
        ...sendOptions,
      });

      return {
        error: false,
        message: "POST to QStash succeeded",
        messageId,
      };
    },
    verify: async (verifyProps) => {
      const { req, rawBody } = verifyProps;
      // todo(sarim): do we need to guard this with isBrowser()?

      const verifyConfig = getQStashVerifyConfig();

      const receiver = new Receiver({
        currentSigningKey: verifyConfig.qstashCurrentSigningKey,
        nextSigningKey: verifyConfig.qstashNextSigningKey,
      });

      const signature = req.headers["upstash-signature"];

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
