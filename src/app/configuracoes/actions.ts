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

  if (error) {
    console.error("Error getDelegations:", error);
    return [];
  }
  return data || [];
}

export async function upsertDelegation(delegation: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload = {
    name: delegation.name,
    code: delegation.code.toUpperCase(),
    address: delegation.address,
    status: delegation.status,
    is_master: delegation.isMaster || delegation.is_master || false
  };

  // If delegation has a valid UUID, use it, otherwise let DB generate
  if (delegation.id && delegation.id.length > 20) {
    (payload as any).id = delegation.id;
  }

  const { data, error } = await supabase
    .from('delegations')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error upsertDelegation:", error);
    throw new Error(error.message);
  }
  revalidatePath("/configuracoes/delegacoes");
  revalidatePath("/configuracoes/usuarios");
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
  
  let { data: roles, error } = await supabase
    .from('app_roles')
    .select('*')
    .order('name', { ascending: true });

  // Auto-seed if empty
  if (!roles || roles.length === 0) {
    const defaults = [
      { name: 'Visualizador', scope: 'Standard' },
      { name: 'Requisitante', scope: 'Standard' },
      { name: 'Validador', scope: 'Standard' },
      { name: 'Aprovador', scope: 'Master' },
      { name: 'Transferidor', scope: 'Master' },
      { name: 'Procurement', scope: 'Master' }
    ];
    const { data: seeded } = await supabase.from('app_roles').insert(defaults).select();
    roles = seeded;
  }

  return roles || [];
}

/**
 * USER MANAGEMENT ACTIONS
 */
export async function getUsersWithPermissions() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (profileError) throw profileError;

    // 2. Fetch all related data in separate queries to avoid join issues
    const { data: allPerms } = await supabase.from('user_delegation_roles').select('*');
    const { data: allDelegations } = await supabase.from('delegations').select('id, name');
    const { data: allRoles } = await supabase.from('app_roles').select('id, name');

    // 3. Manual map to build the hierarchy
    return (profiles || []).map(profile => {
      const userPerms = (allPerms || []).filter(p => p.user_id === profile.id);
      
      const delegationMap: Record<string, string[]> = {};
      userPerms.forEach(p => {
        const delName = allDelegations?.find(d => d.id === p.delegation_id)?.name;
        const roleName = allRoles?.find(r => r.id === p.role_id)?.name;
        
        if (delName && roleName) {
          if (!delegationMap[delName]) delegationMap[delName] = [];
          delegationMap[delName].push(roleName);
        }
      });

      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email || "N/A",
        isAdmin: profile.is_admin,
        status: profile.status || "Ativo",
        lastLogin: profile.updated_at ? new Date(profile.updated_at).toLocaleString() : "Nunca",
        permissions: Object.entries(delegationMap).map(([delegation, roles]) => ({
          delegation,
          roles
        }))
      };
    });
  } catch (err) {
    console.error("Critical error in getUsersWithPermissions:", err);
    return [];
  }
}

export async function upsertUserWithPermissions(userData: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("⚠️ A variável SUPABASE_SERVICE_ROLE_KEY não está definida no .env.local. É obrigatória para criar utilizadores na base de dados (auth.users). Vá ao seu painel Supabase > Settings > API e copie a 'service_role secret'.");
  }

  // We need an admin client to create raw users in auth.users if they don't exist yet!
  const supabaseAdmin = require('@supabase/supabase-js').createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  try {
    let finalUserId = userData.id;

    // Check if user already exists in auth.users
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userData.id);

    // If it fails to find the user, it means this is a brand new UI-created user. We must create them in auth.users first!
    if (!existingUser?.user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        password: "TempPassword123!", // Initial dummy password, they'll use MSAL anyway
        user_metadata: { full_name: userData.name }
      });

      if (createError) {
        // If email already exists, maybe try to fetch by email to link them
        console.warn("Could not create user:", createError.message);
        throw new Error(createError.message);
      }
      finalUserId = newUser.user.id;
    }

    // 1. Upsert Profile (DO NOT INCLUDE email or status if they aren't in the schema)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: finalUserId,
        full_name: userData.name,
        is_admin: userData.isAdmin,
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    // 2. Clear Permissions
    await supabaseAdmin.from('user_delegation_roles').delete().eq('user_id', finalUserId);

    // 3. Fetch IDs for mapping
    const { data: delegations } = await supabase.from('delegations').select('id, name');
    const { data: roles } = await supabase.from('app_roles').select('id, name');

    // 4. Insert New Permissions
    if (userData.permissions?.length > 0) {
      const inserts: any[] = [];
      userData.permissions.forEach((p: any) => {
        const delId = delegations?.find(d => d.name === p.delegation)?.id;
        if (!delId) return;

        p.roles.forEach((roleName: string) => {
          const roleId = roles?.find(r => r.name === roleName)?.id;
          if (roleId) {
            inserts.push({
              user_id: finalUserId,
              delegation_id: delId,
              role_id: roleId
            });
          }
        });
      });

      if (inserts.length > 0) {
        const { error: insError } = await supabaseAdmin.from('user_delegation_roles').insert(inserts);
        if (insError) throw insError;
      }
    }

    revalidatePath("/configuracoes/usuarios");
    return { success: true };
  } catch (err: any) {
    console.error("Error in upsertUserWithPermissions:", err);
    throw new Error(err.message || "Unknown error occurred while guarding user");
  }
}

export async function deleteUser(id: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("⚠️ A variável SUPABASE_SERVICE_ROLE_KEY não está definida no .env.local. É obrigatória para eliminar utilizadores na base de dados (auth.users). Vá ao seu painel Supabase > Settings > API e copie a 'service_role secret'.");
  }

  const supabaseAdmin = require('@supabase/supabase-js').createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  // 1. Manually delete relational data just in case ON DELETE CASCADE is missing
  await supabaseAdmin.from('user_delegation_roles').delete().eq('user_id', id);
  await supabaseAdmin.from('profiles').delete().eq('id', id);

  // 2. Delete from Auth Users
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    console.error("Error deleting auth.user", error);
    throw new Error(error.message);
  }

  revalidatePath("/configuracoes/usuarios");
}
