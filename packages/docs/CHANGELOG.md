# docs

## 1.0.0

### Major Changes

- Breaking change:

  This version updates bunnygram to use Fetch API and work with Next.js 13.2 route handlers inside the `app` directory. Bunnygram will no longer work with `pages` directory API routes.

  Why this change was made:

  The ecosystem seems to be moving towards the new `app` directory, and this change simplifies Bunnygram's code significantly.

  How you should update your code:

  Please consult the docs for how to update your code. The minimum required Next.js version is 13.2. The code changes are minimal (mostly moving from `pages` to `app` directory). Please open an issue if you encounter buggy behavior. Thanks!
