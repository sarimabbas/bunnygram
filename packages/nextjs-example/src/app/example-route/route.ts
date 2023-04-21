import { sendEmail } from "@/tasks/send-email";
import { onReceive } from "bunnygram";

export const POST = onReceive({
  config: sendEmail,
  job: async (props) => {
    console.log({ fromSend: props });
    return {
      status: true,
    };
  },
});
