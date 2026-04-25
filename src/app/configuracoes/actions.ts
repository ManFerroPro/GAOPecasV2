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

  let authUsers: any[] = [];
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabaseAdmin: any = null;
  
  if (serviceRoleKey) {
    try {
      supabaseAdmin = require('@supabase/supabase-js').createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );
      // Fetch up to 1000 users to avoid pagination limits
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (!error && data?.users) {
        authUsers = data.users;
      }
    } catch (e) {
      console.warn("Could not fetch auth users:", e);
    }
  }

  try {
    // 1. Fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (profileError) throw profileError;

    // 2. Fetch all related data in separate queries
    // Fallback to normal supabase if admin is not available
    const adminClient = supabaseAdmin || supabase;
    const { data: allPerms } = await adminClient.from('user_delegation_roles').select('*');
    const { data: allDelegations } = await adminClient.from('delegations').select('id, name');
    const { data: allRoles } = await adminClient.from('app_roles').select('id, name');

    // 3. Create a unified set of ALL user IDs (from auth.users AND profiles)
    const allUserIds = new Set([
      ...authUsers.map(u => u.id),
      ...(profiles || []).map(p => p.id)
    ]);

    // 4. Map to build the hierarchy
    return Array.from(allUserIds).map(id => {
      const authUser = authUsers.find(u => u.id === id);
      const profile = profiles?.find((p: any) => p.id === id);
      const userPerms = (allPerms || []).filter((p: any) => p.user_id === id);
      
      const delegationMap: Record<string, string[]> = {};
      userPerms.forEach((p: any) => {
        const delName = allDelegations?.find((d: any) => d.id === p.delegation_id)?.name;
        const roleName = allRoles?.find((r: any) => r.id === p.role_id)?.name;
        
        if (delName && roleName) {
          if (!delegationMap[delName]) delegationMap[delName] = [];
          delegationMap[delName].push(roleName);
        }
      });

      return {
        id,
        name: profile?.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || "Sem Nome",
        email: authUser?.email || profile?.email || "N/A",
        isAdmin: profile?.is_admin || false,
        status: profile?.status || "Ativo",
        lastLogin: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : (profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : "Nunca"),
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
    return { error: "⚠️ A variável SUPABASE_SERVICE_ROLE_KEY não está definida nas Variáveis de Ambiente da VERCEL. É obrigatória para editar utilizadores na base de dados (auth.users)." };
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

    // If email changed for an existing user, update auth.users
    if (existingUser?.user && existingUser.user.email !== userData.email) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(finalUserId, { 
        email: userData.email,
        email_confirm: true,
        user_metadata: { full_name: userData.name }
      });
      if (updateError) console.warn("Failed to update auth email:", updateError.message);
    }

    // 1. Upsert Profile
    // We do NOT save 'email' here because it belongs to auth.users and crashes 'profiles' if it lacks the column
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: finalUserId,
        full_name: userData.name,
        status: userData.status || "Ativo",
        is_admin: userData.isAdmin,
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    // 2. Clear Permissions
    await supabaseAdmin.from('user_delegation_roles').delete().eq('user_id', finalUserId);

    // 3. Fetch IDs for mapping
    const { data: delegations } = await supabaseAdmin.from('delegations').select('id, name');
    const { data: roles } = await supabaseAdmin.from('app_roles').select('id, name');

    // 4. Insert New Permissions
    if (userData.permissions?.length > 0) {
      const inserts: any[] = [];
      userData.permissions.forEach((p: any) => {
        const delId = delegations?.find((d: any) => d.name === p.delegation)?.id;
        if (!delId) return;

        p.roles.forEach((roleName: string) => {
          const roleId = roles?.find((r: any) => r.name === roleName)?.id;
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
    return { error: err.message || "Unknown error occurred while guarding user" };
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
