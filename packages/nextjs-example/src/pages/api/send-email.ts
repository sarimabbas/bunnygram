import { sendEmail } from "@/tasks/send-email";
import { writeFile } from "fs/promises";

export default sendEmail.onReceive({
  job: async ({ name }) => {
    writeFile("./tmp.txt", `${name}`);
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
