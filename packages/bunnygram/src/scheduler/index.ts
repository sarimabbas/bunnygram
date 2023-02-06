import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { BasicAdapter, IAdapterSendReturnValue } from "../adapters";
import {
  getBaseUrl,
  getRuntime,
  IConfig,
  makeConfig,
} from "../scheduler/config";
import { statusMessages } from "../scheduler/messages";
import { getFetchRequestBody } from "../utilities/http/edge";
import { getNodeRequestBody } from "../utilities/http/node";
import { IHandler, IReceiveProps, IReceiveReturnValue } from "./types";

const onReceive = <JP, JR>(props: IReceiveProps<JP, JR>): IHandler<JR> => {
  const { job, config } = props;
  const { adapter = BasicAdapter(), validator } = config;
  const runtime = getRuntime();

  if (runtime === "edge") {
    return async (req: NextRequest): Promise<NextResponse> => {
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
  }

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

// send

interface ISendProps<JP, JR> {
  config: IConfig<JP, JR>;
  payload: JP;
}

const send = async <JP, JR>(
  props: ISendProps<JP, JR>
): Promise<IAdapterSendReturnValue> => {
  const { payload, config } = props;
  const {
    route,
    adapter = BasicAdapter(),
    baseUrl = getBaseUrl(),
    validator,
  } = config;
  const runtime = getRuntime();

  const url = new URL(route, baseUrl).href;

  if (validator) {
    const p = validator.safeParse(payload);
    if (!p.success) {
      console.error(p.error);
      return {
        error: true,
        message: "Could not validate payload",
      };
    }
  }

  const response = await adapter.send({
    payload,
    url,
    runtime,
  });

  return response;
};

// ----- test

interface TestJP {
  boopy: string;
}

interface TestJR {
  doopy: string;
}

const config: IConfig<TestJP, TestJR> = {
  route: "/poop",
};

const c = makeConfig<TestJP, TestJR>({
  route: "/poop",
  adapter: BasicAdapter(),
});

onReceive({
  config: c,
  job: async ({ payload }) => {
    return {
      doopy: payload.boopy,
    };
  },
});

send({
  config: c,
  payload: {
    boopy: "ejf",
  },
});
