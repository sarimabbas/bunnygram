import type { NextApiHandler, PageConfig, ServerRuntime } from "next";
import { NextResponse } from "next/server";
import { BasicAdapter } from "../adapters/basic";
import type { IEdgeApiHandler, IHandler } from "../utilities/handler";
import { getFetchRequestBody } from "../utilities/http/edge";
import { getNodeRequestBody } from "../utilities/http/node";
import { getCommonConfig } from "./config";
import { statusMessages } from "./messages";
import type {
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
  const { adapter = BasicAdapter(), config } = props;
  const commonConfig = getCommonConfig(config);
  const { runtime, baseUrl } = commonConfig;

  /**
   * `onReceive` returns a NextJS API handler that should be default exported
   * inside `api` directory
   */
  const onReceive = <JP, JR>(
    receiveProps: IReceiveProps<JP, JR>
  ): IHandler<IReceiveMessageReturnValue<JR>> => {
    // evaluating this code in the browser is a no-op
    if (runtime === "browser") {
      return () => {};
    }

    if (runtime === "edge") {
      const edgeHandler: IEdgeApiHandler = async (req) => {
        // ----- check request method

        if (req.method !== "POST") {
          return NextResponse.json(statusMessages["err-post-only"].msg, {
            status: statusMessages["err-post-only"].httpStatusCode,
          });
        }

        // ----- get the parsed and raw body from the request, while leaving the
        // original unchanged
        const { parsedBody, rawBody } = await getFetchRequestBody<JP>(req);

        // ----- verify the request

        const verification = await adapter.verify({
          req,
          rawBody,
          runtime,
        });

        if (!verification.verified) {
          return NextResponse.json(statusMessages["err-adapter-verify"].msg, {
            status: statusMessages["err-adapter-verify"].httpStatusCode,
          });
        }

        // ----- validate the payload

        let payload: JP = parsedBody!;

        if (props?.validator) {
          const p = props.validator.safeParse(payload);
          if (!p.success) {
            console.error(p.error);
            return NextResponse.json(
              statusMessages["err-validate-payload"].msg,
              {
                status: statusMessages["err-validate-payload"].httpStatusCode,
              }
            );
          }
        }

        // ----- run the job

        try {
          const jobResponse = await receiveProps.job({
            payload,
            req,
          });
          return NextResponse.json(
            {
              jobResponse,
              ...statusMessages["success-job-run"].msg,
            },
            {
              status: statusMessages["success-job-run"].httpStatusCode,
            }
          );
        } catch (err) {
          console.error(err);
          return NextResponse.json(statusMessages["err-job-run"].msg, {
            status: statusMessages["err-job-run"].httpStatusCode,
          });
        }
      };

      return edgeHandler;
    }

    const nodeHandler: NextApiHandler<IReceiveMessageReturnValue<JR>> = async (
      req,
      res
    ) => {
      // ----- check request method

      if (req.method !== "POST") {
        return res
          .status(statusMessages["err-post-only"].httpStatusCode)
          .json(statusMessages["err-post-only"].msg);
      }

      // ----- get the parsed and raw body from the request

      const { parsedBody, rawBody } = await getNodeRequestBody(req);

      req.body = parsedBody;

      // ----- verify the request

      const verification = await adapter.verify({
        req,
        rawBody,
        runtime,
      });

      if (!verification.verified) {
        return res
          .status(statusMessages["err-post-only"].httpStatusCode)
          .json(statusMessages["err-post-only"].msg);
      }

      // ----- validate the payload

      const payload: JP = parsedBody;

      if (props?.validator) {
        try {
          props.validator.parse(payload);
        } catch (err) {
          console.error(err);
          return res
            .status(statusMessages["err-post-only"].httpStatusCode)
            .json({
              message:
                err instanceof Error
                  ? err.message
                  : statusMessages["err-post-only"].msg.message,
              error: true,
            });
        }
      }

      // ----- run the job

      try {
        const jobResponse = await receiveProps.job({
          payload,
          req,
        });
        return res
          .status(statusMessages["success-job-run"].httpStatusCode)
          .json({ jobResponse, ...statusMessages["success-job-run"].msg });
      } catch (err) {
        console.error(err);
        return res.status(statusMessages["err-job-run"].httpStatusCode).json({
          message:
            err instanceof Error
              ? err.message
              : statusMessages["err-job-run"].msg.message,
          error: true,
        });
      }
    };

    return nodeHandler;
  };

  /**
   * Sends message to receive handler
   */
  const send = async (
    sendProps: ISendMessageProps<JP>
  ): Promise<ISendMessageReturnValue> => {
    const { payload } = sendProps;

    const url = new URL(props.route, baseUrl).href;

    const response = await adapter.send({
      payload,
      url,
      runtime,
    });

    return response;
  };

  /**
   * Exports a config for Next.js to detect
   */
  const onReceiveConfig: PageConfig = {
    runtime: runtime as ServerRuntime,
    api: {
      bodyParser: false,
    },
  };

  return {
    onReceive,
    onReceiveConfig,
    send,
  };
};
