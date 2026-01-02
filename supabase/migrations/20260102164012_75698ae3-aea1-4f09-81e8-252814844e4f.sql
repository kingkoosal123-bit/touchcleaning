-- RBAC hardening: restrict admin panel capabilities by admin_details permissions

-- 1) Permission checker (legacy admins without admin_details get full access)
create or replace function public.admin_has_permission(_user_id uuid, _perm text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  ad record;
begin
  -- Must be an admin (role stored in user_roles)
  if not public.has_role(_user_id, 'admin'::public.app_role) then
    return false;
  end if;

  select
    admin_level,
    coalesce(can_manage_bookings, false)   as can_manage_bookings,
    coalesce(can_manage_staff, false)      as can_manage_staff,
    coalesce(can_manage_customers, false)  as can_manage_customers,
    coalesce(can_manage_payments, false)   as can_manage_payments,
    coalesce(can_manage_admins, false)     as can_manage_admins,
    coalesce(can_view_reports, false)      as can_view_reports,
    coalesce(can_edit_settings, false)     as can_edit_settings
  into ad
  from public.admin_details
  where user_id = _user_id
  limit 1;

  -- Legacy admins created before admin_details existed: allow full access
  if not found then
    return true;
  end if;

  -- Full access for super/admin level
  if ad.admin_level in ('super', 'admin') then
    return true;
  end if;

  case _perm
    when 'can_manage_bookings'  then return ad.can_manage_bookings;
    when 'can_manage_staff'     then return ad.can_manage_staff;
    when 'can_manage_customers' then return ad.can_manage_customers;
    when 'can_manage_payments'  then return ad.can_manage_payments;
    when 'can_manage_admins'    then return ad.can_manage_admins;
    when 'can_view_reports'     then return ad.can_view_reports;
    when 'can_edit_settings'    then return ad.can_edit_settings;
    else return false;
  end case;
end;
$$;

-- 2) Restrict role management to admins who can manage admins
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins with admin-management permission can manage roles"
ON public.user_roles
FOR ALL
USING (public.admin_has_permission(auth.uid(), 'can_manage_admins'))
WITH CHECK (public.admin_has_permission(auth.uid(), 'can_manage_admins'));

CREATE POLICY "Admins with admin-management permission can view all roles"
ON public.user_roles
FOR SELECT
USING (public.admin_has_permission(auth.uid(), 'can_manage_admins'));

-- 3) Restrict website content changes (CMS) to admins who can edit settings
DO $$
BEGIN
  -- Services
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage services" ON public.cms_services';
  EXECUTE 'CREATE POLICY "Admins with settings permission can manage services" ON public.cms_services FOR ALL USING (public.admin_has_permission(auth.uid(), ''can_edit_settings'')) WITH CHECK (public.admin_has_permission(auth.uid(), ''can_edit_settings''))';

  -- Blog
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.cms_blog_posts';
  EXECUTE 'CREATE POLICY "Admins with settings permission can manage blog posts" ON public.cms_blog_posts FOR ALL USING (public.admin_has_permission(auth.uid(), ''can_edit_settings'')) WITH CHECK (public.admin_has_permission(auth.uid(), ''can_edit_settings''))';

  -- Gallery
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage gallery" ON public.cms_gallery';
  EXECUTE 'CREATE POLICY "Admins with settings permission can manage gallery" ON public.cms_gallery FOR ALL USING (public.admin_has_permission(auth.uid(), ''can_edit_settings'')) WITH CHECK (public.admin_has_permission(auth.uid(), ''can_edit_settings''))';

  -- Locations
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage locations" ON public.cms_locations';
  EXECUTE 'CREATE POLICY "Admins with settings permission can manage locations" ON public.cms_locations FOR ALL USING (public.admin_has_permission(auth.uid(), ''can_edit_settings'')) WITH CHECK (public.admin_has_permission(auth.uid(), ''can_edit_settings''))';

  -- Team
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage team members" ON public.cms_team_members';
  EXECUTE 'CREATE POLICY "Admins with settings permission can manage team members" ON public.cms_team_members FOR ALL USING (public.admin_has_permission(auth.uid(), ''can_edit_settings'')) WITH CHECK (public.admin_has_permission(auth.uid(), ''can_edit_settings''))';

  -- Site settings
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage site settings" ON public.cms_site_settings';
  EXECUTE 'CREATE POLICY "Admins with settings permission can manage site settings" ON public.cms_site_settings FOR ALL USING (public.admin_has_permission(auth.uid(), ''can_edit_settings'')) WITH CHECK (public.admin_has_permission(auth.uid(), ''can_edit_settings''))';

  -- Enquiries are customer-facing ops: tie to customer-management permission
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.cms_enquiries';
  EXECUTE 'CREATE POLICY "Admins with customer-management permission can manage enquiries" ON public.cms_enquiries FOR ALL USING (public.admin_has_permission(auth.uid(), ''can_manage_customers'')) WITH CHECK (public.admin_has_permission(auth.uid(), ''can_manage_customers''))';
END $$;