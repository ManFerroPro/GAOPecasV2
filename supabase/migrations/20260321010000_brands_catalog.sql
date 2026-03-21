-- 1. Create Brands table
CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modify item_part_numbers to reference brands
-- First, let's keep the brand string for now but add a brand_id column
ALTER TABLE item_part_numbers ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- 3. Disable RLS
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;

-- 4. Initial brands for testing
INSERT INTO brands (name) VALUES 
('CATERPILLAR'),
('VOLVO'),
('DOOSAN'),
('KOMATSU'),
('JCB')
ON CONFLICT (name) DO NOTHING;
