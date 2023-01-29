import { Client, PublishJsonRequest } from "@upstash/qstash";
import { verifySignature } from "@upstash/qstash/nextjs";
import type { NextApiHandler } from "next";
import { z } from "zod";
import { getApiRoutePath, getConfig, IGetConfigProps } from "./config";

type IJob<TJobPayload, TJobResponse> = (
  payload: TJobPayload
) => Promise<TJobResponse>;

type ISendMessage<TJobPayload> = (
  payload: TJobPayload,
  options?: ISendMessageOptions
) => Promise<void>;

interface ISchedulerOptions<TJobPayload> {
  /**
   * The relative path to the receiveMessage API route. We try to infer, so this is optional
   * @example `/api/send-email`
   */
  receiveMessagePath?: string;

  /**
   * An optional zod validator for the payload
   */
  validator?: z.ZodSchema<TJobPayload>;

  config?: IGetConfigProps;
}

interface ISchedulerReturnValue<TJobPayload, TJobResponse> {
  receiveMessage: NextApiHandler<IReceiveMessageReturnValue<TJobResponse> | null>;
  sendMessage: ISendMessage<TJobPayload>;
}

interface ISendMessageOptions {
  /**
   * The qstash publish options overrides
   */
  _qstashPublishOptions?: Omit<PublishJsonRequest, "body">;
}

interface IReceiveMessageReturnValue<TJobResponse> {
  jobResponse?: TJobResponse;
  message: string;
  error: boolean;
}

export const Scheduler = <TJobPayload, TJobResponse>(
  job: IJob<TJobPayload, TJobResponse>,
  options?: ISchedulerOptions<TJobPayload>
): ISchedulerReturnValue<TJobPayload, TJobResponse> => {
  // define these outside so that the functions below can close over it
  const config = getConfig(options?.config);

  const receiveMessagePath =
    options?.receiveMessagePath ?? getApiRoutePath(__filename);

  // receives data from Qstash
  const receiveMessage: NextApiHandler<
    IReceiveMessageReturnValue<TJobResponse>
  > = async (req, res) => {
    const payload: TJobPayload = req.body;

    if (options?.validator) {
      try {
        options.validator.parse(payload);
      } catch (err) {
        console.error(err);
        res.status(500).json({
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
      const response = await job(payload);
      res.status(200).json({
        jobResponse: response,
        message: "Job finished executing",
        error: false,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: err instanceof Error ? err.message : "Job failed to execute",
        error: true,
      });
    }
  };

  // sends data to Qstash
  const sendMessage: ISendMessage<TJobPayload> = async (
    payload,
    options = {}
  ) => {
    const { _qstashPublishOptions } = options;

    const url = new URL(receiveMessagePath, config.baseUrl).href;

    // if localhost dont use qstash
    if (url.startsWith("http://localhost")) {
      const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log({ resp });
      return;
    }

    // send to qstash
    const qstashClient = new Client({
      token: config.qstashToken,
    });

    // enqueue the job
    await qstashClient.publishJSON({
      url,
      body: payload,
      ..._qstashPublishOptions,
    });
  };

  return {
    receiveMessage: verifySignature(receiveMessage, {
      currentSigningKey: config.qstashCurrentSigningKey,
      nextSigningKey: config.qstashNextSigningKey,
    }),
    sendMessage,
  };
};
