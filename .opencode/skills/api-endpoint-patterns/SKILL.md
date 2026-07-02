---
name: api-endpoint-patterns
description: >
  Use this skill when creating new API endpoints or modifying existing ones
  under app/api/ — route handlers, Zod validation, Supabase DB migrations with
  RLS, co-located unit tests, and OpenAPI docs. Applies even if the user doesn't
  say "route," "API," or "endpoint." Covers Next.js 15+ Promise<params>,
  Supabase chain-mocking, and the exact order of work.
---

# API Endpoint Patterns

Follow these patterns when creating new API endpoints. Every resource follows the same structure — study services as the reference example.

## Order of work

1. DB migration (`supabase/migrations/`)
2. Validation schema (`lib/validations/<feature>.ts`)
3. Constants (`lib/constants.ts`)
4. Collection route (`app/api/<feature>/route.ts`)
5. Single-resource route (`app/api/<feature>/[id]/route.ts`)
6. Unit tests (co-located `route.test.ts`)
7. OpenAPI spec (`docs/openapi.yaml`)
8. Project docs (`docs/*.md`)

## DB Migration (`supabase/migrations/`)

```sql
-- Naming: YYYYMMDDHHMMSS_create_<table>.sql
create table if not exists <table> (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
);
alter table <table> enable row level security;

create policy "Users can select own <table>"
  on <table> for select using (auth.uid() = user_id);
-- Same for insert (with check), update (using + with check), delete (using)
```

For auto-seeding on new user signup:

```sql
create or replace function public.handle_new_<feature>()
returns trigger as $$
begin
  insert into public.<table> (user_id, ...) values (new.id, ...);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_<feature>
  after insert on auth.users
  for each row execute function public.handle_new_<feature>();
```

## Validation Schema (`lib/validations/<feature>.ts`)

```typescript
import { z } from "zod";

export const <feature>Schema = z.object({
  name: z.string().min(1, "Name is required"),
  field: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]),
  amount: z.number().positive("Amount must be positive").nullable().optional(),
});

export type <Feature>Input = z.infer<typeof <feature>Schema>;
```

## Constants (`lib/constants.ts`)

```typescript
export const DATABASE_TABLES = {
  <FEATURE>: "<table>",
};
```

## Route Directory Structure

```
app/api/<feature>/
  route.ts              — GET (list), POST (create)
  route.test.ts         — tests for collection
  [id]/
    route.ts            — PATCH (update), DELETE (delete)
    route.test.ts       — tests for single
```

## Route Handlers

**Load `references/handler-templates.md` for the full handler code (list, create, update, delete).**

Key structure per handler:
1. Create Supabase server client
2. Check auth (`supabase.auth.getUser()`)
3. Validate input with Zod (POST/PATCH)
4. Execute Supabase query
5. Return typed response with correct status code

## Response Status Codes

| Code | When |
|------|------|
| 200 | Successful GET, PATCH |
| 201 | Successful POST |
| 204 | Successful DELETE (no body) |
| 400 | Zod validation failure — `z.treeifyError(validation.error)` |
| 401 | `authError \|\| !user` |
| 404 | Row not found (`count === 0` or `PGRST116`) |
| 409 | Unique constraint violation (error code `23505`) |
| 500 | Caught exception — generic message |

## Unit Tests

**Load `references/mock-setup.md` for mock declarations, chain mocking patterns, shared helpers, and test coverage per handler.**

## OpenAPI Spec

**Load `references/openapi-patterns.md` for schemas and paths patterns.**

## Common mistakes

- **Forgetting `.eq("user_id", user.id)`** on queries — RLS alone isn't sufficient
- **Forgetting `.select().single()`** after `.insert()` / `.update()`
- **Missing `.partial()`** on update schema — PATCH should accept any subset of fields
- **Not handling `PGRST116`** — return 404 when `.single()` finds no matching row
- **Destructuring `params` synchronously** — `params` is `Promise<{ id: string }>` in Next.js 15+, must `await`
- **Using `unit_label: unitLabel ?? null`** — convert camelCase to snake_case manually
- **Missing `{ count: "exact" }`** in delete — need this for the 0-count check
- **Mixing snake_case and camelCase** in test assertions
- **Not clearing mocks** in `beforeEach`
