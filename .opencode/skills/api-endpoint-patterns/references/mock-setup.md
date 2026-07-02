# Mock Setup for API Tests

Load this file when writing `route.test.ts` files for API endpoints.

## Mock declarations

```typescript
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { <Feature>Input } from "@/lib/validations/<feature>";
import { create<Feature>, list<Feature> } from "./route";

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

## Chain mocking patterns

| Query chain | Mock setup |
|------------|------------|
| `.select("*").eq("user_id", id)` | `mockSelect.mockReturnValue({ eq: mockEq });` |
| `.insert([...]).select().single()` | `mockInsert.mockReturnValue({ select: mockSelect }); mockSelect.mockReturnValue({ single: mockSingle });` |
| `.update({...}).eq("id", id).eq("user_id", id).select().single()` | `mockUpdate.mockReturnValue({ eq: mockEq }); mockEq.mockReturnValue({ eq: mockEq2 }); mockEq2.mockReturnValue({ select: mockSelect }); mockSelect.mockReturnValue({ single: mockSingle });` |
| `.delete({ count: "exact" }).eq("id", id).eq("user_id", id)` | `mockDelete.mockReturnValue({ eq: mockEq }); mockEq.mockReturnValue({ eq: mockEq2 });` |

## Shared helpers

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

## Test coverage per handler

| Handler | Tests |
|---------|-------|
| list (GET) | Success (200), no auth (401), DB error (500) |
| create (POST) | Success (201), success with variant inputs, no auth (401), missing required field (400), invalid enum (400), DB error (500) |
| update (PATCH) | Success updating single field (200), success updating multiple fields (200), no auth (401), invalid field (400), not found (404), DB error (500) |
| delete (DELETE) | Success (204), no auth (401), not found (404), DB error (500) |

Mock data uses `snake_case` for DB responses, `camelCase` for request bodies and expected outputs. Assert both the response status/body AND the Supabase call arguments.
