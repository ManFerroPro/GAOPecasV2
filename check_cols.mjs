import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing credentials");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Check if columns exist by trying to select them
  const { error: checkError } = await supabase.from('orders').select('delegation_id, created_by').limit(1);

  if (checkError) {
    console.log("Columns don't exist. Creating them...");
    
    // We run raw sql using rpc if we can, but if not we can just warn the user to add them.
    // Usually we use postgres function `exec_sql`, but if it doesn't exist, we can't easily alter table from JS.
    console.log("Please run this SQL in Supabase SQL editor:");
    console.log(`
      ALTER TABLE public.orders 
      ADD COLUMN IF NOT EXISTS delegation_id UUID REFERENCES public.delegations(id),
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);
    `);
  } else {
    console.log("Columns already exist!");
  }
}

run().catch(console.error);
