---
name: api-endpoint-patterns
description: Use when creating new API endpoints, route handlers, validation schemas, DB migrations, unit tests, and OpenAPI docs in the Lumo project. Covers directory structure, handler patterns, mock setup, and conventions used throughout the codebase.
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
8. Project docs (`docs/*.md`) — update `docs/database.md` (ER diagram + table reference), `docs/development.md`, or any other relevant docs that describe the schema or API

## DB Migration (`supabase/migrations/`)

```sql
-- Naming: YYYYMMDDHHMMSS_create_<table>.sql
create table if not exists <table> (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  -- ... resource-specific columns
);

alter table <table> enable row level security;

-- Four RLS policies, each scoped to auth.uid() = user_id:
create policy "Users can select own <table>"
  on <table> for select
  using (auth.uid() = user_id);

-- Same pattern for insert (with check), update (using + with check), delete (using)
```

For resources that need auto-seeding for new users, add a trigger at the bottom:
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
  // camelCase fields, match the API request body
  name: z.string().min(1, "Name is required"),
  // nullable + optional for fields that can be null or omitted
  field: z.string().nullable().optional(),
  // enums inline
  status: z.enum(["active", "inactive"]),
  // numbers with constraints
  amount: z.number().positive("Amount must be positive").nullable().optional(),
});

export type <Feature>Input = z.infer<typeof <feature>Schema>;
```

## Constants (`lib/constants.ts`)

Add a `UPPER_SNAKE_CASE` entry to `DATABASE_TABLES`:

```typescript
export const DATABASE_TABLES = {
  // ... existing entries
  <FEATURE>: "<table>",
};
```

## Route Directory Structure

```
app/api/<feature>/
  route.ts              — collection: GET (list), POST (create)
  route.test.ts         — tests for collection
  [id]/
    route.ts            — single: PATCH (update), DELETE
    route.test.ts       — tests for single
