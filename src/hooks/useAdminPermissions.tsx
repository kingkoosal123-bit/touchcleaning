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

// Full permissions for super/admin level users
const FULL_ACCESS_PERMISSIONS: AdminPermissions = {
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

// Check if admin_level grants full access
const isFullAccessLevel = (level: string): boolean => {
  return ['super', 'admin'].includes(level);
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
          const level = adminDetails.admin_level || "standard";
          
          // Super/admin levels get full permissions regardless of what's stored
          if (isFullAccessLevel(level)) {
            setPermissions({
              ...FULL_ACCESS_PERMISSIONS,
              admin_level: level,
              department: adminDetails.department,
            });
          } else {
            // Managers/supervisors get their assigned permissions
            setPermissions({
              can_manage_bookings: adminDetails.can_manage_bookings ?? false,
              can_manage_staff: adminDetails.can_manage_staff ?? false,
              can_manage_customers: adminDetails.can_manage_customers ?? false,
              can_manage_payments: adminDetails.can_manage_payments ?? false,
              can_manage_admins: adminDetails.can_manage_admins ?? false,
              can_view_reports: adminDetails.can_view_reports ?? false,
              can_edit_settings: adminDetails.can_edit_settings ?? false,
              admin_level: level,
              department: adminDetails.department,
            });
          }
        } else {
          // No admin_details record - legacy admin, grant full access
          console.log("No admin_details found, granting full access for legacy admin");
          setPermissions(FULL_ACCESS_PERMISSIONS);
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
    return isFullAccessLevel(permissions.admin_level);
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
