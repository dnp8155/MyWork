-- Run this in your Supabase SQL Editor to fix the missing data issue

-- 1. Create a helper function to apply standard policies to a table
CREATE OR REPLACE FUNCTION apply_standard_policies(table_name text)
RETURNS void AS $$
BEGIN
    EXECUTE format('
        DROP POLICY IF EXISTS "Users can read own %1$s" ON public.%1$s;
        DROP POLICY IF EXISTS "Users can insert own %1$s" ON public.%1$s;
        DROP POLICY IF EXISTS "Users can update own %1$s" ON public.%1$s;
        DROP POLICY IF EXISTS "Users can delete own %1$s" ON public.%1$s;
        
        CREATE POLICY "Users can read own %1$s" ON public.%1$s FOR SELECT USING (auth.uid() = created_by_id OR created_by_id IS NULL);
        CREATE POLICY "Users can insert own %1$s" ON public.%1$s FOR INSERT WITH CHECK (auth.uid() = created_by_id OR created_by_id IS NULL);
        CREATE POLICY "Users can update own %1$s" ON public.%1$s FOR UPDATE USING (auth.uid() = created_by_id OR created_by_id IS NULL);
        CREATE POLICY "Users can delete own %1$s" ON public.%1$s FOR DELETE USING (auth.uid() = created_by_id OR created_by_id IS NULL);
    ', table_name);
END;
$$ LANGUAGE plpgsql;

-- 2. Apply policies to all tables
SELECT apply_standard_policies('base44_accounts');
SELECT apply_standard_policies('clients');
SELECT apply_standard_policies('company_settings');
SELECT apply_standard_policies('credentials');
SELECT apply_standard_policies('domains');
SELECT apply_standard_policies('expenses');
SELECT apply_standard_policies('hosting_accounts');
SELECT apply_standard_policies('invoices');
SELECT apply_standard_policies('notifications');
SELECT apply_standard_policies('payments');
SELECT apply_standard_policies('projects');
SELECT apply_standard_policies('project_documents');
SELECT apply_standard_policies('project_members');
SELECT apply_standard_policies('quotations');
SELECT apply_standard_policies('recurring_payment_schedules');
SELECT apply_standard_policies('transactions');

-- 3. Make sure the authenticated user's ID is automatically inserted
-- (When inserting from the app, we need to pass created_by_id, or we can just let the app handle it. 
-- Since the app codemod didn't automatically add created_by_id to every insert, 
-- we should add a trigger to set created_by_id automatically if it's missing!)

CREATE OR REPLACE FUNCTION set_created_by_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by_id IS NULL THEN
    NEW.created_by_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name != 'users'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_created_by_id_trigger ON public.%1$s;
            CREATE TRIGGER set_created_by_id_trigger
            BEFORE INSERT ON public.%1$s
            FOR EACH ROW
            EXECUTE FUNCTION set_created_by_id();
        ', t);
    END LOOP;
END;
$$;
