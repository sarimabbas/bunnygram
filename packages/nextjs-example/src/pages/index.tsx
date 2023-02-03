import { sendEmail } from "@/tasks/send-email";

export default function Home() {
  const runJob = async () => {
    const resp = await sendEmail.send({
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
