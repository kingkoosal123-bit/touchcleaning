import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GMAIL_USER = Deno.env.get("GMAIL_USER") || "info@touchcleaning.com.au";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const emailWrapper = (content: string) => {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f7fa;}</style></head><body style="margin:0;padding:0;background:#f4f7fa;"><table role="presentation" style="width:100%;border-collapse:collapse;background:#f4f7fa;padding:40px 20px;"><tr><td align="center"><table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 40px;text-align:center;"><h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;">Touch Cleaning</h1><p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Professional Cleaning Services</p></td></tr><tr><td style="padding:40px;">${content}</td></tr><tr><td style="background:#f8fafc;padding:32px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0 0 8px;font-size:14px;color:#64748b;"><strong style="color:#334155;">Touch Cleaning</strong></p><p style="margin:0 0 8px;font-size:13px;color:#64748b;">📧 info@touchcleaning.com.au | 📞 +61 452 419 700</p><p style="margin:0;font-size:12px;color:#94a3b8;">© ${year} Touch Cleaning. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("bulk_email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Get recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from("bulk_email_recipients")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("status", "pending");

    if (recipientsError) {
      throw new Error("Failed to fetch recipients");
    }

    if (!GMAIL_APP_PASSWORD) {
      throw new Error("Email not configured");
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD },
      },
    });

    let sentCount = 0;
    let failedCount = 0;
    const htmlContent = emailWrapper(campaign.html_content);

    // Send emails to each recipient
    for (const recipient of recipients || []) {
      try {
        // Get user email from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(recipient.user_id);
        const email = authUser?.user?.email;

        if (!email) {
          await supabase
            .from("bulk_email_recipients")
            .update({ status: "failed", error_message: "No email found" })
            .eq("id", recipient.id);
          failedCount++;
          continue;
        }

        await client.send({
          from: `Touch Cleaning <${GMAIL_USER}>`,
          to: email,
          subject: campaign.subject,
          html: htmlContent,
        });

        await supabase
          .from("bulk_email_recipients")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", recipient.id);

        // Log the email
        await supabase.from("email_logs").insert({
          template_key: "bulk_campaign",
          recipient_email: email,
          recipient_name: recipient.name,
          subject: campaign.subject,
          status: "sent",
          metadata: { campaign_id: campaignId },
        });

        sentCount++;
      } catch (error: any) {
        await supabase
          .from("bulk_email_recipients")
          .update({ status: "failed", error_message: error.message })
          .eq("id", recipient.id);
        failedCount++;
      }
    }

    await client.close();

    // Update campaign status
    await supabase
      .from("bulk_email_campaigns")
      .update({
        status: "completed",
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq("id", campaignId);

    return new Response(JSON.stringify({ success: true, sent: sentCount, failed: failedCount }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Bulk email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
