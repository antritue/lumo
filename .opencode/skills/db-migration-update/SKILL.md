---
name: db-migration-update
description: Use when fixing or modifying an existing supabase DB migration that has already been applied. Instead of creating a new migration file for a schema fix, this skill drops the table, repairs the migration, rewrites the migration file, and pushes.
---

# DB Migration Fix (Re-apply)

When you need to fix an already-applied migration (add a column, change a constraint, remove a FK), don't create a new migration file — repair and re-apply the existing one.

## Commands

Replace `20260620000000` with your migration's timestamp.

### 1. Drop the affected table(s) on the linked remote DB
```bash
npx supabase db query --linked "drop table if exists <table_name> cascade;"
```

### 2. Mark the migration as reverted
```bash
npx supabase migration repair --status reverted <timestamp>
```

### 3. Rewrite the migration file
Clean up the `.sql` file to be a fresh `create table` with all fixes applied. Remove any fallback `alter table` or `drop policy if exists` statements — the table is being created fresh.

### 4. Push the migration
```bash
npx supabase db push
```

## Gotchas

- **PG < 15**: `create policy if not exists` is not supported. Always use `drop policy if exists` before `create policy` if you need idempotency. Better yet, just write a clean `create policy` since the table is being dropped first.
- **Use `npx supabase db query --linked`** — not `db execute`. The latter is not a valid command.
- **Cascade matters**: Use `cascade` on the DROP to avoid FK constraint errors during teardown.
- **Verify**: After push, run `npx supabase db dump --linked --schema public` (or check in Supabase dashboard) to confirm the schema is correct.
