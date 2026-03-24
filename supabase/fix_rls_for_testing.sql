-- REVISED FIX V4: Complete removal of FK blocks for testing
-- Run this in the Supabase SQL Editor

-- 1. Remove Foreign Key constraints that block unauthenticated/mock testing
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_equipment_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_requester_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delegation_fkey;
ALTER TABLE order_lines DROP CONSTRAINT IF EXISTS order_lines_requested_item_code_fkey;
ALTER TABLE order_lines DROP CONSTRAINT IF EXISTS order_lines_provided_item_code_fkey;

-- 2. Ensure columns are nullable where needed
ALTER TABLE orders ALTER COLUMN requester_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN equipment_id DROP NOT NULL;

-- 3. Sequence and Default for order_number
CREATE SEQUENCE IF NOT EXISTS order_seq START 1000;
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT 'PP' || to_char(now(), 'YY') || LPAD(nextval('order_seq')::text, 6, '0');

-- 4. Disable RLS on all working tables
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_attachments DISABLE ROW LEVEL SECURITY;

-- 5. Add missing item_name column to order_lines if it's missing
ALTER TABLE order_lines ADD COLUMN IF NOT EXISTS item_name TEXT;

-- 6. Add a few test equipments just in case
INSERT INTO equipment (mobile_id, brand, model)
VALUES 
('EQ-001', 'Caterpillar', '320D'),
('EQ-002', 'Volvo', 'FMX'),
('TEST-001', 'Generic', 'Machine')
ON CONFLICT (mobile_id) DO NOTHING;
