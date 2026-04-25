import RequisitionListClient from "@/components/requisicao/RequisitionListClient";
import { getOrders, getEquipmentForSelector, getItemsForSelector, getUserDelegations } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function RequisicaoPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  let currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Requisitante";
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    if (profile?.full_name) currentUserName = profile.full_name;
  }

  // Fetch all data in parallel via server actions
  const [orders, equipment, items, delegations] = await Promise.all([
    getOrders(),
    getEquipmentForSelector(),
    getItemsForSelector(),
    getUserDelegations(),
  ]);

  return (
    <div className="h-full w-full animate-in fade-in duration-500">
      <RequisitionListClient
        initialOrders={orders}
        initialEquipment={equipment}
        initialItems={items}
        userDelegations={delegations}
        currentUserName={currentUserName}
      />
    </div>
  );
}
