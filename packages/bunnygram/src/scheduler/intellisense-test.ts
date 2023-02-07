// send

import { BasicAdapter } from "../adapters";
import { IConfig, makeConfig } from "./config";
import { onReceive } from "./receive";
import { send } from "./send";

// ----- test

interface TestJP {
  hello: string;
}

interface TestJR {
  world: string;
}

const config: IConfig<TestJP, TestJR> = {
  route: "/example",
};

const c = makeConfig<TestJP, TestJR>({
  route: "/example",
  adapter: BasicAdapter(),
});

onReceive({
  config: c,
  job: async ({ payload }) => {
    return {
      world: payload.hello,
    };
  },
});

send({
  config: c,
  payload: {
    hello: "goodbye",
  },
});
