-- 1. Create Families & Sub-Families Tables
CREATE TABLE IF NOT EXISTS families (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sub_families (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id, name)
);

-- 2. Update items table to use IDs for family/sub-family
ALTER TABLE items ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);
ALTER TABLE items ADD COLUMN IF NOT EXISTS sub_family_id UUID REFERENCES sub_families(id);
ALTER TABLE items ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS item_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_code TEXT REFERENCES items(omatapalo_code) ON DELETE CASCADE NOT NULL,
    user_id UUID DEFAULT auth.uid(),
    user_name TEXT, -- Fallback for dev mode
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Attachments Table (Metadata for files in Storage)
CREATE TABLE IF NOT EXISTS item_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_code TEXT REFERENCES items(omatapalo_code) ON DELETE CASCADE NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT, -- 'image' or 'document'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Strict Uppercase Rules
CREATE OR REPLACE FUNCTION uppercase_item_fields() RETURNS TRIGGER AS $$
BEGIN
    NEW.omatapalo_code := UPPER(NEW.omatapalo_code);
    NEW.description := UPPER(NEW.description);
    NEW.family := UPPER(NEW.family); -- Keep for back-compat
    NEW.sub_family := UPPER(NEW.sub_family); -- Keep for back-compat
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_items_uppercase ON items;
CREATE TRIGGER trg_items_uppercase 
BEFORE INSERT OR UPDATE ON items 
FOR EACH ROW EXECUTE FUNCTION uppercase_item_fields();

-- 6. Disable RLS
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE sub_families DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_attachments DISABLE ROW LEVEL SECURITY;

-- 7. Basic Data for Testing
INSERT INTO families (name) VALUES ('FILTROS'), ('MOTORES'), ('HIDRÁULICA') ON CONFLICT (name) DO NOTHING;
INSERT INTO sub_families (family_id, name) 
SELECT id, 'FILTRO ÓLEO' FROM families WHERE name = 'FILTROS' ON CONFLICT DO NOTHING;
INSERT INTO sub_families (family_id, name) 
SELECT id, 'FILTRO AR' FROM families WHERE name = 'FILTROS' ON CONFLICT DO NOTHING;
