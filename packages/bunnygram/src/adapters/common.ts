import { NextApiRequest } from "next";
import { NextRequest } from "next/server";
import { IErrorResponse } from "../utilities";
import { IRuntime } from "../utilities/runtime/common";

// ----- adapter

export interface IAdapter<JP> {
  /**
   * Verifies the signature of the incoming request
   */
  verify: IAdapterVerify;

  /**
   * Sends the payload to the backend
   */
  send: IAdapterSend<JP>;
}

// ----- adapter verify

export type IAdapterVerify = (
  props: IAdapterVerifyProps
) => Promise<IAdapterVerifyReturnValue>;

export interface IAdapterVerifyProps {
  req: NextApiRequest | NextRequest;
  rawBody: string;
  runtime: IRuntime;
}

export interface IAdapterVerifyReturnValue {
  verified: boolean;
  message?: string;
}

// ----- adapter send

export type IAdapterSend<JP> = (
  props: IAdapterSendProps<JP>
) => Promise<IAdapterSendReturnValue>;

export interface IAdapterSendProps<JP> {
  /**
   * which URL to send request to
   */
  url: string;

  /**
   * the payload that will eventually reach the receive handler
   */
  payload: JP;

  /**
   * What runtime the send() is running under
   */
  runtime: IRuntime;
}

export interface IAdapterSendReturnValue extends IErrorResponse {
  messageId?: string;
}
