export const getFetchRequestBody = async <T>(
  req: Request
): Promise<{
  parsedBody: T | undefined;
  rawBody: string;
}> => {
  // clone the req so we don't consume the body
  const clonedRequestForJson = req.clone();
  const clonedRequestForText = req.clone();

  // parse as json
  let parsedBody: T | undefined = undefined;
  if (clonedRequestForJson.headers.get("content-type") === "application/json") {
    parsedBody = (await clonedRequestForJson.json()) as T;
  }

  // parse as text
  const rawBody = await clonedRequestForText.text();
  return {
    parsedBody,
    rawBody,
  };
};
