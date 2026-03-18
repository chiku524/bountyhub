# Migration helpers

## If 0016 fails with "duplicate column name: github_id"

The remote D1 already had the GitHub columns (e.g. from a partial apply). Mark 0016 as applied so later migrations can run:

```bash
npx wrangler d1 execute bountyhub-db --remote --config wrangler.workers.toml --file=scripts/mark-migration-0016-applied.sql
```

Then run migrations again:

```bash
npx wrangler d1 migrations apply bountyhub-db --config wrangler.workers.toml --remote
```
