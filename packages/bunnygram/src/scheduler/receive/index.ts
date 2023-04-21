import { BasicAdapter } from "../../adapters";
import { getFetchRequestBody } from "../../utilities/http";
import { getRuntime } from "../config";
import { statusMessages } from "../messages";
import type { IHandler, IReceiveProps } from "./types";

export const onReceive = <JP, JR>(
  props: IReceiveProps<JP, JR>
): IHandler<JR> => {
  const { job, config } = props;
  const { adapter = BasicAdapter(), validator } = config;
  const runtime = getRuntime();

  return async (req: Request): Promise<Response> => {
    // ----- check request method

    if (req.method !== "POST") {
      return resJson("err-post-only");
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
      return resJson("err-adapter-verify");
    }

    // ----- validate the payload

    let payload: JP = parsedBody!;

    if (validator) {
      const p = validator.safeParse(payload);
      if (!p.success) {
        console.error(p.error);
        return resJson("err-validate-payload");
      }
    }

    // ----- run the job

    try {
      const jobResponse = await job({
        payload,
        req,
      });
      return resJson("success-job-run", jobResponse);
    } catch (err) {
      console.error(err);
      return resJson("err-job-run");
    }
  };
};

const resJson = (status: keyof typeof statusMessages, body?: any) => {
  return new Response(
    JSON.stringify(
      {
        ...(body ? { jobResponse: body } : {}),
        ...statusMessages[status].msg,
      },
      null,
      2
    ),
    {
      status: statusMessages[status].httpStatusCode,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
