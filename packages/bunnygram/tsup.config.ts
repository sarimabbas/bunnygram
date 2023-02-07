import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["esm"],
  dts: true,
  // for some strange reason, intellisense stops working when importing
  // bunnygram in other packages, so disabling tsc dts and using the inbuilt one
  // for now. We lose out on declaration maps but its no big deal onSuccess:
  // async () => { $`tsc`;
  // },
});
