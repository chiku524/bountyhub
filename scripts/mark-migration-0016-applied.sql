-- One-off: mark 0016 as applied so migrations apply can continue with 0017 and 0018.
-- Run when 0016 fails with "duplicate column name: github_id" (columns already exist on remote).
-- Usage: npx wrangler d1 execute bountyhub-db --remote --config wrangler.workers.toml --file=scripts/mark-migration-0016-applied.sql
INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0016_add_github_integration.sql');
