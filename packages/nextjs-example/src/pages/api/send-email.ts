import { sendEmail } from "@/tasks/send-email";
import { writeFile } from "fs/promises";

export default sendEmail.onReceive({
  job: async (props) => {
    const { payload } = props;
    const { name } = payload;
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
