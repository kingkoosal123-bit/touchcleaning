-- Fix the admin_level check constraint to include 'admin' and 'manager' and 'supervisor'
ALTER TABLE public.admin_details DROP CONSTRAINT admin_details_admin_level_check;
ALTER TABLE public.admin_details ADD CONSTRAINT admin_details_admin_level_check
  CHECK (admin_level = ANY (ARRAY['standard'::text, 'senior'::text, 'super'::text, 'admin'::text, 'manager'::text, 'supervisor'::text]));

-- Now upgrade existing standard-level admins to super (full access)
UPDATE public.admin_details
SET admin_level = 'super',
    can_manage_bookings = true,
    can_manage_staff = true,
    can_manage_customers = true,
    can_manage_payments = true,
    can_manage_admins = true,
    can_view_reports = true,
    can_edit_settings = true,
    updated_at = now()
WHERE admin_level = 'standard'
  AND user_id IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  );

-- Create admin_details records for admins that don't have one (with super level)
INSERT INTO public.admin_details (user_id, admin_level, can_manage_bookings, can_manage_staff, can_manage_customers, can_manage_payments, can_manage_admins, can_view_reports, can_edit_settings)
SELECT ur.user_id, 'super', true, true, true, true, true, true, true
FROM public.user_roles ur
WHERE ur.role = 'admin'
  AND NOT EXISTS (SELECT 1 FROM public.admin_details ad WHERE ad.user_id = ur.user_id);

-- Fix admin_details RLS policies
DROP POLICY IF EXISTS "Admins can view own details" ON public.admin_details;
DROP POLICY IF EXISTS "Super admins can manage all admin details" ON public.admin_details;

-- Any admin can view their own details
CREATE POLICY "Admins can view their own details"
ON public.admin_details
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins with can_manage_admins permission can manage all admin details
CREATE POLICY "Admins with permission can manage all admin details"
ON public.admin_details
FOR ALL
USING (public.admin_has_permission(auth.uid(), 'can_manage_admins'))
WITH CHECK (public.admin_has_permission(auth.uid(), 'can_manage_admins'));

-- Ensure user_roles can be read by users viewing their own role
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);