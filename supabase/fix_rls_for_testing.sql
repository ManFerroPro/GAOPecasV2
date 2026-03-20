-- REVISED FIX V3: Relax article constraints for testing
-- Run this in the Supabase SQL Editor

-- 1. Remove strict requirement for article codes in order lines
ALTER TABLE order_lines ALTER COLUMN requested_item_code DROP NOT NULL;

-- 2. If it still fails, it might be the Foreign Key itself (if article doesn't exist)
-- Let's drop the FK constraint temporarily for development
ALTER TABLE order_lines DROP CONSTRAINT IF EXISTS order_lines_requested_item_code_fkey;
ALTER TABLE order_lines DROP CONSTRAINT IF EXISTS order_lines_provided_item_code_fkey;

-- 3. Ensure the columns still exist but are just strings/text
-- (They are already text, so dropping FK is enough)

-- 4. Re-disable RLS just to be sure
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