```

## Collection Route (`app/api/<feature>/route.ts`)

### List (GET)

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { <feature>Schema } from "@/lib/validations/<feature>";

export async function list<Feature>() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(DATABASE_TABLES.<FEATURE>)
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(data.map(mapToCamelCase), { status: 200 });
  } catch (err) {
    console.error("<Feature> API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### Create (POST)

```typescript
export async function create<Feature>(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = <feature>Schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: z.treeifyError(validation.error) },
        { status: 400 },
      );
    }

    const { /* destructure fields */ } = validation.data;

    const { data, error } = await supabase
      .from(DATABASE_TABLES.<FEATURE>)
      .insert([{ user_id: user.id, /* snake_case fields */ }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapToCamelCase(data), { status: 201 });
  } catch (err) {
    console.error("<Feature> API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const GET = list<Feature>;
export const POST = create<Feature>;
```

## Single-Resource Route (`app/api/<feature>/[id]/route.ts`)

### Update (PATCH)

```typescript
export async function update<Feature>(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validation = <feature>Schema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: z.treeifyError(validation.error) },
        { status: 400 },
      );
    }

    const { /* destructure fields */ } = validation.data;

    // Build update object: only defined fields, camelCase → snake_case mapping
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (someField !== undefined) updateData.some_field = someField;

    const { data, error } = await supabase
      .from(DATABASE_TABLES.<FEATURE>)
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "<Feature> not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(mapToCamelCase(data), { status: 200 });
  } catch (err) {
    console.error("<Feature> API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### Delete (DELETE)

```typescript
export async function delete<Feature>(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error, count } = await supabase
      .from(DATABASE_TABLES.<FEATURE>)
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json({ error: "<Feature> not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("<Feature> API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const PATCH = update<Feature>;
export const DELETE = delete<Feature>;
```

## Response Status Codes

| Code | When |
|------|------|
| 200 | Successful GET, PATCH |
| 201 | Successful POST |
| 204 | Successful DELETE (no body) |
| 400 | Zod validation failure — `z.treeifyError(validation.error)` |
| 401 | `authError || !user` |
| 404 | Row not found (`count === 0` or `PGRST116`) |
| 409 | Unique constraint violation (error code `23505`) |
| 500 | Caught exception — generic message |

## Unit Tests (co-located `route.test.ts`)

### Mock setup

```typescript
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { <Feature>Input } from "@/lib/validations/<feature>";
import { create<Feature>, list<Feature> } from "./route";

// Declare mock fns for every Supabase method used
const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })),
  })),
}));
```

### Chain mocking pattern

Each Supabase query chains methods. Set up the chain in `beforeEach`:

| Query chain | Mock setup |
|------------|------------|
| `.select("*").eq("user_id", id)` | `mockSelect.mockReturnValue({ eq: mockEq });` |
| `.insert([...]).select().single()` | `mockInsert.mockReturnValue({ select: mockSelect }); mockSelect.mockReturnValue({ single: mockSingle });` |
| `.update({...}).eq("id", id).eq("user_id", id).select().single()` | `mockUpdate.mockReturnValue({ eq: mockEq }); mockEq.mockReturnValue({ eq: mockEq2 }); mockEq2.mockReturnValue({ select: mockSelect }); mockSelect.mockReturnValue({ single: mockSingle });` |
| `.delete({ count: "exact" }).eq("id", id).eq("user_id", id)` | `mockDelete.mockReturnValue({ eq: mockEq }); mockEq.mockReturnValue({ eq: mockEq2 });` |

### Shared helpers

```typescript
const createRequest = (body: <Feature>Input | Record<string, unknown>) => {
  return new NextRequest("http://localhost:3000/api/<feature>", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const createParams = (id: string) => ({
  params: Promise.resolve({ id }),
});

const mockAuthenticatedUser = () => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: "test-user-id" } },
  });
};

const mockUnauthenticated = () => {
  mockGetUser.mockResolvedValue({
    data: { user: null },
  });
};
```

### Test cases to cover per handler

| Handler | Tests |
|---------|-------|
| list (GET) | Success (200), no auth (401), DB error (500) |
| create (POST) | Success (201), success with variant inputs, no auth (401), missing required field (400), invalid enum (400), DB error (500) |
| update (PATCH) | Success updating single field (200), success updating multiple fields (200), no auth (401), invalid field (400), not found (404), DB error (500) |
| delete (DELETE) | Success (204), no auth (401), not found (404), DB error (500) |

Mock data uses `snake_case` for DB responses, `camelCase` for request bodies and expected outputs. Assert both the response status/body AND the Supabase call arguments (e.g., `expect(mockInsert).toHaveBeenCalledWith([{...}])`).

## OpenAPI Spec (`docs/openapi.yaml`)

Add schemas and paths following the existing structure.

### Schemas

Three schemas per resource:

```yaml
<Feature>:
  type: object
  properties:
    id:
      type: string
      format: uuid
    # ... all response fields
  required:
    - id
    # ... required response fields

<Feature>Input:
  type: object
  properties:
    # ... all request fields
  required:
    # ... fields required for creation

<Feature>UpdateInput:
  type: object
  properties:
    # ... same as Input but all optional
```

Use `type: ["number", "null"]` instead of `type: number` + `nullable: true` (OpenAPI 3.1.0).

### Paths

Add collection + single-resource paths. Reference shared responses via `$ref`:

```yaml
  /api/<feature>:
    get:
      summary: List <feature>s
      operationId: list<Feature>s
      tags:
        - <Feature>
      responses:
        "200":
          description: List of <feature>s
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/<Feature>"

    post:
      summary: Create <feature>
      operationId: create<Feature>
      tags:
        - <Feature>
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/<Feature>Input"
      responses:
        "201":
          description: <Feature> created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/<Feature>"
        # ... 400, 401, 500

  /api/<feature>/{id}:
    # ... parameters, patch, delete
```

## Common mistakes

- **Forgetting `.eq("user_id", user.id)`** on queries — RLS alone isn't sufficient for the API layer
- **Forgetting `.select().single()`** after `.insert()` / `.update()` — Supabase needs this to return the created/updated row
- **Missing `.partial()`** on update schema — PATCH should accept any subset of fields
- **Not handling `PGRST116`** (no rows returned) — occurs when `.single()` finds no matching row; return 404, not 500
- **Destructuring `params` sync** — `params` is a `Promise<{ id: string }>` in Next.js 15+, must `await`
- **Using `unit_label: unitLabel ?? null`** in insert — convert camelCase to snake_case manually for DB inserts
- **Missing `{ count: "exact" }`** in delete — without this, Supabase doesn't return `count` for the 0-check
- **Mixing snake_case and camelCase** in test assertions — DB mock data uses `snake_case`, response expectations use `camelCase`
- **Not clearing mocks** in `beforeEach` — leftover state from previous tests causes flaky failures
