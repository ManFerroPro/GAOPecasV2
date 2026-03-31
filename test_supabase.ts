import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: "c:/Antigravity/GAOPecasV2/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const dummyId = crypto.randomUUID();
  const userData = {
    id: dummyId,
    name: "Test User",
    isAdmin: false,
    status: "Ativo"
  };

  console.log("Trying to insert profile...");
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userData.id,
      full_name: userData.name,
      is_admin: userData.isAdmin,
      status: userData.status,
      updated_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error("UPSERT ERROR:", JSON.stringify(error, null, 2));
    console.error("ErrorMessage:", error.message);
    console.error("ErrorCode:", error.code);
    console.error("ErrorDetails:", error.details);
  } else {
    console.log("SUCCESS:", data);
  }
}

testInsert();
