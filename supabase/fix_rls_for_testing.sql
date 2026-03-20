-- REVISED FIX: Allow testing without Auth
-- Run this in the Supabase SQL Editor

-- 1. Remove strict requirement for requester_id until Auth is ready
ALTER TABLE orders ALTER COLUMN requester_id DROP NOT NULL;

-- 2. Add sequence and default for order_number
CREATE SEQUENCE IF NOT EXISTS order_seq START 1000;
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT 'PP' || to_char(now(), 'YY') || LPAD(nextval('order_seq')::text, 6, '0');

-- 3. Ensure priority has a default
ALTER TABLE orders ALTER COLUMN priority SET DEFAULT 'Normal';

-- 4. Temporarily disable RLS for testing
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Add a dummy equipment if needed (ignore FK for now by making it nullable)
ALTER TABLE orders ALTER COLUMN equipment_id DROP NOT NULL;
INSERT INTO equipment (mobile_id, brand, model)
VALUES ('TEST-001', 'Caterpillar', '320D')
ON CONFLICT DO NOTHING;
