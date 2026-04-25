"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ─── FETCH USER DELEGATIONS ───────────────────────────────────────────────────────

export async function getUserDelegations() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let adminClient = supabase;
  
  if (serviceRoleKey) {
    adminClient = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profile?.is_admin) {
    const { data: allDelegations } = await adminClient
      .from('delegations')
      .select('id, name')
      .order('name');
    return allDelegations || [];
  }

  const { data: perms } = await supabase
    .from('user_delegation_roles')
    .select('delegation_id')
    .eq('user_id', user.id);

  if (!perms || perms.length === 0) {
    const { data: allDelegations } = await adminClient
      .from('delegations')
      .select('id, name')
      .order('name');
    return allDelegations || [];
  }

  const delegationIds = [...new Set(perms.map(p => p.delegation_id))];

  const { data: delegations } = await adminClient
    .from('delegations')
    .select('id, name')
    .in('id', delegationIds)
    .order('name');

  return delegations || [];
}

// ─── FETCH ALL ORDERS ───────────────────────────────────────────────────────────

export async function getOrders() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const delegations = await getUserDelegations();
  const delegationIds = delegations.map(d => d.id);

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = serviceRoleKey 
    ? require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    : supabase;

  // Fetch orders with lines, delegations, and profiles (for requester)
  const { data, error } = await adminClient
    .from("orders")
    .select(`
      *,
      order_lines (
        id,
        item_name,
        requested_qty,
        status
      ),
      delegations (name),
      profiles (full_name)
    `)
    .or(`delegation.in.(${delegationIds.join(',')}),delegation.is.null`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getOrders:", error.message || error);
    // Fallback: If the column doesn't exist, we fallback to old query without the delegation filters
    if (error.code === 'PGRST200' || error.message?.includes('not found')) {
      console.warn("Delegation columns might be missing. Using fallback query.");
      const fallback = await adminClient
        .from("orders")
        .select('*, order_lines(id, item_name, requested_qty, status)')
        .order("created_at", { ascending: false });
      return mapOrdersWithEquipment(adminClient, fallback.data || []);
    }
    return [];
  }

  return mapOrdersWithEquipment(adminClient, data || []);
}

// Helper to map equipment and fallback relations data
async function mapOrdersWithEquipment(supabase: any, ordersData: any[]) {
  const equipmentIds = [...new Set((ordersData || []).map(o => o.equipment_id).filter(Boolean))];
  const delegationIds = [...new Set((ordersData || []).map(o => o.delegation).filter(Boolean))];
  const requesterIds = [...new Set((ordersData || []).map(o => o.requester_id).filter(Boolean))];
  
  let equipmentMap: Record<string, any> = {};
  let delegationMap: Record<string, string> = {};
  let profileMap: Record<string, string> = {};
  
  if (equipmentIds.length > 0) {
    const { data: eqData } = await supabase
      .from("equipment")
      .select("*, equipment_brands(name), equipment_models(name)")
      .in("mobile_id", equipmentIds);
    
    (eqData || []).forEach((eq: any) => {
      equipmentMap[eq.mobile_id] = eq;
    });
  }

  if (delegationIds.length > 0) {
    const { data: delData } = await supabase.from("delegations").select("id, name").in("id", delegationIds);
    (delData || []).forEach((d: any) => { delegationMap[d.id] = d.name; });
  }

  if (requesterIds.length > 0) {
    const { data: profData } = await supabase.from("profiles").select("id, full_name").in("id", requesterIds);
    (profData || []).forEach((p: any) => { profileMap[p.id] = p.full_name; });
  }

  return (ordersData || []).map((order: any) => {
    const eq = equipmentMap[order.equipment_id];
    return {
      ...order,
      equipment_display: eq
        ? `${eq.mobile_id}${eq.license_plate ? ` (${eq.license_plate})` : ""}`
        : order.equipment_id || "—",
      equipment_brand: eq?.equipment_brands?.name || null,
      equipment_model: eq?.equipment_models?.name || null,
      lines_count: order.order_lines?.length || 0,
      lines: order.order_lines || [],
      delegation_name: order.delegations?.name || delegationMap[order.delegation] || "N/A",
      requester_name: order.profiles?.full_name || profileMap[order.requester_id] || "N/A",
    };
  });
}

