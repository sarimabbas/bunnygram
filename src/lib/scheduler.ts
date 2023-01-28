import { Client, PublishJsonRequest } from "@upstash/qstash";
import { verifySignature } from "@upstash/qstash/nextjs";
import type { NextApiHandler } from "next";
import { z } from "zod";
import { getApiRoutePath, getConfig, IGetConfigProps } from "./config";

type IJob<JobPayload, JobResponse> = (
  payload: JobPayload
) => Promise<JobResponse>;

type ISendMessage<JobPayload> = (
  payload: JobPayload,
  options?: ISendMessageOptions
) => Promise<void>;

interface ISchedulerOptions<JobPayload> {
  /**
   * The relative path to the receiveMessage API route. We try to infer, so this is optional
   * @example `/api/send-email`
   */
  receiveMessagePath?: string;

  /**
   * An optional zod validator for the payload
   */
  validator?: z.ZodSchema<JobPayload>;

  config?: IGetConfigProps;
}

interface ISchedulerReturnValue<JobPayload, JobResponse> {
  receiveMessage: NextApiHandler<IReceiveMessageReturnValue<JobResponse>>;
  sendMessage: ISendMessage<JobPayload>;
}

interface ISendMessageOptions {
  /**
   * The qstash publish options overrides
   */
  _qstashPublishOptions?: Omit<PublishJsonRequest, "body">;
}

interface IReceiveMessageReturnValue<R> {
  jobResponse: R;
  message: string;
  error: boolean;
}

export const Scheduler = <JobPayload, JobResponse>(
  job: IJob<JobPayload, JobResponse>,
  options?: ISchedulerOptions<JobPayload>
): ISchedulerReturnValue<JobPayload, JobResponse> => {
  // define these outside so that the functions below can close over it
  const config = getConfig(options?.config);

  const receiveMessagePath =
    options?.receiveMessagePath ?? getApiRoutePath(__filename);

  // receives data from Qstash
  const receiveMessage: NextApiHandler<
    IReceiveMessageReturnValue<JobResponse>
  > = async (req, res) => {
    const payload: JobPayload = req.body;

    if (options?.validator) {
      options.validator.parse(payload);
      // todo: try/catch and return response
    }

    // run the job
    const response = await job(payload);

    res.status(200).json({
      jobResponse: response,
      message: "Job finished executing",
      error: false,
    });
  };

  // sends data to Qstash
  const sendMessage: ISendMessage<JobPayload> = async (
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
    receiveMessage: verifySignature(receiveMessage),
    sendMessage,
  };
};

// const { receiveMessage, sendMessage } = Scheduler(
//   async ({ x }: { x: string }) => {
//     return {
//       id: "jekdkjhek",
//     };
//   },
//   {}
// );

// sendMessage(
//   {
//     x: "eljgel",
//   },
//   {
//     _qstashPublishOptions: {},
//   }
// );
