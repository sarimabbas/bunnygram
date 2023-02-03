# Adapters

- [Adapters](#adapters)
  - [Runtimes](#runtimes)

## Runtimes

We want to ensure that if a user creates a `Scheduler` with your adapter, and then uses `Scheduler.send()` in the browser, they do not get an error. This should be simple enough to do by guarding your runtime-specific logic. For example, you can use the `isBrowser()` utility function to guard your `verify` function, which may need to utilize Node-only APIs for request verification:

```ts
import { isBrowser } from "../../utils";

return {
  verify: async () => {
    // no-op
    if (isBrowser()) {
      return {
        verified: true,
      };
    }

    // ... rest of your code below
  },
};
```
