import { NextApiRequest } from "next";
import type { IncomingHttpHeaders } from "node:http";
import type { Readable } from "node:stream";

export const getNodeRequestBody = async (req: NextApiRequest) => {
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");
  const parsedBody = parseRawBody(rawBody, req.headers);
  return {
    rawBody,
    parsedBody,
  };
};

const buffer = async (readable: Readable) => {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const parseRawBody = (rawBody: string, headers: IncomingHttpHeaders) => {
  try {
    if (headers["content-type"] === "application/json") {
      return JSON.parse(rawBody);
    } else {
      return {};
    }
  } catch {
    return {};
  }
};
