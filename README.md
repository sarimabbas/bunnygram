# Bunnygram

- [Bunnygram](#bunnygram)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Requirements](#requirements)
  - [Get started](#get-started)
  - [How it works](#how-it-works)

## Introduction

`bunnygram` is a wrapper around QStash, an HTTP message queue and task scheduler. With QStash, you get retries, delays, cron, content deduplication and more. You can read more about QStash here: <https://docs.upstash.com/qstash>.

`bunnygram` reduces boilerplate and makes it easier to use QStash in your Next.js apps. It borrows from patterns introduced by a similar library [Quirrel](https://github.com/quirrel-dev/quirrel), which made adding job queues to Next.js more developer friendly.

## Installation

```
pnpm add bunnygram
```

You can also use `npm` or `yarn` etc.

## Requirements

`bunnygram` wraps QStash, which requires the following environment variables to be set:

- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `QSTASH_TOKEN` if you intend to use `send` from the server (e.g. other `API routes`, `getServerSideProps` or React Server components), or `NEXT_PUBLIC_QSTASH_TOKEN` if you intend to use `send` from the client (e.g. React client components). More about `send` a bit further below.

You can also pass this configuration to `bunnygram` via:

```ts
const scheduler = Scheduler({
  config: {
    // pass config here
    // if you're just testing on localhost, you also need to supply the baseUrl here:
    baseUrl: "http://localhost:<PORT>",
  },
});
```

You can learn more about the `Scheduler` function below.

## Get started

Start by creating an API route which will run your job in the background.

```ts
// pages/api/send-email.ts

interface JobPayload {
  emailAddress: string;
  emailBody: string;
}

interface JobResponse {
  status: boolean;
}

//      👇 notice the const export
export const sendEmail = Scheduler<JobPayload, JobResponse>({
  // the path this API route will be accessible on
  route: "/api/send-email",
  // the job to run when QStash comes knocking
  job: async ({ emailAddress, emailBody }) => {
    await mailchimp.send({
      // ... use the payload
    });
    return {
      status: true,
    };
  },
  config: {
    // ... optional config
    // if you're just testing on localhost, you also need to supply the baseUrl here:
    baseUrl: "http://localhost:<PORT>",
  },
});

// this will be used by Next.js to receive HTTP requests
export default sendEmail.handler;

// we need to disable body parser to let QStash do its thing and verify the raw request
// you can read more here https://nextjs.org/docs/api-routes/request-helpers
export const config = {
  api: {
    bodyParser: false,
  },
};
```

Now we can send a message to the handler from anywhere else inside our Next.js app:

```tsx
// src/pages/index.tsx

import { sendEmail } from "./api/sendEmail";

export default function Home() {
  const runJob = async () => {
    await sendEmail.send({
      payload: {
        // 👇 you'll get autocomplete here
        emailAddress: "hello@gmail.com",
        emailBody: "Hello world!",
      },
      qstashOptions: {
        // ... set delays, cron, deduplication etc.
      },
    });
  };

  return <button onClick={runJob}>Send email</button>;
}
```

## How it works

Conceptually, `bunnygram` is straighforward. It instantiates a Next.js API handler and another function to invoke it. It abstracts away some of the boilerplate regarding parsing request bodies, providing type safety and so on.

The flow of data is as follows. The `send` function (introduced previously above) sends a `POST` request with your payload to QStash. QStash will then forward that payload by sending another `POST` request to the API `handler`. The `handler` will receive the data and run your job with it.

What might be a little confusing is how server-side Next.js API `handler` code and its client code are colocated in the same file. But that is what makes shared typing possible in order to improve DX.
