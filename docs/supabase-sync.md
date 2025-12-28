# Supabase Environment Sync Guide

To keep your **Test** and **Production** databases in sync without manual UI work, follow this workflow using the Supabase CLI.

## 1. Local Schema Definition
Your database schema is defined in [supabase/migrations/20251229000000_init_waitlist.sql](file:///d:/Propjects/lumo/supabase/migrations/20251229000000_init_waitlist.sql). Any changes to your tables should be added as new `.sql` files in that folder.

## 2. Syncing to an Environment

### Step A: Login
First, login to your Supabase account:
```bash
npx supabase login
```

### Step B: Link and Push
For each environment (Prod or Test), follow these two steps:

1. **Link the project**:
   Find this in: Project Settings > General > Project Reference (a 20-character string).
   ```bash
   npx supabase link --project-ref <your-project-id>
   ```

2. **Push the schema**:
   This will apply all migrations in your local folder to that project.
   ```bash
   npx supabase db push
   ```

## 3. Recommended Workflow
1. Make changes to local migration files.
2. **Push to Test**: Run `db push` against your Test project ID.
3. **Verify**: Test your app.
4. **Push to Prod**: Run `db push` against your Prod project ID.

> [!TIP]
> You only need to `link` once for each environment when you switch. The CLI remembers the reference.
