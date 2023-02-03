import type { NextApiHandler } from "next";
import { LocalhostAdapter } from "../adapters/localhost";
import { isBrowser } from "../utilities";
import { getRequestBody } from "../utilities/requests";
import { getCommonConfig } from "./config";
import {
  IReceiveMessageReturnValue,
  IReceiveProps,
  ISchedulerProps,
  ISchedulerReturnValue,
  ISendMessageProps,
  ISendMessageReturnValue,
} from "./types";

/**
 * `Scheduler` sets up both a `handler` that can be used inside a NextJS API route
 * and a `send` function to invoke it
 */
export const Scheduler = <JP, JR>(
  props: ISchedulerProps<JP>
): ISchedulerReturnValue<JP, JR> => {
  const { adapter = LocalhostAdapter() } = props;

  /**
   * `onReceive` returns a NextJS API handler that should be default exported
   * inside `api` directory
   */
  const onReceive = <JP, JR>(
    receiveProps: IReceiveProps<JP, JR>
  ): NextApiHandler<IReceiveMessageReturnValue<JR>> => {
    // evaluating this code in the browser is a no-op
    if (isBrowser()) {
      return () => {};
    }

    /**
     * Verifies and parses the incoming payload. Then, uses it to run the
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
   * Sends message to receive handler
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
