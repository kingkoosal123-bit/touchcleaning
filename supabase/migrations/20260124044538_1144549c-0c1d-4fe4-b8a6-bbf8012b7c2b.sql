-- Create email_templates table for storing customizable email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'transactional',
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bulk_email_campaigns table for managing mass emails
CREATE TABLE public.bulk_email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all_customers',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bulk_email_recipients table for tracking individual recipients
CREATE TABLE public.bulk_email_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.bulk_email_campaigns(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_email_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active templates for edge functions"
ON public.email_templates FOR SELECT
USING (is_active = true);

-- RLS Policies for email_logs
CREATE POLICY "Admins can view all email logs"
ON public.email_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert email logs"
ON public.email_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for bulk_email_campaigns
CREATE POLICY "Admins can manage bulk email campaigns"
ON public.bulk_email_campaigns FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for bulk_email_recipients
CREATE POLICY "Admins can manage bulk email recipients"
ON public.bulk_email_recipients FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_created ON public.email_logs(created_at DESC);
CREATE INDEX idx_bulk_campaigns_status ON public.bulk_email_campaigns(status);
CREATE INDEX idx_bulk_recipients_campaign ON public.bulk_email_recipients(campaign_id);

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_campaigns_updated_at
BEFORE UPDATE ON public.bulk_email_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (template_key, name, description, subject, html_content, category, variables) VALUES
('booking_confirmation', 'Booking Confirmation', 'Sent to customers when they make a booking', 'Booking Confirmed - {{service_type}} on {{preferred_date}}', '<div style="text-align: center; margin-bottom: 32px;"><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Booking Confirmed!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">Thank you for choosing Touch Cleaning</p></div><div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;"><h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;">Booking Details</h3><p><strong>Service:</strong> {{service_type}}</p><p><strong>Property:</strong> {{property_type}}</p><p><strong>Date:</strong> {{preferred_date}}</p><p><strong>Address:</strong> {{service_address}}</p></div>', 'transactional', '["service_type", "property_type", "preferred_date", "service_address", "first_name", "last_name"]'),
('enquiry_confirmation', 'Enquiry Confirmation', 'Sent to customers after submitting an enquiry', 'We''ve Received Your Enquiry - Touch Cleaning', '<div style="text-align: center; margin-bottom: 32px;"><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Thanks for Reaching Out!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">We''ve received your message</p></div><p>Hi {{name}},<br><br>Thank you for contacting Touch Cleaning! We''ve received your enquiry and our team will get back to you within 24 hours.</p>', 'transactional', '["name", "email", "message"]'),
('account_welcome', 'Account Welcome', 'Sent when a new account is created', 'Welcome to Touch Cleaning - Your {{role}} Account', '<div style="text-align: center; margin-bottom: 32px;"><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Welcome to Touch Cleaning!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">Your {{role}} account has been created</p></div><p>Hi {{full_name}},<br><br>Your account has been successfully created.</p><p><strong>Email:</strong> {{email}}</p><p><strong>Role:</strong> {{role}}</p>', 'transactional', '["full_name", "email", "role"]'),
('work_assignment', 'Work Assignment', 'Sent to staff when assigned to a job', 'New Job Assigned - {{service_type}}', '<div style="margin-bottom: 24px;"><h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e293b;">New Job Assigned</h2></div><p>Hi {{staff_name}},<br><br>You have been assigned a new cleaning job.</p><p><strong>Service:</strong> {{service_type}}</p><p><strong>Date:</strong> {{preferred_date}}</p><p><strong>Address:</strong> {{service_address}}</p><p><strong>Customer:</strong> {{customer_name}}</p><p><strong>Phone:</strong> {{customer_phone}}</p>', 'transactional', '["staff_name", "service_type", "preferred_date", "service_address", "customer_name", "customer_phone"]'),
('newsletter', 'Newsletter Welcome', 'Sent when someone subscribes to newsletter', 'Welcome to Touch Cleaning Newsletter! 🎉', '<div style="text-align: center; margin-bottom: 32px;"><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">Welcome to Our Newsletter!</h2><p style="margin: 0; font-size: 15px; color: #64748b;">You''re now part of the Touch Cleaning family</p></div><p style="text-align: center;">Thank you for subscribing! You''ll be the first to know about our latest cleaning tips, special offers, and exclusive promotions.</p>', 'marketing', '[]'),
('promotional', 'Promotional Email', 'Template for promotional campaigns', '{{subject}}', '<div style="text-align: center; margin-bottom: 32px;"><h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b;">{{heading}}</h2></div><div>{{content}}</div>', 'marketing', '["subject", "heading", "content"]');