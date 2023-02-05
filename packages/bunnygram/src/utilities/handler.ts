import { NextApiHandler } from "next";
import { NextRequest, NextResponse } from "next/server";

export type IEdgeApiHandler = (req: NextRequest) => Promise<NextResponse>;

export type IHandler<R> =
  // nodejs handler
  | NextApiHandler<R>
  // edge handler
  | IEdgeApiHandler;
