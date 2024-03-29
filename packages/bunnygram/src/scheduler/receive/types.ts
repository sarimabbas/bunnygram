import type { IConfig } from "../config";

export interface IReceiveProps<JP, JR> {
  config: IConfig<JP, JR>;
  job: (props: IJobProps<JP>) => Promise<JR>;
}

export interface IReceiveReturnValue<JR> {
  jobResponse?: JR;
  error: boolean;
  message: string;
}

export interface IJobProps<JP> {
  payload: JP;
  req: Request;
}

export type IHandler<JR> = (req: Request) => Promise<Response>;
