-- ============================================================
-- MyWork — Supabase Migration (17 tables)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================
-- Convention: created_at / updated_at (standard Supabase)
-- ============================================================

-- Shared trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  client_id text,
  name text NOT NULL,
  company_name text,
  email text,
  phone text,
  whatsapp text,
  address text,
  gst_number text,
  pan text,
  notes text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  project_number text,
  name text NOT NULL,
  logo text,
  client_id text,
  client_name text,
  company_name text,
  client_email text,
  client_phone text,
  client_address text,
  description text,
  details text,
  status text DEFAULT 'pending',
  start_date date,
  expected_completion_date date,
  completion_date date,
  base44_account_id text,
  github_account_id text,
  supabase_account_id text,
  vercel_account_id text,
  base44_workspace_id text,
  base44_project_url text,
  notes text,
  project_type text DEFAULT 'fixed',
  total_amount numeric DEFAULT 0,
  monthly_amount numeric DEFAULT 0,
  recurring_start_date date,
  recurring_end_date date,
  number_of_months numeric DEFAULT 0,
  payment_due_day numeric DEFAULT 1,
  billing_frequency text DEFAULT 'monthly'
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  invoice_number text,
  invoice_date date,
  due_date date,
  client_id text,
  client_name text,
  project_id text,
  project_name text,
  quotation_id text,
  quotation_number text,
  items jsonb DEFAULT '[]',
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  tax_rate numeric DEFAULT 0,
  total numeric DEFAULT 0,
  description text,
  payment_method text,
  bank_name text,
  account_holder_name text,
  account_number text,
  ifsc_code text,
  upi_id text,
  status text DEFAULT 'draft'
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. quotations
-- ============================================================
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  quotation_number text,
  date date,
  valid_until date,
  client_id text,
  client_name text,
  client_company text,
  client_email text,
  client_phone text,
  client_address text,
  project_id text,
  project_name text,
  items jsonb DEFAULT '[]',
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  tax_rate numeric DEFAULT 0,
  total numeric DEFAULT 0,
  notes text,
  terms text,
  status text DEFAULT 'draft',
  converted_invoice_id text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  payment_number text,
  date date,
  amount numeric DEFAULT 0,
  client_id text,
  client_name text,
  project_id text,
  project_name text,
  invoice_id text,
  invoice_number text,
  recurring_schedule_id text,
  payment_method text DEFAULT 'bank_transfer',
  reference text,
  notes text,
  type text DEFAULT 'project'
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  expense_number text,
  date date,
  amount numeric DEFAULT 0,
  category text DEFAULT 'other',
  subcategory text,
  project_id text,
  project_name text,
  client_id text,
  client_name text,
  vendor text,
  payment_method text DEFAULT 'bank_transfer',
  description text,
  receipt_url text,
  recurring boolean DEFAULT false,
  source text DEFAULT 'manual',
  linked_domain_id text,
  linked_hosting_id text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  transaction_number text,
  date date,
  type text DEFAULT 'income',
  category text,
  amount numeric DEFAULT 0,
  project_id text,
  project_name text,
  client_id text,
  client_name text,
  invoice_id text,
  payment_method text,
  reference text,
  description text,
  source_entity text,
  source_id text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. domains
-- ============================================================
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  domain_name text,
  registrar text,
  purchase_date date,
  renewal_date date,
  purchase_cost numeric DEFAULT 0,
  renewal_cost numeric DEFAULT 0,
  purchased_by text DEFAULT 'us',
  project_id text,
  project_name text,
  client_id text,
  client_name text,
  status text DEFAULT 'active',
  auto_renewal boolean DEFAULT false,
  notes text,
  expense_id text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. hosting_accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  provider text,
  plan text,
  name text NOT NULL,
  server_identifier text,
  purchase_date date,
  renewal_date date,
  cost numeric DEFAULT 0,
  billing_cycle text DEFAULT 'yearly',
  purchased_by text DEFAULT 'us',
  project_id text,
  project_name text,
  client_id text,
  client_name text,
  status text DEFAULT 'active',
  notes text,
  expense_id text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON hosting_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 10. base44_accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS base44_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  account_name text NOT NULL,
  category text DEFAULT 'base44',
  account_email text,
  password text,
  project_url text,
  repo_url text,
  api_key text,
  team text,
  notes text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON base44_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 11. credentials
-- ============================================================
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  title text NOT NULL,
  category text DEFAULT 'other',
  username text,
  password text,
  login_url text,
  project_id text,
  project_name text,
  client_id text,
  client_name text,
  notes text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 12. project_members
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  project_id text NOT NULL,
  project_name text,
  client_id text,
  name text NOT NULL,
  email text,
  role text DEFAULT 'developer',
  salary_type text DEFAULT 'monthly',
  salary_amount numeric DEFAULT 0,
  status text DEFAULT 'invited',
  notes text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 13. project_documents
-- ============================================================
CREATE TABLE IF NOT EXISTS project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  project_id text NOT NULL,
  project_name text,
  title text NOT NULL,
  file_name text,
  file_url text NOT NULL,
  file_type text DEFAULT 'document',
  public_link text,
  notes text,
  uploaded_by text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 14. recurring_payment_schedules
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  project_id text NOT NULL,
  project_name text,
  client_id text,
  client_name text,
  due_date date NOT NULL,
  amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  status text DEFAULT 'upcoming',
  payment_id text,
  installment_number numeric DEFAULT 1,
  description text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON recurring_payment_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 15. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  title text NOT NULL,
  message text,
  description text,
  type text DEFAULT 'general',
  due_date date,
  related_entity text,
  related_id text,
  status text DEFAULT 'pending'
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 16. audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  user_id text,
  user_name text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  description text,
  old_value text,
  new_value text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 17. company_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by_id text,
  company_name text NOT NULL DEFAULT 'My Agency',
  logo text,
  address text,
  country text,
  phone text,
  email text,
  gst_number text,
  pan text,
  website text,
  currency text DEFAULT 'INR',
  currency_symbol text DEFAULT '₹',
  tax_rate numeric DEFAULT 18,
  financial_year text DEFAULT '2026-2027',
  invoice_prefix text DEFAULT 'INV',
  quotation_prefix text DEFAULT 'QT',
  payment_prefix text DEFAULT 'PAY',
  expense_prefix text DEFAULT 'EXP',
  project_prefix text DEFAULT 'PRJ',
  client_prefix text DEFAULT 'CL',
  description text
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS Policies (Strict Multi-User Data Isolation)
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','projects','invoices','quotations','payments','expenses',
    'transactions','domains','hosting_accounts','base44_accounts',
    'credentials','project_members','project_documents',
    'recurring_payment_schedules','notifications','audit_logs','company_settings'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "user_isolation_%s" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "user_isolation_%s" ON %I FOR ALL USING (created_by_id::text = auth.uid()::text OR created_by_id IS NULL) WITH CHECK (created_by_id::text = auth.uid()::text OR created_by_id IS NULL)',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================
-- Realtime (for live updates via Supabase subscriptions)
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','projects','invoices','quotations','payments','expenses',
    'transactions','domains','hosting_accounts','base44_accounts',
    'credentials','project_members','project_documents',
    'recurring_payment_schedules','notifications','audit_logs','company_settings'
  ])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
END $$;