// ─── FETCH EQUIPMENT LIST (for selector) ────────────────────────────────────────

export async function getEquipmentForSelector() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("equipment")
    .select(`
      *,
      equipment_brands (name),
      equipment_models (name),
      equipment_types (name),
      equipment_categories (name)
    `)
    .order("mobile_id", { ascending: true });

  if (error) {
    console.error("Error getEquipmentForSelector:", error);
    return [];
  }

  return (data || []).map((eq: any) => ({
    id: eq.mobile_id,
    mobile_id: eq.mobile_id,
    license_plate: eq.license_plate,
    vin: eq.vin,
    year: eq.year,
    type: eq.equipment_types?.name || "",
    category: eq.equipment_categories?.name || "",
    brand: eq.equipment_brands?.name || "",
    model: eq.equipment_models?.name || "",
    observations: eq.observations || "",
    display: `${eq.mobile_id}${eq.license_plate ? ` — ${eq.license_plate}` : ""}`,
  }));
}

// ─── FETCH ITEMS LIST (for article selector) ────────────────────────────────────

export async function getItemsForSelector() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("items")
    .select("omatapalo_code, description, unit")
    .order("omatapalo_code", { ascending: true });

  if (error) {
    console.error("Error getItemsForSelector:", error);
    return [];
  }

  return data || [];
}

// ─── CREATE ORDER ───────────────────────────────────────────────────────────────

export async function createOrder(orderData: {
  equipmentId: string;
  delegationId: string;
  priority: string;
  observations?: string;
  items: { omatapalo_code: string; description: string; requestedQty: number; unit: string }[];
  teamsLink?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Insert the main order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      equipment_id: orderData.equipmentId || null,
      delegation: orderData.delegationId || null,
      requester_id: user?.id || null,
      priority: orderData.priority,
      status: "Submetido",
      observations: orderData.observations || null,
      teams_link: orderData.teamsLink || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert order lines
  if (orderData.items.length > 0) {
    const lines = orderData.items.map(item => ({
      order_id: order.id,
      item_name: `${item.omatapalo_code} — ${item.description}`,
      requested_qty: item.requestedQty,
      status: "Pending",
    }));

    const { error: linesError } = await supabase
      .from("order_lines")
      .insert(lines);

    if (linesError) throw linesError;
  }

  revalidatePath("/requisicao");
  return order;
}

// ─── UPDATE ORDER STATUS ────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/requisicao");
  return data;
}

// ─── DELETE ORDER ───────────────────────────────────────────────────────────────

export async function deleteOrder(orderId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Delete order lines first (in case no CASCADE)
  await supabase.from("order_lines").delete().eq("order_id", orderId);

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) throw error;

  revalidatePath("/requisicao");
  return { success: true };
}

// ─── ROBUST FETCH FOR USER PROFILE AND DELEGATIONS ─────────────────────────────

export async function getMyProfileAndDelegations() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { name: "Requisitante", delegations: [] };

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = serviceRoleKey 
    ? require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    : supabase;

  let name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Requisitante";
  const { data: profile } = await adminClient.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.full_name) name = profile.full_name;

  let delegations = [];
  if (profile?.is_admin) {
    const { data: allDels } = await adminClient.from('delegations').select('id, name').order('name');
    delegations = allDels || [];
  } else {
    const { data: perms } = await adminClient.from('user_delegation_roles').select('delegation_id').eq('user_id', user.id);
    if (!perms || perms.length === 0) {
      const { data: allDels } = await adminClient.from('delegations').select('id, name').order('name');
      delegations = allDels || [];
    } else {
      const delIds = perms.map((p: any) => p.delegation_id);
      const { data: dels } = await adminClient.from('delegations').select('id, name').in('id', delIds).order('name');
      delegations = dels || [];
    }
  }

  // Fallback
  if (delegations.length === 0) {
    const { data: hardFallback } = await supabase.from('delegations').select('id, name').order('name');
    delegations = hardFallback || [];
  }

  return { name, delegations };
}
