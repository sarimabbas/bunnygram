import type { NextRequest, NextResponse } from "next/server";
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

  return async (req: NextRequest): Promise<NextResponse> => {
    // dynamically import here to prevent importing in browser
    // (since the browser will still read this file top-down)
    const NextResponse = (await import("next/server")).NextResponse;

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

    if (validator) {
      const p = validator.safeParse(payload);
      if (!p.success) {
        console.error(p.error);
        return NextResponse.json(statusMessages["err-validate-payload"].msg, {
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
};
