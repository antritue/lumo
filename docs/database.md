# Database Schema

This document outlines the database structure and relationships within Lumo.

## Entity Relationship Diagram

*Edit this diagram in the [Mermaid Live Editor](https://mermaid.live)*

```mermaid
erDiagram
    "auth.users" ||--o{ properties : "owns"
    "auth.users" ||--o{ rooms : "owns"
    "auth.users" ||--o{ services : "owns"
    "auth.users" ||--o{ property_services : "owns"
    "auth.users" ||--o{ room_services : "owns"
    "auth.users" ||--o{ rent_payments : "owns"
    "auth.users" ||--o{ rent_payment_charges : "owns"
    "auth.users" ||--o| user_entitlements : "has"
    properties ||--o{ rooms : "contains"
    properties ||--o{ property_services : "has"
    rooms ||--o{ room_services : "has"
    rooms ||--o{ rent_payments : "has"
    rent_payments ||--o{ rent_payment_charges : "has"
    "auth.users" {
        uuid id PK
        text email
    }
    properties {
        uuid id PK
        uuid user_id FK
        text name
    }
    rooms {
        uuid id PK
        uuid property_id FK
        uuid user_id FK
        text name
        numeric monthly_rent
        text notes
    }
    services {
        uuid id PK
        uuid user_id FK
        text name
        text unit_label
        text pricing_type
        numeric flat_amount
        numeric unit_price
    }
    property_services {
        uuid id PK
        uuid property_id FK
        uuid service_id
        uuid user_id FK
        text service_name
        text pricing_type
        text unit_label
        numeric flat_amount
        numeric unit_price
    }
    room_services {
        uuid id PK
        uuid room_id FK
        uuid service_id
        uuid user_id FK
        text service_name
        text pricing_type
        text unit_label
        numeric flat_amount
        numeric unit_price
    }
    rent_payments {
        uuid id PK
        uuid room_id FK
        uuid user_id FK
        text period
        numeric rent_amount
        text status
    }
    rent_payment_charges {
        uuid id PK
        uuid rent_payment_id FK
        uuid service_id
        uuid user_id FK
        text service_name
        text pricing_type
        text unit_label
        numeric unit_price
        numeric flat_amount
        numeric usage
        numeric total
    }
    user_entitlements {
        uuid id PK
        uuid user_id FK
        text polar_customer_id
        text tier
        text status
        timestamptz current_period_end
    }
```

## Tables

### `properties`

Stores information about properties managed by landlords.

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. |
| | `name` | `text` | The display name of the property. |

### `rooms`

Stores information about rooms within properties.

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `property_id` | `uuid` | Foreign Key to `properties(id)`. Cascades on delete. |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. |
| | `name` | `text` | The display name of the room. |
| | `monthly_rent` | `numeric` | Optional monthly rent amount for the room. |
| | `notes` | `text` | Optional additional notes about the room. |

### `services`

Stores the user-definable service catalog for service charges (electricity, water, wifi, etc.).

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. |
| | `name` | `text` | The display name of the service (e.g. "Electricity"). |
| | `unit_label` | `text` | Optional unit label for variable pricing (e.g. "kWh", "m³"). |
| | `pricing_type` | `text` | `'flat'` or `'variable'`. |
| | `flat_amount` | `numeric` | Optional flat monthly fee. Null until user sets a price. |
| | `unit_price` | `numeric` | Optional price per unit for variable services. Null until user sets a price. |

Two default services (Electricity kWh, Water m³) are auto-seeded for every new user via a trigger `on_auth_user_created_services` on `auth.users` insert.

### `property_services`

Stores property-level service configurations. Each row defines a service assigned to a property with its own name, pricing type, and amount. Services are self-contained per property — there is no FK dependency on the global `services` table. On room creation, entries from `property_services` pre-populate `room_services`.

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `property_id` | `uuid` | Foreign Key to `properties(id)`. Cascades on delete. |
| | `service_id` | `uuid` | UUID identifying the service type (no FK constraint). |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. |
| | `service_name` | `text` | The display name of the service (e.g. "Electricity"). |
| | `pricing_type` | `text` | `'flat'` or `'variable'`. |
| | `unit_label` | `text` | Optional unit label for variable pricing (e.g. "kWh", "m³"). |
| | `flat_amount` | `numeric` | Optional flat monthly fee. |
| | `unit_price` | `numeric` | Optional price per unit for variable services. |

Unique constraint on `(property_id, service_id)`.

### `room_services`

Stores room-level service configurations. Each row defines a service assigned to a room with its own name, pricing type, and amount. Services are self-contained per room — there is no FK dependency on the global `services` table. On room creation, entries from `property_services` pre-populate `room_services`.

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `room_id` | `uuid` | Foreign Key to `rooms(id)`. Cascades on delete. |
| | `service_id` | `uuid` | UUID identifying the service type (no FK constraint). |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. |
| | `service_name` | `text` | The display name of the service (e.g. "Electricity"). |
| | `pricing_type` | `text` | `'flat'` or `'variable'`. |
| | `unit_label` | `text` | Optional unit label for variable pricing (e.g. "kWh", "m³"). |
| | `flat_amount` | `numeric` | Optional flat monthly fee. |
| | `unit_price` | `numeric` | Optional price per unit for variable services. |

Unique constraint on `(room_id, service_id)`.

### `rent_payments`

Stores rent payment records for rooms.

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `room_id` | `uuid` | Foreign Key to `rooms(id)`. Cascades on delete. |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. |
| | `period` | `text` | Payment period in `YYYY-MM` format. |
| | `rent_amount` | `numeric` | The rent amount for this period. |
| | `status` | `text` | `'pending'` or `'paid'`. |

Unique constraint on `(room_id, period)`.

### `rent_payment_charges`

Stores service charge line items associated with a rent payment.

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `rent_payment_id` | `uuid` | Foreign Key to `rent_payments(id)`. Cascades on delete. |
| | `service_id` | `uuid` | UUID identifying the service type. |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. |
| | `service_name` | `text` | The display name of the service. |
| | `pricing_type` | `text` | `'flat'` or `'variable'`. |
| | `unit_label` | `text` | Optional unit label for variable pricing (e.g. "kWh"). |
| | `unit_price` | `numeric` | Optional price per unit. |
| | `flat_amount` | `numeric` | Optional flat fee. |
| | `usage` | `numeric` | Optional usage amount for variable pricing. |
| | `total` | `numeric` | Computed total for this charge line. |

### `user_entitlements`

Stores the paid plan entitlement for each user, written by Polar webhooks via the service-role client. It is the source of truth for room limits — the app reads this table to decide whether a user is on the free plan (max 5 rooms) or paid (unlimited rooms).

| Key | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| `PK` | `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `FK` | `user_id` | `uuid` | Foreign Key to `auth.users(id)`. Unique. |
| | `polar_customer_id` | `text` | The Polar customer ID linked to the user. |
| | `tier` | `text` | `'monthly'`, `'yearly'`, or `'lifetime'`. |
| | `status` | `text` | `'active'` (paid), `'canceled'` (keeps access until `current_period_end`), or `'revoked'` (immediate loss). |
| | `current_period_end` | `timestamptz` | End of the current billing period; null for lifetime. |

Unique constraint on `user_id`.

### Account Deletion

When a user deletes their account, data is cleaned up in FK-safe order:

```
rent_payment_charges → rent_payments → room_services
→ rooms → property_services → properties → services
→ user_entitlements
```

Then the `auth.users` record is removed via the Supabase admin client (`service_role` key). There is no `ON DELETE CASCADE` on `user_id` foreign keys — the application handles deletion explicitly.

## Row Level Security (RLS)

All tables strictly enforce RLS policies to ensure user data isolation. Access is typically scoped to `auth.uid() = user_id`.

For more details on security, see the [Authentication Guide](./auth.md).
