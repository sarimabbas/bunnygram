import { NextApiRequest } from "next";

export const getBodyFromRawRequest = async (req: NextApiRequest) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const body = Buffer.concat(chunks).toString("utf-8");
  try {
    if (req.headers["content-type"] === "application/json") {
      req.body = JSON.parse(body);
    } else {
      req.body = body;
    }
  } catch {
    req.body = body;
  }
  return req.body;
};
