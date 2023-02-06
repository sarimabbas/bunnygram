// send

import { BasicAdapter } from "../adapters";
import { IConfig, makeConfig } from "./config";
import { onReceive } from "./receive";
import { send } from "./send";

// ----- test

interface TestJP {
  boopy: string;
}

interface TestJR {
  doopy: string;
}

const config: IConfig<TestJP, TestJR> = {
  route: "/poop",
};

const c = makeConfig<TestJP, TestJR>({
  route: "/poop",
  adapter: BasicAdapter(),
});

onReceive({
  config: c,
  job: async ({ payload }) => {
    return {
      doopy: payload.boopy,
    };
  },
});

send({
  config: c,
  payload: {
    boopy: "ejf",
  },
});
