import { supabase } from "@/integrations/supabase/client";

// Status badge color mapping for booking statuses
export const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  in_progress: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

// Fetch staff members with active status
export interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
}

export const fetchActiveStaff = async (): Promise<StaffMember[]> => {
  try {
    // Get all staff user IDs from user_roles
    const { data: staffRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "staff");

    if (rolesError || !staffRoles || staffRoles.length === 0) {
      return [];
    }

    const staffUserIds = staffRoles.map((r) => r.user_id);

    // Get profiles for these staff members
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", staffUserIds);

    if (profilesError || !profiles) {
      return [];
    }

    // Get staff details to check active status
    const { data: staffDetails } = await supabase
      .from("staff_details")
      .select("id, user_id, is_active")
      .in("user_id", staffUserIds);

    // Combine the data
    const combinedStaff: StaffMember[] = profiles.map((profile) => {
      const details = staffDetails?.find((d) => d.user_id === profile.id);
      return {
        id: details?.id || profile.id,
        user_id: profile.id,
        full_name: profile.full_name || "Unnamed Staff",
        phone: profile.phone,
        is_active: details?.is_active ?? true,
      };
    });

    // Filter to only active staff
    return combinedStaff.filter((s) => s.is_active);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
};

// Fetch customers with profiles
export interface CustomerOption {
  id: string;
  full_name: string;
  phone: string | null;
}

export const fetchCustomers = async (): Promise<CustomerOption[]> => {
  try {
    const { data: customerRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "customer");

    if (!customerRoles || customerRoles.length === 0) {
      return [];
    }

    const userIds = customerRoles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", userIds);

    if (!profiles) {
      return [];
    }

    return profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name || "Unknown",
      phone: p.phone,
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

// Format status for display
export const formatStatus = (status: string): string => {
  return status.replace(/_/g, " ");
};

// Format service type for display
export const formatServiceType = (serviceType: string): string => {
  return serviceType.replace(/_/g, " ");
};
