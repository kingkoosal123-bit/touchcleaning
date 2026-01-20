import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'booking' | 'enquiry' | 'newsletter' | 'enquiry_reply' | 'booking_reply' | 'account_created' | 'work_assigned';
  to: string;
  data: Record<string, any>;
  cc?: string[];
}

const GMAIL_USER = Deno.env.get("GMAIL_USER") || "info@touchcleaning.com.au";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
const COMPANY_EMAIL = "info@touchcleaning.com.au";

// Base email template wrapper - minified to avoid =20 encoding issues
const emailWrapper = (content: string, previewText: string) => {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Touch Cleaning</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');</style></head><body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa; -webkit-font-smoothing: antialiased;"><div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div><table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa; padding: 40px 20px;"><tr><td align="center"><table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;"><tr><td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 32px 40px; text-align: center;"><h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Touch Cleaning</h1><p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">Professional Cleaning Services</p></td></tr><tr><td style="padding: 40px;">${content}</td></tr><tr><td style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;"><table role="presentation" style="width: 100%; border-collapse: collapse;"><tr><td style="text-align: center;"><p style="margin: 0 0 16px; font-size: 14px; color: #64748b;"><strong style="color: #334155;">Touch Cleaning</strong><br>Professional Cleaning Services</p><p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">📧 info@touchcleaning.com.au</p><p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">📞 +61 452 419 700</p><p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">🌐 touchcleaning.com.au</p><p style="margin: 0; font-size: 12px; color: #94a3b8;">© ${year} Touch Cleaning. All rights reserved.</p></td></tr></table></td></tr></table></td></tr></table></body></html>`;
};

