import { Client, PublishJsonRequest } from "@upstash/qstash";
import { verifySignature } from "@upstash/qstash/nextjs";
import type { NextApiHandler } from "next";
import { z } from "zod";
import { getConfig, IGetConfigProps } from "./config";

// generics key
// JP: JobPayload
// JR: JobResponse

/**
 * IJob describes a job to be run
 * It takes in a JP type and returns a JR
 */
type IJob<JP, JR> = (payload: JP) => Promise<JR>;

interface ISchedulerProps<JP, JR> {
  // the route it is reachable on
  route: string;

  // the job to run
  job: IJob<JP, JR>;

  // An optional zod validator for the incoming payload
  validator?: z.ZodSchema<JP>;

  // extra config
  config?: IGetConfigProps;
}

interface ISchedulerReturnValue<JP, JR> {
  handler: NextApiHandler<IReceiveMessageReturnValue<JR>>;
  send: (props: ISendMessageProps<JP>) => Promise<{ messageId: string }>;
}

interface ISendMessageProps<JP> {
  payload: JP;

  // The qstash publish options overrides
  qstashPublishOptions?: Omit<PublishJsonRequest, "body">;
}

interface IReceiveMessageReturnValue<JR> {
  jobResponse?: JR;
  message: string;
  error: boolean;
}

export const Scheduler = <JP, JR>(
  props: ISchedulerProps<JP, JR>
): ISchedulerReturnValue<JP, JR> => {
  // define these outside so that the functions below can close over it
  const config = getConfig(props.config);

  // receives data from Qstash
  const handler: NextApiHandler<IReceiveMessageReturnValue<JR>> = async (
    req,
    res
  ) => {
    const payload: JP = req.body;

    if (props?.validator) {
      try {
        props.validator.parse(payload);
      } catch (err) {
        console.error(err);
        return res.status(500).json({
          message:
            err instanceof Error
              ? err.message
              : "Failed to validate request payload",
          error: true,
        });
      }
    }

    // run the job
    try {
      const response = await props.job(payload);
      return res.status(200).json({
        jobResponse: response,
        message: "Job finished executing",
        error: false,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err instanceof Error ? err.message : "Job failed to execute",
        error: true,
      });
    }
  };

  // only do this when running inside a node environment
  const wrappedHandler =
    typeof window === "undefined"
      ? verifySignature(handler, {
          currentSigningKey: config.qstashCurrentSigningKey,
          nextSigningKey: config.qstashNextSigningKey,
        })
      : handler;

  // sends data to Qstash
  const send = async (
    sendProps: ISendMessageProps<JP>
  ): Promise<{
    messageId: string;
  }> => {
    const { payload, qstashPublishOptions } = sendProps;

    const url = new URL(props.route, config.baseUrl).href;

    // if localhost dont use qstash
    if (url.startsWith("http://localhost")) {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return {
        messageId: "localhost",
      };
    }

    // send to qstash
    const qstashClient = new Client({
      token: config.qstashToken,
    });

    // enqueue the job
    const { messageId } = await qstashClient.publishJSON({
      url,
      body: payload,
      ...qstashPublishOptions,
    });

    return {
      messageId,
    };
  };

  return {
    handler: wrappedHandler,
    send,
  };
};
