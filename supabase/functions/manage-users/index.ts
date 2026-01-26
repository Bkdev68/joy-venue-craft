import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  action: 'create';
  email: string;
  password: string;
  displayName?: string;
  role: 'admin' | 'editor';
}

interface UpdateUserRequest {
  action: 'update';
  userId: string;
  email?: string;
  password?: string;
  displayName?: string;
  role?: 'admin' | 'editor';
}

interface DeleteUserRequest {
  action: 'delete';
  userId: string;
}

interface ListUsersRequest {
  action: 'list';
}

type UserRequest = CreateUserRequest | UpdateUserRequest | DeleteUserRequest | ListUsersRequest;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request is from an authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the calling user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Ungültiges Token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if calling user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Nur Administratoren können Benutzer verwalten' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: UserRequest = await req.json();

    switch (request.action) {
      case 'list': {
        // Get all users with their roles
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          throw listError;
        }

        // Get all roles
        const { data: roles } = await supabaseAdmin
          .from('user_roles')
          .select('user_id, role');

        const usersWithRoles = users.map(user => {
          const userRole = roles?.find(r => r.user_id === user.id);
          return {
            id: user.id,
            email: user.email,
            displayName: user.user_metadata?.display_name || '',
            role: userRole?.role || null,
            createdAt: user.created_at,
            lastSignIn: user.last_sign_in_at,
          };
        });

        return new Response(
          JSON.stringify({ users: usersWithRoles }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        const { email, password, displayName, role } = request;

        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'E-Mail und Passwort sind erforderlich' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create the user
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { display_name: displayName || '' },
        });

        if (createError) {
          console.error('Error creating user:', createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!userData.user) {
          return new Response(
            JSON.stringify({ error: 'Benutzer konnte nicht erstellt werden' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Add role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userData.user.id,
            role: role,
          });

        if (roleError) {
          console.error('Error adding role:', roleError);
          // Try to clean up the created user
          await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
          return new Response(
            JSON.stringify({ error: 'Rolle konnte nicht zugewiesen werden' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: {
              id: userData.user.id,
              email: userData.user.email,
              displayName: displayName || '',
              role: role,
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        const { userId, email, password, displayName, role } = request;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Benutzer-ID ist erforderlich' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update user in auth
        const updateData: any = {};
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (displayName !== undefined) {
          updateData.user_metadata = { display_name: displayName };
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            updateData
          );

          if (updateError) {
            console.error('Error updating user:', updateError);
            return new Response(
              JSON.stringify({ error: updateError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Update role if provided
        if (role) {
          // Delete existing role
          await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', userId);

          // Insert new role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: userId,
              role: role,
            });

          if (roleError) {
            console.error('Error updating role:', roleError);
            return new Response(
              JSON.stringify({ error: 'Rolle konnte nicht aktualisiert werden' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const { userId } = request;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Benutzer-ID ist erforderlich' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Prevent self-deletion
        if (userId === callingUser.id) {
          return new Response(
            JSON.stringify({ error: 'Sie können sich nicht selbst löschen' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete role first
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Delete user
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ungültige Aktion' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Ein unerwarteter Fehler ist aufgetreten' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
