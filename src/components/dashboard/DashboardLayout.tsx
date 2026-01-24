import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import Navbar from "@/components/Navbar";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // Auto-logout after 15 minutes of inactivity
  useInactivityTimeout();

  return (
    <>
      <Navbar />
      <SidebarProvider>
        <div className="flex min-h-screen w-full pt-20">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <div className="mb-4">
              <SidebarTrigger />
            </div>
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};