// Email templates - minified to avoid =20 encoding issues
const templates = {
  booking: (data: Record<string, any>) => {
    const services = data.selected_services?.length ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Services</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.selected_services.join(', ')}</td></tr>` : '';
    const content = `<div style="text-align: center; margin-bottom: 32px;"><div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;"><span style="font-size: 32px;">✓</span></div><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Booking Confirmed!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">Thank you for choosing Touch Cleaning</p></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Booking Details</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Service Type</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_type || 'N/A'}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Property Type</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.property_type || 'N/A'}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Date</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.preferred_date || 'N/A'}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Address</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_address || 'N/A'}</td></tr>${services}</table></div><div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #3b82f6;"><p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>What's Next?</strong><br>Our team will review your booking and confirm within 24 hours. You'll receive a confirmation email with your assigned cleaner details.</p></div><p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">Questions? Reply to this email or call us at +61 452 419 700.</p>`;
    return {
      subject: `Booking Confirmed - ${data.service_type} on ${data.preferred_date}`,
      html: emailWrapper(content, `Your ${data.service_type} booking for ${data.preferred_date} has been confirmed.`),
    };
  },

  booking_admin: (data: Record<string, any>) => {
    const notesRow = data.notes ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Notes</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.notes}</td></tr>` : '';
    const content = `<div style="margin-bottom: 24px;"><h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e293b;">🔔 New Booking Received</h2><p style="margin: 0; font-size: 15px; color: #64748b;">A new cleaning service has been booked</p></div><div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #f59e0b;"><p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Action Required:</strong> Review and confirm this booking</p></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Customer Details</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Name</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.first_name} ${data.last_name}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.email}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Phone</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.phone}</td></tr></table></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Booking Details</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Service Type</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_type}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Property Type</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.property_type}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Booking Type</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.booking_type || 'One-time'}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Date</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.preferred_date}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Address</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_address}</td></tr>${notesRow}</table></div>`;
    return {
      subject: `🔔 New Booking: ${data.service_type} - ${data.first_name} ${data.last_name}`,
      html: emailWrapper(content, `New booking from ${data.first_name} ${data.last_name} for ${data.service_type}`),
    };
  },

  enquiry: (data: Record<string, any>) => {
    const content = `<div style="text-align: center; margin-bottom: 32px;"><div style="width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;"><span style="font-size: 32px;">📨</span></div><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Thanks for Reaching Out!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">We've received your message</p></div><p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">Hi ${data.name},<br><br>Thank you for contacting Touch Cleaning! We've received your enquiry and our team will get back to you within 24 hours.</p><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Your Message</h3><p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic; line-height: 1.6;">"${data.message}"</p></div><p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">We appreciate your interest in our services!</p>`;
    return {
      subject: `We've Received Your Enquiry - Touch Cleaning`,
      html: emailWrapper(content, `Thank you for contacting Touch Cleaning. We'll respond within 24 hours.`),
    };
  },

  enquiry_admin: (data: Record<string, any>) => {
    const phoneRow = data.phone ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Phone</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.phone}</td></tr>` : '';
    const serviceRow = data.service_interest ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Service Interest</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_interest}</td></tr>` : '';
    const content = `<div style="margin-bottom: 24px;"><h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e293b;">📬 New Enquiry Received</h2><p style="margin: 0; font-size: 15px; color: #64748b;">Someone has contacted you through the website</p></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Contact Details</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Name</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.name}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.email}</td></tr>${phoneRow}${serviceRow}</table></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Message</h3><p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">${data.message}</p></div>`;
    return {
      subject: `📬 New Enquiry from ${data.name}`,
      html: emailWrapper(content, `New enquiry from ${data.name}: ${data.message.substring(0, 50)}...`),
    };
  },

  newsletter: (data: Record<string, any>) => {
    const content = `<div style="text-align: center; margin-bottom: 32px;"><div style="width: 64px; height: 64px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;"><span style="font-size: 32px;">🎉</span></div><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Welcome to Our Newsletter!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">You're now part of the Touch Cleaning family</p></div><p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6; text-align: center;">Thank you for subscribing! You'll be the first to know about our latest cleaning tips, special offers, and exclusive promotions.</p><div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px; padding: 24px; text-align: center;"><p style="margin: 0 0 16px; font-size: 16px; color: #ffffff; font-weight: 500;">Ready for a sparkling clean home?</p><a href="https://touchcleaning.com.au/book" style="display: inline-block; background-color: #ffffff; color: #0284c7; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">Book Your First Clean</a></div>`;
    return {
      subject: `Welcome to Touch Cleaning Newsletter! 🎉`,
      html: emailWrapper(content, `Thank you for subscribing to Touch Cleaning newsletter.`),
    };
  },

  enquiry_reply: (data: Record<string, any>) => {
    const content = `<div style="margin-bottom: 24px;"><h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e293b;">Re: Your Enquiry</h2><p style="margin: 0; font-size: 15px; color: #64748b;">Response from Touch Cleaning</p></div><p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">Hi ${data.name},<br><br>Thank you for your patience. Here's our response to your enquiry:</p><div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #22c55e;"><p style="margin: 0; font-size: 15px; color: #166534; line-height: 1.6;">${data.reply_message}</p></div><p style="margin: 0; font-size: 14px; color: #64748b;">If you have any more questions, feel free to reply to this email or call us at +61 452 419 700.</p>`;
    return {
      subject: `Re: Your Enquiry - Touch Cleaning`,
      html: emailWrapper(content, `Response to your enquiry from Touch Cleaning.`),
    };
  },

  booking_reply: (data: Record<string, any>) => {
    const content = `<div style="margin-bottom: 24px;"><h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e293b;">Booking Update</h2><p style="margin: 0; font-size: 15px; color: #64748b;">Message from Touch Cleaning</p></div><p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">Hi ${data.first_name},<br><br>Here's an update regarding your booking:</p><div style="background-color: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #3b82f6;"><p style="margin: 0; font-size: 15px; color: #1e40af; line-height: 1.6;">${data.reply_message}</p></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Booking Reference</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Service</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_type}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Date</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.preferred_date}</td></tr></table></div>`;
    return {
      subject: `Booking Update - Touch Cleaning`,
      html: emailWrapper(content, `Update regarding your Touch Cleaning booking.`),
    };
  },

  account_created: (data: Record<string, any>) => {
    const roleLabels: Record<string, string> = { customer: 'Customer', staff: 'Staff Member', admin: 'Administrator', manager: 'Manager' };
    const roleLabel = roleLabels[data.role] || data.role;
    const tempPwdRow = data.temp_password ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Temporary Password</td><td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600; text-align: right;">${data.temp_password}</td></tr>` : '';
    const tempPwdWarning = data.temp_password ? `<div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #ef4444;"><p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.</p></div>` : '';
    const content = `<div style="text-align: center; margin-bottom: 32px;"><div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;"><span style="font-size: 32px;">👋</span></div><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Welcome to Touch Cleaning!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">Your ${roleLabel} account has been created</p></div><p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">Hi ${data.full_name},<br><br>Your account has been successfully created. Here are your login details:</p><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Account Details</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Email</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.email}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Role</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${roleLabel}</td></tr>${tempPwdRow}</table></div>${tempPwdWarning}<div style="text-align: center;"><a href="https://touchcleaning.com.au/auth" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px;">Sign In to Your Account</a></div>`;
    return {
      subject: `Welcome to Touch Cleaning - Your ${roleLabel} Account`,
      html: emailWrapper(content, `Your Touch Cleaning ${roleLabel} account has been created.`),
    };
  },

  work_assigned: (data: Record<string, any>) => {
    const hoursRow = data.estimated_hours ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Estimated Hours</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.estimated_hours} hours</td></tr>` : '';
    const notesSection = data.notes ? `<div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #3b82f6;"><p style="margin: 0 0 8px; font-size: 14px; color: #1e40af; font-weight: 600;">Special Notes:</p><p style="margin: 0; font-size: 14px; color: #1e40af;">${data.notes}</p></div>` : '';
    const content = `<div style="margin-bottom: 24px;"><h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e293b;">📋 New Job Assigned</h2><p style="margin: 0; font-size: 15px; color: #64748b;">You have a new cleaning assignment</p></div><div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #f59e0b;"><p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Action Required:</strong> Please review and accept this assignment</p></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Job Details</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Service Type</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_type}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Property Type</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.property_type}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Date</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.preferred_date}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Address</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.service_address}</td></tr>${hoursRow}</table></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Customer Info</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Name</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.customer_name}</td></tr><tr><td style="padding: 8px 0; font-size: 14px; color: #64748b;">Phone</td><td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500; text-align: right;">${data.customer_phone}</td></tr></table></div>${notesSection}<div style="text-align: center;"><a href="https://touchcleaning.com.au/staff" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px;">View in Dashboard</a></div>`;
    return {
      subject: `📋 New Job: ${data.service_type} on ${data.preferred_date}`,
      html: emailWrapper(content, `You've been assigned a new ${data.service_type} job for ${data.preferred_date}.`),
    };
  },
};

