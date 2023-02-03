import { Scheduler } from "bunnygram";

interface JobPayload {
  name: string;
}

interface JobResponse {
  status: boolean;
}

export const sendEmail = Scheduler<JobPayload, JobResponse>({
  route: "/api/send-email",
});
