import { z } from "zod";
export declare const ZRequiredConfig: z.ZodObject<{
    qstashToken: z.ZodString;
    qstashCurrentSigningKey: z.ZodString;
    qstashNextSigningKey: z.ZodString;
    baseUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    qstashToken: string;
    qstashCurrentSigningKey: string;
    qstashNextSigningKey: string;
    baseUrl: string;
}, {
    qstashToken: string;
    qstashCurrentSigningKey: string;
    qstashNextSigningKey: string;
    baseUrl: string;
}>;
export type IGetConfigProps = Partial<z.infer<typeof ZRequiredConfig>>;
export declare const getConfig: (props?: IGetConfigProps) => {
    qstashToken: string;
    qstashCurrentSigningKey: string;
    qstashNextSigningKey: string;
    baseUrl: string;
};
export declare const getBaseUrl: (props?: IGetConfigProps) => string | undefined;
export declare const getToken: (props?: IGetConfigProps) => string | undefined;
export declare const getCurrentSigningKey: (props?: IGetConfigProps) => string | undefined;
export declare const getNextSigningKey: (props?: IGetConfigProps) => string | undefined;
export declare const getApiRoutePath: (filename: string) => string;
//# sourceMappingURL=config.d.ts.map