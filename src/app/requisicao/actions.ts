"use client"; // Note: In Next.js 15, we often use 'use server' inside a separate file for actions, but I'll use a standard pattern.

import { createClient } from "@/utils/supabase/client";

export async function createOrder(orderData: {
  equipmentId: string;
  priority: string;
  items: any[];
  teamsLink?: string;
}) {
  const supabase = createClient();

  // 1. Insert the main order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      equipment_id: orderData.equipmentId || null, 
      priority: orderData.priority,
      status: "Submetido",
      teams_link: orderData.teamsLink,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert item lines
  const lines = orderData.items.map(item => ({
    order_id: order.id,
    item_name: item.name, 
    requested_qty: item.quantity,
    status: "Pending"
  }));

  const { error: linesError } = await supabase
    .from("order_lines")
    .insert(lines);

  if (linesError) throw linesError;

  return order;
}
