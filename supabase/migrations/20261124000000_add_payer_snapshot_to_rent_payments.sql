-- Payer snapshot: store who paid at payment-creation time so later tenant
-- edits/deactivation do not rewrite historical payment records.
alter table rent_payments
  add column if not exists payer_tenant_id uuid
    references tenants(id) on delete set null,
  add column if not exists payer_name text;
