# Bunnygram

## Define env vars

Have these in Vercel and/or .env.local

- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `QSTASH_TOKEN` if you intend to use `enqueue` from the server (e.g. other `API routes`, `getServerSideProps` or React Server components), or `NEXT_PUBLIC_QSTASH_TOKEN` if you intend to use `enqueue` from the client (e.g. React client components).
