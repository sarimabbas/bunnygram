import { defineConfig } from "tsup";
import { $ } from "zx";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["esm"],
  dts: false,
  onSuccess: async () => {
    $`tsc`;
  },
});
