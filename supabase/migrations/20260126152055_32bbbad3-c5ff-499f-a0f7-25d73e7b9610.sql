-- Fix the cms_enquiries RLS policy - the current INSERT policy allows anyone to write any data
-- We need to keep public INSERT for contact forms but ensure no malicious data can be inserted

-- First, drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Public can create enquiries" ON public.cms_enquiries;

-- Create a proper INSERT policy that allows public submissions but with proper constraints
-- We use WITH CHECK to ensure the data being inserted has required fields
CREATE POLICY "Public can create enquiries"
ON public.cms_enquiries
FOR INSERT
WITH CHECK (
  -- Ensure required fields are provided
  name IS NOT NULL AND 
  email IS NOT NULL AND 
  message IS NOT NULL AND
  -- Ensure status defaults are respected
  (status IS NULL OR status = 'new') AND
  -- Ensure response fields are not set on insert
  responded_at IS NULL AND
  responded_by IS NULL
);

-- Enable RLS on booking_analytics view (if not already)
-- Note: This is a view, so we need to ensure its security
-- Views inherit RLS from underlying tables, but we should check access
-- For views with security_invoker, add explicit policy

-- Add RLS policy for the booking_analytics view to restrict to admins only
-- First check if RLS is enabled (views don't have RLS by default)
-- Since booking_analytics is a VIEW, we need to recreate it with security_invoker
DROP VIEW IF EXISTS public.booking_analytics;

CREATE VIEW public.booking_analytics
WITH (security_invoker = true) AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  COUNT(*) as total_bookings,
  COALESCE(SUM(actual_cost) FILTER (WHERE status = 'completed'), 0) as total_revenue,
  COALESCE(AVG(actual_cost) FILTER (WHERE status = 'completed'), 0) as avg_booking_value,
  (SELECT COUNT(DISTINCT user_id) FROM public.user_roles WHERE role = 'customer') as total_customers,
  (SELECT COUNT(DISTINCT user_id) FROM public.staff_details WHERE is_active = true) as active_staff
FROM public.bookings;