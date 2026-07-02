# Handler Templates

Load this file when implementing a new API endpoint and you need the full handler code.

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
