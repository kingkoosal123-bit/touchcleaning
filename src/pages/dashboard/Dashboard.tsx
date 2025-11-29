import { useUserRole } from "@/hooks/useUserRole";
import { AdminDashboard } from "./AdminDashboard";
import { StaffDashboard } from "./StaffDashboard";
import { CustomerDashboard } from "./CustomerDashboard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Dashboard = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {role === "admin" && <AdminDashboard />}
      {role === "staff" && <StaffDashboard />}
      {role === "customer" && <CustomerDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;