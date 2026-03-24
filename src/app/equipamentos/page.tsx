import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import EquipmentListClient from "@/components/equipamentos/EquipmentListClient";

export default async function EquipamentosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .order('mobile_id', { ascending: true });

  return (
    <div className="h-full w-full animate-in fade-in duration-500">
      <EquipmentListClient initialItems={equipment || []} />
    </div>
  );
}
