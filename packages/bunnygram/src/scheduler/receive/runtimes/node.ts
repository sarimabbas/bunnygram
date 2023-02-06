import type { NextApiRequest, NextApiResponse } from "next";
import { BasicAdapter } from "../../../adapters";
import { getNodeRequestBody } from "../../../utilities/http/node";
import { getRuntime } from "../../config";
import { statusMessages } from "../../messages";
import type { IHandler, IReceiveProps, IReceiveReturnValue } from "../types";

export const onReceiveNode = <JP, JR>(
  props: IReceiveProps<JP, JR>
): IHandler<JR> => {
  const { job, config } = props;
  const { adapter = BasicAdapter(), validator } = config;
  const runtime = getRuntime();

  // runtime === node
  return async (
    req: NextApiRequest,
    res: NextApiResponse<IReceiveReturnValue<JR>>
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

    if (validator) {
      try {
        validator.parse(payload);
      } catch (err) {
        console.error(err);
        return res.status(statusMessages["err-post-only"].httpStatusCode).json({
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
      const jobResponse = await job({
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
};
