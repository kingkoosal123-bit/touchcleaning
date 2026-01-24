import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

export const CustomerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isCustomer, isAdmin, isStaff, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Strict role enforcement: redirect non-customers to their proper portal
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isStaff) {
    return <Navigate to="/staff" replace />;
  }

  // Only customers can access
  if (!isCustomer) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
