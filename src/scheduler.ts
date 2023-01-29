import { Client, PublishJsonRequest } from "@upstash/qstash";
import { verifySignature } from "@upstash/qstash/nextjs";
import type { NextApiHandler } from "next";
import { z } from "zod";
import { getHandlerConfig, getSendConfig, IGetConfigProps } from "./config";
import { getBodyFromRawRequest, IErrorResponse } from "./utils";

// generics key
// JP: JobPayload
// JR: JobResponse

/**
 * IJob describes a job to be run
 * It takes in a payload of type JP and returns a JR
 */
type IJob<JP, JR> = (payload: JP) => Promise<JR>;

/**
 * The input to the `Scheduler()` function
 */
interface ISchedulerProps<JP, JR> {
  /**
   * the route it is reachable on
   */
  route: string;

  /**
   * the job to run
   */
  job: IJob<JP, JR>;

  /**
   * an optional zod validator for the incoming payload
   */
  validator?: z.ZodSchema<JP>;

  /**
   * extra config
   */
  config?: IGetConfigProps;
}

/**
 * The output of the `Scheduler()` function
 */
interface ISchedulerReturnValue<JP, JR> {
  /**
   * NextJS API handler that should be default exported inside `api` directory
   */
  getHandler: () => NextApiHandler<IReceiveMessageReturnValue<JR>>;

  /**
   * send a message to the scheduler. can be called in both client and
   * serverside contexts
   */
  send: (props: ISendMessageProps<JP>) => Promise<ISendMessageReturnValue>;
}

/**
 * The input to the `send()` function
 */
interface ISendMessageProps<JP> {
  /**
   * the payload that will eventually reach the handler
   */
  payload: JP;

  /**
   * override the qstash.publishJSON method
   */
  qstashOptions?: Omit<PublishJsonRequest, "body">;
}

/**
 * The output of the `send()` function
 */
interface ISendMessageReturnValue extends IErrorResponse {
  messageId?: string;
}

/**
 * The response structure of the API handler. This will be seen by QStash
 */
interface IReceiveMessageReturnValue<JR> extends IErrorResponse {
  /**
   * The output of the job
   */
  jobResponse?: JR;
}

/**
 * `Scheduler` sets up both a `handler` that can be used inside a NextJS API route
 * and a `send` function to invoke it
 */
export const Scheduler = <JP, JR>(
  props: ISchedulerProps<JP, JR>
): ISchedulerReturnValue<JP, JR> => {
  /**
   * `getHandler` returns a NextJS API handler that should be default exported inside `api` directory
   */
  const getHandler = (): NextApiHandler<IReceiveMessageReturnValue<JR>> => {
    const config = getHandlerConfig(props.config);
    const isLocalhost = config.baseUrl.startsWith("http://localhost");

    /**
     * Receives incoming payload from QStash (or directly from `send()` via
     * `fetch` if on `localhost`). Then, parses the payload and uses it to run the
     * user-defined job.
     * @param req - HTTP request object
     * @param res - HTTP response object
     * @returns a NextJS API handler
     */
    const handler: NextApiHandler<IReceiveMessageReturnValue<JR>> = async (
      req,
      res
    ) => {
      if (req.method !== "POST") {
        return res.status(405).json({
          message: "Only POST requests allowed",
          error: true,
        });
      }

      // when localhost, verifySignature won't wrap the handler, but bodyParsing
      // is disabled, so we need to parse ourselves. When not localhost,
      // verifySignature wraps the handler and also modifies the req to add body,
      // so we don't need to parse
      const payload: JP = isLocalhost
        ? await getBodyFromRawRequest(req)
        : req.body;

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
    // this is because verifySignature relies on crypto
    const wrappedHandler =
      typeof window === "undefined" && !isLocalhost
        ? verifySignature(handler, {
            currentSigningKey: config.qstashCurrentSigningKey,
            nextSigningKey: config.qstashNextSigningKey,
          })
        : handler;

    return wrappedHandler;
  };

  /**
   * Sends message to `handler` using QStash as the intermediary. If on
   * `localhost`, sends message to handler via `fetch` directly. Can be used on
   * client-side if `NEXT_PUBLIC_QSTASH_TOKEN` env var is set, or server-side if
   * `QSTASH_TOKEN` env var is set. Can be used in both situations if
   * `qstashToken` is set in the `Scheduler` config.
   */
  const send = async (
    sendProps: ISendMessageProps<JP>
  ): Promise<ISendMessageReturnValue> => {
    const { payload, qstashOptions } = sendProps;

    const config = getSendConfig(props.config);
    const isLocalhost = config.baseUrl.startsWith("http://localhost");
    const url = new URL(props.route, config.baseUrl).href;

    // if localhost dont use qstash
    if (isLocalhost) {
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
          messageId: "localhost",
        };
      } catch (err) {
        console.error(err);
        return {
          error: true,
          message: "POST to localhost failed",
        };
      }
    }

    // send to qstash
    const qstashClient = new Client({
      token: config.qstashToken,
    });

    // enqueue the job
    const { messageId } = await qstashClient.publishJSON({
      url,
      body: payload,
      ...qstashOptions,
    });

    return {
      error: false,
      message: "POST to QStash succeeded",
      messageId,
    };
  };

  return {
    getHandler,
    send,
  };
};
