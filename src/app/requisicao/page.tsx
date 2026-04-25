import RequisitionListClient from "@/components/requisicao/RequisitionListClient";
import { getOrders, getEquipmentForSelector, getItemsForSelector, getUserDelegations } from "./actions";

export default async function RequisicaoPage() {
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
      />
    </div>
  );
}
