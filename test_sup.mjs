import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function check() {
  const dummyId = crypto.randomUUID();
  console.log("Testing minimal UPSERT into profiles...");
  const { error } = await supabase.from('profiles').upsert({
    id: dummyId,
    full_name: 'Test Minimal User'
  });
  
  if (error) {
    console.error("UPSERT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("UPSERT SUCCESS! Columns exist and no FK exception.");
  }
}
check();
