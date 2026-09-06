# Preserved documentation

Bunnygram is no longer maintained. https://bunnygram.lil.run preserves the original
documentation and cover image as static files. No scheduler, example application,
QStash service, runtime secrets, or server bundle is deployed.

With Node 22 and Corepack:

```sh
corepack pnpm@8.6.7 install --frozen-lockfile
corepack pnpm@8.6.7 build:docs
npx wrangler@4.129.0 deploy
```

The original Next.js 13.3 build uses `next export`. Cloudflare serves only
`packages/docs/out`, with the custom domain defined in `wrangler.jsonc`.
Deployments are manual; no Git auto-deployment is configured by this migration.

Before deleting the old Vercel `bunnygram-docs` project, verify the homepage,
configuration, all three adapter guides, FAQ, cover image, and docs search on the
new domain. Old Vercel-owned URLs cannot be retained after project deletion.
Any existing custom hostname such as `bunnygram.doom.sh` needs a separate redirect
or retirement decision. The `bunnygram-nextjs-example` project is not migrated.
