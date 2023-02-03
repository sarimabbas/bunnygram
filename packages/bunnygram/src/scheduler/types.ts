import { NextApiHandler, NextApiRequest } from "next";
import { z } from "zod";
import { IAdapter, IAdapterSendReturnValue } from "../adapters/common";
import { IErrorResponse } from "../utilities";
import { ICommonConfigProps } from "./config";

// generics key
// JP: JobPayload
// JR: JobResponse

/**
 * The input to the `Scheduler()` function
 */
export interface ISchedulerProps<JP> {
  /**
   * the route it is reachable on
   */
  route: string;

  /**
   * an optional zod validator for the incoming payload
   */
  validator?: z.ZodSchema<JP>;

  /**
   * extra config
   */
  config?: ICommonConfigProps;

  /**
   * Which adapter to use
   */
  adapter?: IAdapter<JP>;
}

/**
 * The output of the `Scheduler()` function
 */
export interface ISchedulerReturnValue<JP, JR> {
  /**
   * NextJS API handler that should be default exported inside `api` directory
   */
  onReceive: (
    props: IReceiveProps<JP, JR>
  ) => NextApiHandler<IReceiveMessageReturnValue<JR>>;

  /**
   * send a message to the scheduler. can be called in both client and
   * serverside contexts
   */
  send: (props: ISendMessageProps<JP>) => Promise<ISendMessageReturnValue>;
}

/**
 * The input of the `onReceive` function
 */
export interface IReceiveProps<JP, JR> {
  job: IJob<JP, JR>;
}

/**
 * The response structure of the API handler. This will be seen by QStash
 */
export interface IReceiveMessageReturnValue<JR> extends IErrorResponse {
  /**
   * The output of the job
   */
  jobResponse?: JR;
}

/**
 * IJob describes a job to be run
 * It takes in a payload of type JP and returns a JR
 */
export type IJob<JP, JR> = (props: IJobProps<JP>) => Promise<JR>;

interface IJobProps<JP> {
  /**
   * The received payload
   */
  payload: JP;

  /**
   * The full HTTP request
   */
  req: NextApiRequest;
}

/**
 * The input to the `send()` function
 */
export interface ISendMessageProps<JP> {
  /**
   * the payload that will eventually reach the receive handler
   */
  payload: JP;
}

/**
 * The output of the `send()` function
 */
export interface ISendMessageReturnValue extends IAdapterSendReturnValue {}
