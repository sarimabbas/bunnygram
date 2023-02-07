import { makeConfig, QStashAdapter } from "bunnygram";

interface JobPayload {
  name: string;
}

interface JobResponse {
  status: boolean;
}

export const sendEmail = makeConfig<JobPayload, JobResponse>({
  route: "/api/send-email",
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : undefined,
  adapter: QStashAdapter({}),
});
