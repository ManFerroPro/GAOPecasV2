-- 1. Add sub_family to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS sub_family TEXT;

-- 2. Create item_part_numbers table
CREATE TABLE IF NOT EXISTS item_part_numbers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_code TEXT REFERENCES items(omatapalo_code) ON DELETE CASCADE NOT NULL,
    brand TEXT,
    part_number TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable RLS for testing
ALTER TABLE item_part_numbers DISABLE ROW LEVEL SECURITY;

-- 4. Create an index for searching
CREATE INDEX IF NOT EXISTS idx_pn_part_number ON item_part_numbers(part_number);
CREATE INDEX IF NOT EXISTS idx_pn_item_code ON item_part_numbers(item_code);
