import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: "admin" | "staff" | "customer";
  adminLevel?: string;
  department?: string;
  permissions?: {
    can_manage_bookings?: boolean;
    can_manage_staff?: boolean;
    can_manage_customers?: boolean;
    can_manage_payments?: boolean;
    can_manage_admins?: boolean;
    can_view_reports?: boolean;
    can_edit_settings?: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      throw new Error("Unauthorized");
    }

    // Check if requesting user is admin
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      throw new Error("Only admins can create users with specific roles");
    }

    const body: CreateUserRequest = await req.json();
    const { email, password, fullName, phone, role, adminLevel, department, permissions } = body;

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      throw new Error("Missing required fields: email, password, fullName, role");
    }

    // Create the user using admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        full_name: fullName,
        phone: phone,
      },
    });

    if (createError) {
      throw createError;
    }

    if (!userData.user) {
      throw new Error("Failed to create user");
    }

    const userId = userData.user.id;

    // The trigger will have created a customer role, we need to update it
    // First, delete the auto-created customer role
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // Insert the correct role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: role,
      });

    if (roleError) {
      console.error("Role insert error:", roleError);
      throw new Error("Failed to assign role");
    }

    // If admin role, create/update admin_details
    if (role === "admin") {
      // Delete any auto-created customer_details
      await supabaseAdmin
        .from("customer_details")
        .delete()
        .eq("user_id", userId);

      // Create admin_details
      const { error: adminDetailsError } = await supabaseAdmin
        .from("admin_details")
        .upsert({
          user_id: userId,
          admin_level: adminLevel || "standard",
          department: department || null,
          can_manage_bookings: permissions?.can_manage_bookings ?? true,
          can_manage_staff: permissions?.can_manage_staff ?? false,
          can_manage_customers: permissions?.can_manage_customers ?? true,
          can_manage_payments: permissions?.can_manage_payments ?? false,
          can_manage_admins: permissions?.can_manage_admins ?? false,
          can_view_reports: permissions?.can_view_reports ?? true,
          can_edit_settings: permissions?.can_edit_settings ?? false,
        });

      if (adminDetailsError) {
        console.error("Admin details error:", adminDetailsError);
      }
    }

    // If staff role, ensure staff_details exists
    if (role === "staff") {
      // Delete any auto-created customer_details
      await supabaseAdmin
        .from("customer_details")
        .delete()
        .eq("user_id", userId);

      // The trigger should create staff_details, but let's ensure it exists
      const { data: existingStaffDetails } = await supabaseAdmin
        .from("staff_details")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingStaffDetails) {
        await supabaseAdmin
          .from("staff_details")
          .insert({
            user_id: userId,
            employee_id: "EMP-" + userId.substring(0, 6).toUpperCase(),
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: userData.user.email,
          role: role,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create user",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});