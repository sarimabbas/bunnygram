"use client";

import { sendEmail } from "@/tasks/send-email";
import { send } from "bunnygram";

const Page = () => {
  const runJob = async () => {
    const resp = await send({
      config: sendEmail,
      payload: {
        name: "sarim",
      },
    });
    console.log({ fromReceive: resp });
  };

  return (
    <div>
      <button onClick={runJob}>Run job</button>
    </div>
  );
};

export default Page;
