import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminPermissions {
  can_manage_bookings: boolean;
  can_manage_staff: boolean;
  can_manage_customers: boolean;
  can_manage_payments: boolean;
  can_manage_admins: boolean;
  can_view_reports: boolean;
  can_edit_settings: boolean;
  admin_level: string;
  department: string | null;
}

const DEFAULT_PERMISSIONS: AdminPermissions = {
  can_manage_bookings: false,
  can_manage_staff: false,
  can_manage_customers: false,
  can_manage_payments: false,
  can_manage_admins: false,
  can_view_reports: false,
  can_edit_settings: false,
  admin_level: "standard",
  department: null,
};

// Full permissions for super admins
const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  can_manage_bookings: true,
  can_manage_staff: true,
  can_manage_customers: true,
  can_manage_payments: true,
  can_manage_admins: true,
  can_view_reports: true,
  can_edit_settings: true,
  admin_level: "super",
  department: null,
};

export const useAdminPermissions = () => {
  const [permissions, setPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Check if user has admin role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          setLoading(false);
          return;
        }

        // Fetch admin details with permissions
        const { data: adminDetails, error } = await supabase
          .from("admin_details")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching admin permissions:", error);
          setLoading(false);
          return;
        }

        if (adminDetails) {
          // Super admins get all permissions regardless of what's stored
          if (adminDetails.admin_level === "super" || adminDetails.admin_level === "admin") {
            setPermissions(SUPER_ADMIN_PERMISSIONS);
          } else {
            setPermissions({
              can_manage_bookings: adminDetails.can_manage_bookings ?? false,
              can_manage_staff: adminDetails.can_manage_staff ?? false,
              can_manage_customers: adminDetails.can_manage_customers ?? false,
              can_manage_payments: adminDetails.can_manage_payments ?? false,
              can_manage_admins: adminDetails.can_manage_admins ?? false,
              can_view_reports: adminDetails.can_view_reports ?? false,
              can_edit_settings: adminDetails.can_edit_settings ?? false,
              admin_level: adminDetails.admin_level || "standard",
              department: adminDetails.department,
            });
          }
        } else {
          // No admin_details record - create one with default permissions
          // This shouldn't happen normally, but handle it gracefully
          setPermissions(DEFAULT_PERMISSIONS);
        }
      } catch (error) {
        console.error("Error in useAdminPermissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Helper functions for checking permissions
  const hasPermission = (permission: keyof Omit<AdminPermissions, 'admin_level' | 'department'>) => {
    return permissions[permission] === true;
  };

  const isSuperAdmin = () => {
    return permissions.admin_level === "super" || permissions.admin_level === "admin";
  };

  const isManager = () => {
    return permissions.admin_level === "manager";
  };

  const isSupervisor = () => {
    return permissions.admin_level === "supervisor";
  };

  return {
    permissions,
    loading,
    userId,
    hasPermission,
    isSuperAdmin,
    isManager,
    isSupervisor,
  };
};
