import { PublishJsonRequest } from "@upstash/qstash";
import type { NextApiHandler } from "next";
import { z } from "zod";
import { IGetConfigProps } from "./config";
type IJob<TJobPayload, TJobResponse> = (payload: TJobPayload) => Promise<TJobResponse>;
type ISendMessage<TJobPayload> = (payload: TJobPayload, options?: ISendMessageOptions) => Promise<void>;
interface ISchedulerOptions<TJobPayload> {
    /**
     * The relative path to the receiveMessage API route. We try to infer, so this is optional
     * @example `/api/send-email`
     */
    receiveMessagePath?: string;
    /**
     * An optional zod validator for the payload
     */
    validator?: z.ZodSchema<TJobPayload>;
    config?: IGetConfigProps;
}
interface ISchedulerReturnValue<TJobPayload, TJobResponse> {
    receiveMessage: NextApiHandler<IReceiveMessageReturnValue<TJobResponse> | null>;
    sendMessage: ISendMessage<TJobPayload>;
}
interface ISendMessageOptions {
    /**
     * The qstash publish options overrides
     */
    _qstashPublishOptions?: Omit<PublishJsonRequest, "body">;
}
interface IReceiveMessageReturnValue<TJobResponse> {
    jobResponse?: TJobResponse;
    message: string;
    error: boolean;
}
export declare const Scheduler: <TJobPayload, TJobResponse>(job: IJob<TJobPayload, TJobResponse>, options?: ISchedulerOptions<TJobPayload> | undefined) => ISchedulerReturnValue<TJobPayload, TJobResponse>;
export {};
//# sourceMappingURL=scheduler.d.ts.map