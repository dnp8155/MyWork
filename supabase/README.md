# Supabase Setup — MyWork

This folder contains everything needed to set up the Supabase backend for the MyWork app.

## Quick Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**
3. Paste the entire contents of `migration.sql` and run it
4. Copy your **Project URL** and **anon key** from **Settings → API**
5. In the Base44 app dashboard, go to **Secrets** and set:
   - `SUPABASE_URL` → your project URL
   - `SUPABASE_ANON_KEY` → your anon key
6. Enable **Email auth** in Supabase → Authentication → Providers

That's it. The app will now read/write all data from Supabase.

---

## Tables (17)

| # | Table | Entity (app) | Purpose |
|---|-------|-------------|---------|
| 1 | `clients` | Client | Client contacts & company details |
| 2 | `projects` | Project | Project info, status, billing type |
| 3 | `invoices` | Invoice | Invoices with line items (jsonb) |
| 4 | `quotations` | Quotation | Quotations, convertible to invoices |
| 5 | `payments` | Payment | Incoming payments received |
| 6 | `expenses` | Expense | Business expenses with categories |
| 7 | `transactions` | Transaction | Auto-created ledger of income/expense |
| 8 | `domains` | Domain | Domain registrations & renewals |
| 9 | `hosting_accounts` | HostingAccount | Hosting plans & renewals |
| 10 | `base44_accounts` | Base44Account | Base44/Supabase/GitHub/Vercel accounts |
| 11 | `credentials` | Credential | Login credentials (passwords, API keys) |
| 12 | `project_members` | ProjectMember | Team members per project |
| 13 | `project_documents` | ProjectDocument | Uploaded files per project |
| 14 | `recurring_payment_schedules` | RecurringPaymentSchedule | Installment schedules |
| 15 | `notifications` | Notification | Reminders & alerts |
| 16 | `audit_logs` | AuditLog | Change history |
| 17 | `company_settings` | CompanySettings | Single-row company config |

### Common columns (all tables)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | Auto-generated |
| `created_at` | timestamptz | Auto-set on insert |
| `updated_at` | timestamptz | Auto-updated via trigger |
| `created_by_id` | text | Set by app from auth user |

---

## Database Functions

### `update_updated_at()`

A trigger function that auto-updates the `updated_at` column on every row update. Attached to all 17 tables via a `BEFORE UPDATE` trigger named `set_updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS)

All 17 tables have RLS **enabled** with a permissive policy:

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_<table>" ON <table> FOR ALL USING (true) WITH CHECK (true);
```

> ⚠️ This allows anyone with the anon key to read/write all data. Tighten these policies before going multi-user. A good starting point for per-user isolation:
> ```sql
> CREATE POLICY "own_rows" ON <table>
>   FOR ALL USING (created_by_id = auth.uid()::text) WITH CHECK (created_by_id = auth.uid()::text);
> ```

---

## Realtime

All 17 tables are added to the `supabase_realtime` publication, enabling live updates via Supabase subscriptions in the app (`entity.subscribe()`).

---

## Authentication

The app uses **Supabase Auth** (email/password). The Supabase client is initialized in `src/lib/supabaseClient.js` using the URL and anon key from the `supabaseConfig` Base44 backend function (reads from app secrets).

---

## Entity ↔ Table Mapping

The app routes all entity CRUD through `src/lib/supabaseEntities.js`, which maps Base44 entity names (PascalCase) to Supabase tables (snake_case):

| Entity | Table |
|--------|-------|
| Client | clients |
| Project | projects |
| Invoice | invoices |
| Quotation | quotations |
| Payment | payments |
| Expense | expenses |
| Transaction | transactions |
| Domain | domains |
| HostingAccount | hosting_accounts |
| Base44Account | base44_accounts |
| Credential | credentials |
| ProjectMember | project_members |
| ProjectDocument | project_documents |
| RecurringPaymentSchedule | recurring_payment_schedules |
| Notification | notifications |
| AuditLog | audit_logs |
| CompanySettings | company_settings |

### Supported operations

`list`, `filter`, `get`, `create`, `bulkCreate`, `update`, `updateMany`, `bulkUpdate`, `delete`, `deleteMany`, `subscribe`

---

## File Storage

File uploads (project documents, logos) use **Base44 Core storage** (`UploadPublicFile`), not Supabase Storage. The resulting public URL is stored in the Supabase table column (`file_url`, `logo`). This is intentional — files are public links, metadata lives in Supabase.

---

## App Secrets (Base44)

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |

These are read by the `supabaseConfig` backend function and passed to the client.