import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
  sendEmail?: boolean;
}

const GMAIL_USER = Deno.env.get("GMAIL_USER") || "info@touchcleaning.com.au";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

async function sendAccountCreatedEmail(
  to: string,
  fullName: string,
  role: string,
  tempPassword: string
): Promise<void> {
  if (!GMAIL_APP_PASSWORD) {
    console.log("Gmail not configured, skipping email");
    return;
  }

  const roleLabels: Record<string, string> = {
    customer: 'Customer',
    staff: 'Staff Member',
    admin: 'Administrator',
    manager: 'Manager'
  };
  const roleLabel = roleLabels[role] || role;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Touch Cleaning</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">Touch Cleaning</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">Professional Cleaning Services</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px;">👋</span>
                </div>
                <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Welcome to Touch Cleaning!</h2>
                <p style="margin: 0; font-size: 15px; color: #64748b;">Your ${roleLabel} account has been created</p>
              </div>
              
              <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
                Hi ${fullName},<br><br>
                Your account has been successfully created. Here are your login details:
              </p>
              
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Account Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${to}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Role</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${roleLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Temporary Password</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600; text-align: right;">${tempPassword}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;">
                  <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
                </p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://touchcleaning.lovable.app/auth" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px;">
                  Sign In to Your Account
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #64748b;">
                      <strong style="color: #334155;">Touch Cleaning</strong><br>
                      Professional Cleaning Services
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Touch Cleaning. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: GMAIL_USER,
        password: GMAIL_APP_PASSWORD,
      },
    },
  });

  try {
    await client.send({
      from: `Touch Cleaning <${GMAIL_USER}>`,
      to: to,
      subject: `Welcome to Touch Cleaning - Your ${roleLabel} Account`,
      content: "Please enable HTML to view this email.",
      html: html,
    });
    console.log(`Account creation email sent to ${to}`);
  } finally {
    await client.close();
  }
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
    const { email, password, fullName, phone, role, adminLevel, department, permissions, sendEmail = true } = body;

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

    // Send account creation email
    if (sendEmail) {
      try {
        await sendAccountCreatedEmail(email, fullName, role, password);
      } catch (emailError) {
        console.error("Failed to send account creation email:", emailError);
        // Don't fail the request if email fails
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