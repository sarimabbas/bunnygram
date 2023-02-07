import { sendEmail } from "@/tasks/send-email";
import { send } from "bunnygram";

export default function Home() {
  const runJob = async () => {
    const resp = await send({
      config: sendEmail,
      payload: {
        name: "sarim",
      },
    });
    console.log({ runJobResp: resp });
  };

  return (
    <main>
      <button onClick={runJob}>Run job</button>
    </main>
  );
}
