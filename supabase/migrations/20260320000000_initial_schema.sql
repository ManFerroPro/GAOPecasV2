-- Initial Schema for GAO Peças ERP

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user', 'manager', 'buyer', 'warehouse'
    permissions JSONB DEFAULT '[]',
    delegation UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Equipment (Equipamento)
CREATE TABLE equipment (
    mobile_id TEXT PRIMARY KEY,
    license_plate TEXT,
    vin TEXT,
    brand TEXT,
    model TEXT,
    year INTEGER,
    engine_no TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Items (Artigos)
CREATE TABLE items (
    omatapalo_code TEXT PRIMARY KEY,
    part_number TEXT,
    description TEXT NOT NULL,
    family TEXT,
    type TEXT,
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Suppliers (Fornecedores)
CREATE TABLE suppliers (
    primavera_id TEXT PRIMARY KEY,
    addresses JSONB DEFAULT '[]', -- List of addresses
    contacts JSONB DEFAULT '[]', -- List of contacts {name, role, email, phone}
    tags TEXT[], -- Brands/Types
    notes_log TEXT, -- Public notes/comments log
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders (Cabeçalho Pedido)
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- Custom Sequencer (e.g., PP26001126)
    delegation UUID REFERENCES profiles(id),
    requester_id UUID REFERENCES profiles(id) NOT NULL,
    equipment_id TEXT REFERENCES equipment(mobile_id) NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal', -- 'Normal', 'Urgent', 'Emergency'
    status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Validated', 'Approved', 'Purchasing', ...
    teams_link TEXT, -- Microsoft Smart Link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Order Lines (Linhas do Pedido)
CREATE TABLE order_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    requested_item_code TEXT REFERENCES items(omatapalo_code),
    provided_item_code TEXT REFERENCES items(omatapalo_code), -- Central manager can substitute
    requested_qty NUMERIC DEFAULT 0,
    approved_qty NUMERIC DEFAULT 0,
    transfer_qty NUMERIC DEFAULT 0,
    purchase_qty NUMERIC DEFAULT 0,
    backorder_qty NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Global Configuration (White-label)
CREATE TABLE global_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Audit Logs
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Functions & Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_order_lines_updated_at BEFORE UPDATE ON order_lines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) - Example
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