async function sendEmail(to: string, subject: string, html: string, cc?: string[]): Promise<void> {
  if (!GMAIL_APP_PASSWORD) {
    throw new Error("Gmail app password not configured");
  }

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
      cc: cc,
      subject: subject,
      content: "Please enable HTML to view this email.",
      html: html,
    });
  } finally {
    await client.close();
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data, cc }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`);

    let emailContent: { subject: string; html: string };
    let adminEmailContent: { subject: string; html: string } | null = null;

    switch (type) {
      case 'booking':
        emailContent = templates.booking(data);
        adminEmailContent = templates.booking_admin(data);
        break;
      case 'enquiry':
        emailContent = templates.enquiry(data);
        adminEmailContent = templates.enquiry_admin(data);
        break;
      case 'newsletter':
        emailContent = templates.newsletter(data);
        break;
      case 'enquiry_reply':
        emailContent = templates.enquiry_reply(data);
        break;
      case 'booking_reply':
        emailContent = templates.booking_reply(data);
        break;
      case 'account_created':
        emailContent = templates.account_created(data);
        break;
      case 'work_assigned':
        emailContent = templates.work_assigned(data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send to customer/recipient
    await sendEmail(to, emailContent.subject, emailContent.html, cc);
    console.log(`Email sent to ${to}`);

    // Send admin notification for booking/enquiry
    if (adminEmailContent) {
      await sendEmail(COMPANY_EMAIL, adminEmailContent.subject, adminEmailContent.html);
      console.log(`Admin notification sent to ${COMPANY_EMAIL}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
