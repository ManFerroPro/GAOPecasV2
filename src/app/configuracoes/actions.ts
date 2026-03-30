"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * DELEGATIONS ACTIONS
 */

export async function getDelegations() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase
    .from('delegations')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertDelegation(delegation: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('delegations')
    .upsert({
      id: delegation.id.includes('.') ? undefined : delegation.id, // Handle temporary IDs if any
      name: delegation.name,
      code: delegation.code.toUpperCase(),
      address: delegation.address,
      status: delegation.status,
      is_master: delegation.isMaster || delegation.is_master || false
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/configuracoes/delegacoes");
  revalidatePath("/configuracoes/usuarios"); // Because users select delegations
  return data;
}

export async function deleteDelegation(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('delegations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath("/configuracoes/delegacoes");
}

/**
 * ROLES ACTIONS
 */

export async function getAppRoles() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase
    .from('app_roles')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * USER MANAGEMENT ACTIONS
 */

export async function getUsersWithPermissions() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  if (profileError) throw profileError;

  // Fetch permissions mapping with joins
  const { data: permissions, error: permError } = await supabase
    .from('user_delegation_roles')
    .select(`
      user_id,
      delegation:delegations(name, is_master),
      role:app_roles(name)
    `);

  if (permError) throw permError;

  // Map permissions to profiles
  return profiles.map(profile => {
    const userPerms = permissions.filter(p => p.user_id === profile.id);
    
    // Group roles by delegation
    const delegationMap: Record<string, string[]> = {};
    userPerms.forEach(p => {
      const delName = (p.delegation as any).name;
      if (!delegationMap[delName]) delegationMap[delName] = [];
      delegationMap[delName].push((p.role as any).name);
    });

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email || "N/A", // Email might come from auth or meta
      isAdmin: profile.is_admin,
      status: profile.status,
      lastLogin: profile.updated_at ? new Date(profile.updated_at).toLocaleString() : "Nunca",
      permissions: Object.entries(delegationMap).map(([delegation, roles]) => ({
        delegation,
        roles
      }))
    };
  });
}

export async function upsertUserWithPermissions(userData: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Update Profile Basics
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userData.id,
      full_name: userData.name,
      is_admin: userData.isAdmin,
      status: userData.status,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (profileError) throw profileError;

  // 2. Clear Existing Permissions
  const { error: deletePermsError } = await supabase
    .from('user_delegation_roles')
    .delete()
    .eq('user_id', userData.id);

  if (deletePermsError) throw deletePermsError;

  // 3. Insert New Permissions
  // We need current delegations and roles to map names to IDs if the frontend only sends names.
  // Ideally the frontend sends IDs, but for the prototype let's resolve them here or update frontend.
  
  // Optimistically assuming the frontend will send data that includes IDs or we resolve here.
  // For now let's implement the logic to handle name-to-ID mapping for safety.
  
  const { data: allDelegations } = await supabase.from('delegations').select('id, name');
  const { data: allRoles } = await supabase.from('app_roles').select('id, name');

  if (userData.permissions && userData.permissions.length > 0) {
    const insertPayload: any[] = [];
    
    userData.permissions.forEach((p: any) => {
      const delId = allDelegations?.find(d => d.name === p.delegation)?.id;
      if (!delId) return;

      p.roles.forEach((roleName: string) => {
        const roleId = allRoles?.find(r => r.name === roleName)?.id;
        if (roleId) {
          insertPayload.push({
            user_id: userData.id,
            delegation_id: delId,
            role_id: roleId
          });
        }
      });
    });

    if (insertPayload.length > 0) {
      const { error: insertError } = await supabase
        .from('user_delegation_roles')
        .insert(insertPayload);
      
      if (insertError) throw insertError;
    }
  }

  revalidatePath("/configuracoes/usuarios");
  return profile;
}

export async function deleteUser(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath("/configuracoes/usuarios");
}
