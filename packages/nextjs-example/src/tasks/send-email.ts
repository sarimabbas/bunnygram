import { BasicAdapter, makeConfig } from "bunnygram";

interface JobPayload {
  name: string;
}

interface JobResponse {
  status: boolean;
}

export const sendEmail = makeConfig<JobPayload, JobResponse>({
  route: "/example-route",
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : undefined,
  adapter: BasicAdapter(),
});
