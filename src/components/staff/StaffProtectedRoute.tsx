import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { StaffLayout } from "./StaffLayout";

export const StaffProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isStaff, isAdmin, isCustomer, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading staff portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Strict role enforcement: redirect admins to admin portal
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Redirect customers to their dashboard
  if (isCustomer) {
    return <Navigate to="/dashboard" replace />;
  }

  // Only staff can access
  if (!isStaff) {
    return <Navigate to="/auth" replace />;
  }

  return <StaffLayout>{children}</StaffLayout>;
};
