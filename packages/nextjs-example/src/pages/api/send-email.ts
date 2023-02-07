import { sendEmail } from "@/tasks/send-email";
import { onReceive } from "bunnygram";

export default onReceive({
  config: sendEmail,
  job: async ({ payload }) => {
    console.log("hello ", payload.name);
    return {
      status: true,
    };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};
