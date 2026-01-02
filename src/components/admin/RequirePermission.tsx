import { ReactNode } from "react";
import { useAdminPermissionsContext } from "@/contexts/AdminPermissionsContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";

type PermissionKey = "can_manage_bookings" | "can_manage_staff" | "can_manage_customers" | "can_manage_payments" | "can_manage_admins" | "can_view_reports" | "can_edit_settings";

interface RequirePermissionProps {
  children: ReactNode;
  permission: PermissionKey;
  fallback?: ReactNode;
}

export const RequirePermission = ({ children, permission, fallback }: RequirePermissionProps) => {
  const { hasPermission, isSuperAdmin, loading } = useAdminPermissionsContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Super admins can access everything
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check specific permission
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  // No permission - show fallback or access denied
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to access this section. Please contact your administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    </div>
  );
};
