import { sendEmail } from "@/tasks/send-email";
import { onReceive } from "bunnygram";

export const POST = onReceive({
  config: sendEmail,
  job: async ({ payload }) => {
    console.log("hello ", payload.name);
    return {
      status: true,
    };
  },
});
