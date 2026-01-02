import { createContext, useContext, ReactNode } from "react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { AdminPermissions } from "@/hooks/useAdminPermissions";

export type { AdminPermissions };

interface AdminPermissionsContextType {
  permissions: AdminPermissions;
  loading: boolean;
  userId: string | null;
  hasPermission: (permission: keyof Omit<AdminPermissions, 'admin_level' | 'department'>) => boolean;
  isSuperAdmin: () => boolean;
  isManager: () => boolean;
  isSupervisor: () => boolean;
}

const AdminPermissionsContext = createContext<AdminPermissionsContextType | undefined>(undefined);

export const AdminPermissionsProvider = ({ children }: { children: ReactNode }) => {
  const permissionsData = useAdminPermissions();

  return (
    <AdminPermissionsContext.Provider value={permissionsData}>
      {children}
    </AdminPermissionsContext.Provider>
  );
};

export const useAdminPermissionsContext = () => {
  const context = useContext(AdminPermissionsContext);
  if (context === undefined) {
    throw new Error("useAdminPermissionsContext must be used within an AdminPermissionsProvider");
  }
  return context;
};
