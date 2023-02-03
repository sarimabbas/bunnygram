import type { NextApiHandler } from "next";
import { z } from "zod";
import {
  IAdapter,
  IAdapterSendProps,
  IAdapterSendReturnValue,
} from "../adapters/common";
import { LocalhostAdapter } from "../adapters/localhost";
import { getCommonConfig, ICommonConfigProps } from "./config";
import { getRequestBody } from "../utilities/requests";
import { IErrorResponse, isBrowser } from "../utilities";

// generics key
// JP: JobPayload
// JR: JobResponse

/**
 * The input to the `Scheduler()` function
 */
interface ISchedulerProps<JP> {
  /**
   * the route it is reachable on
   */
  route: string;

  /**
   * an optional zod validator for the incoming payload
   */
  validator?: z.ZodSchema<JP>;

  /**
   * extra config
   */
  config?: ICommonConfigProps;

  /**
   * Which adapter to use
   */
  adapter?: IAdapter<JP>;
}

/**
 * The output of the `Scheduler()` function
 */
interface ISchedulerReturnValue<JP, JR> {
  /**
   * NextJS API handler that should be default exported inside `api` directory
   */
  onReceive: (
    props: IReceiveProps<JP, JR>
  ) => NextApiHandler<IReceiveMessageReturnValue<JR>>;

  /**
   * send a message to the scheduler. can be called in both client and
   * serverside contexts
   */
  send: (props: ISendMessageProps<JP>) => Promise<ISendMessageReturnValue>;
}

/**
 * The input of the `onReceive` function
 */
interface IReceiveProps<JP, JR> {
  job: IJob<JP, JR>;
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
 * IJob describes a job to be run
 * It takes in a payload of type JP and returns a JR
 */
type IJob<JP, JR> = (payload: JP) => Promise<JR>;

/**
 * The input to the `send()` function
 */
interface ISendMessageProps<JP> extends IAdapterSendProps<JP> {}

/**
 * The output of the `send()` function
 */
interface ISendMessageReturnValue extends IAdapterSendReturnValue {}

/**
 * `Scheduler` sets up both a `handler` that can be used inside a NextJS API route
 * and a `send` function to invoke it
 */
export const Scheduler = <JP, JR>(
  props: ISchedulerProps<JP>
): ISchedulerReturnValue<JP, JR> => {
  const { adapter = LocalhostAdapter() } = props;

  /**
   * `onReceive` returns a NextJS API handler that should be default exported inside `api` directory
   */
  const onReceive = <JP, JR>(
    receiveProps: IReceiveProps<JP, JR>
  ): NextApiHandler<IReceiveMessageReturnValue<JR>> => {
    // evaluating this code in the browser is a no-op
    if (isBrowser()) {
      return () => {};
    }

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
      // ----- check request method

      if (req.method !== "POST") {
        return res.status(405).json({
          message: "Only POST requests allowed",
          error: true,
        });
      }

      // ----- get the parsed and raw body from the request

      const { parsedBody, rawBody } = await getRequestBody(req);

      req.body = parsedBody;

      // ----- verify the request

      const verification = await adapter.verify({
        req,
        rawBody,
      });
      if (!verification.verified) {
        return res.status(500).json({
          message:
            verification.message ?? "Bunnygram: could not verify request",
          error: true,
        });
      }

      // ----- validate the payload

      const payload: JP = parsedBody;

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

      // ----- run the job

      try {
        const response = await receiveProps.job(payload);
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

    return handler;
  };

  /**
   * Sends message to receive handler using QStash as the intermediary. If on
   * `localhost`, sends message to handler via `fetch` directly. Can be used on
   * client-side if `NEXT_PUBLIC_QSTASH_TOKEN` env var is set, or server-side if
   * `QSTASH_TOKEN` env var is set. Can be used in both situations if
   * `qstashToken` is set in the `Scheduler` config.
   */
  const send = async (
    sendProps: ISendMessageProps<JP>
  ): Promise<ISendMessageReturnValue> => {
    const { payload } = sendProps;

    const config = getCommonConfig(props.config);
    const url = new URL(props.route, config.baseUrl).href;

    const response = await adapter.send({
      payload,
      url,
    });

    return response;
  };

  return {
    onReceive,
    send,
  };
};
