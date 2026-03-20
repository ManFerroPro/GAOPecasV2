"use client";

import { createClient } from "@/utils/supabase/client";

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .update({ 
      status, 
      notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (error) throw error;
  
  return { success: true };
}
