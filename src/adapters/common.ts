import { NextApiRequest } from "next";
import { IErrorResponse } from "../utilities";

// adapter

export interface IAdapter<JP> {
  // verifies the signature of the incoming request
  verify: IAdapterVerify;

  // Sends the payload to the backend
  send: IAdapterSend<JP>;
}

// adapter verify

export type IAdapterVerify = (
  props: IAdapterVerifyProps
) => Promise<IAdapterVerifyReturnValue>;

export interface IAdapterVerifyProps {
  req: NextApiRequest;
  rawBody: string;
}

export interface IAdapterVerifyReturnValue {
  verified: boolean;
  message?: string;
}

// adapter send

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
}

export interface IAdapterSendReturnValue extends IErrorResponse {
  messageId?: string;
}
