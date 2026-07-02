# OpenAPI Patterns

Load this file when adding OpenAPI schemas and paths for a new feature.

## Schemas

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

## Paths

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
