import { IReceiveMessageReturnValue } from "./types";

export const statusMessages = {
  "err-post-only": {
    msg: {
      message: "Only POST requests allowed",
      error: true,
    },
    httpStatusCode: 405,
  },
  "err-adapter-verify": {
    msg: {
      message: "Adapter could not verify request",
      error: true,
    },
    httpStatusCode: 500,
  },
  "err-validate-payload": {
    msg: {
      message: "Failed to validate request payload",
      error: true,
    },
    httpStatusCode: 500,
  },
  "err-job-run": {
    msg: {
      message: "Job failed to run",
      error: true,
    },
    httpStatusCode: 500,
  },
  "success-job-run": {
    msg: {
      message: "Job finishing running",
      error: false,
    },
    httpStatusCode: 200,
  },
} satisfies Record<
  string,
  {
    msg: IReceiveMessageReturnValue<any>;
    httpStatusCode: number;
  }
>;
