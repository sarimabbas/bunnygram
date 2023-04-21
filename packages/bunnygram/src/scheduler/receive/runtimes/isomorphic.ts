import { Response } from "@whatwg-node/fetch";
import { BasicAdapter } from "../../../adapters";
import { getFetchRequestBody } from "../../../utilities/http";
import { getRuntime } from "../../config";
import { statusMessages } from "../../messages";
import type { IHandler, IReceiveProps } from "../types";

// route handlers run in edge and node
// https://beta.nextjs.org/docs/routing/route-handlers#edge-and-nodejs-runtimes
export const makeOnReceiveRouteHandler = <JP, JR>(
  props: IReceiveProps<JP, JR>
): IHandler<JR> => {
  const { job, config } = props;
  const { adapter = BasicAdapter(), validator } = config;
  const runtime = getRuntime();

  return async (req: Request): Promise<Response> => {
    // ----- check request method

    if (req.method !== "POST") {
      return Response.json(statusMessages["err-post-only"].msg, {
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
      return Response.json(statusMessages["err-adapter-verify"].msg, {
        status: statusMessages["err-adapter-verify"].httpStatusCode,
      });
    }

    // ----- validate the payload

    let payload: JP = parsedBody!;

    if (validator) {
      const p = validator.safeParse(payload);
      if (!p.success) {
        console.error(p.error);
        return Response.json(statusMessages["err-validate-payload"].msg, {
          status: statusMessages["err-validate-payload"].httpStatusCode,
        });
      }
    }

    // ----- run the job

    try {
      const jobResponse = await job({
        payload,
        req,
      });
      return Response.json(
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
      return Response.json(statusMessages["err-job-run"].msg, {
        status: statusMessages["err-job-run"].httpStatusCode,
      });
    }
  };
};
