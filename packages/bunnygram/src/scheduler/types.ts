import type { NextApiRequest, NextApiResponse } from "next";
import type { NextRequest, NextResponse } from "next/server";
import { IConfig } from "./config";

export interface IReceiveProps<JP, JR> {
  config: IConfig<JP, JR>;
  job: (props: IJobProps<JP>) => Promise<JR>;
}

export interface IReceiveReturnValue<JR> {
  jobResponse?: JR;
  error: boolean;
  message: string;
}

// job

export interface IJobProps<JP> {
  payload: JP;
  req: NextRequest | NextApiRequest;
}

// handler

export type IHandler<JR> =
  // edge
  | ((req: NextRequest) => Promise<NextResponse>)
  // node
  | ((
      req: NextApiRequest,
      res: NextApiResponse<IReceiveReturnValue<JR>>
    ) => Promise<unknown> | unknown);
