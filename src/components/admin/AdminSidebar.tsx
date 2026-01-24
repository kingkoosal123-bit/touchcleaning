import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  Settings,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut,
  Building2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/touch-cleaning-logo.svg";
import { useAdminPermissionsContext } from "@/contexts/AdminPermissionsContext";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: { title: string; path: string }[];
  requiredPermission?: string;
}

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, hasPermission, isSuperAdmin, loading } = useAdminPermissionsContext();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Booking Management", "User Management", "Staff Management", "CMS"]);

  // Build menu items based on permissions
  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [
      { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    ];

    // Booking Management - requires can_manage_bookings
    if (hasPermission("can_manage_bookings") || isSuperAdmin()) {
      items.push({
        title: "Booking Management",
        icon: Calendar,
        requiredPermission: "can_manage_bookings",
        children: [
          { title: "All Bookings", path: "/admin/bookings" },
          { title: "Create Booking", path: "/admin/bookings/create" },
        ],
      });
    }

    // Customer Management - requires can_manage_customers
    if (hasPermission("can_manage_customers") || isSuperAdmin()) {
      items.push({
        title: "Customer Management",
        icon: Users,
        requiredPermission: "can_manage_customers",
        children: [
          { title: "Customer Database", path: "/admin/customers" },
          { title: "Enquiries", path: "/admin/cms/enquiries" },
        ],
      });
    }

    // Staff Management - requires can_manage_staff
    if (hasPermission("can_manage_staff") || isSuperAdmin()) {
      const staffChildren = [
        { title: "Staff Database", path: "/admin/staff" },
        { title: "Create Staff", path: "/admin/staff/create" },
      ];

      // Payroll requires can_manage_payments
      if (hasPermission("can_manage_payments") || isSuperAdmin()) {
        staffChildren.push(
          { title: "Payroll from Bookings", path: "/admin/booking-payroll" },
          { title: "Payroll Management", path: "/admin/payroll" }
        );
      }

      items.push({
        title: "Staff Management",
        icon: UserCog,
        requiredPermission: "can_manage_staff",
        children: staffChildren,
      });
    }

    // Admin Management - requires can_manage_admins
    if (hasPermission("can_manage_admins") || isSuperAdmin()) {
      items.push({
        title: "Admin Management",
        icon: Building2,
        requiredPermission: "can_manage_admins",
        children: [
          { title: "Admin Users", path: "/admin/managers" },
          { title: "Create Admin", path: "/admin/managers/create" },
        ],
      });
    }

    // CMS - requires can_edit_settings
    if (hasPermission("can_edit_settings") || isSuperAdmin()) {
      items.push({
        title: "CMS",
        icon: Palette,
        requiredPermission: "can_edit_settings",
        children: [
          { title: "Services", path: "/admin/cms/services" },
          { title: "Team Members", path: "/admin/cms/team" },
          { title: "Locations", path: "/admin/cms/locations" },
          { title: "Gallery", path: "/admin/cms/gallery" },
          { title: "Blog Posts", path: "/admin/cms/blog" },
          { title: "Site Settings", path: "/admin/cms/settings" },
        ],
      });
    }

    // Reports & Analytics - requires can_view_reports
    if (hasPermission("can_view_reports") || isSuperAdmin()) {
      items.push({ 
        title: "Reports & Analytics", 
        icon: BarChart3, 
        path: "/admin/analytics",
        requiredPermission: "can_view_reports",
      });
    }

    // SEO Settings - requires can_edit_settings
    if (hasPermission("can_edit_settings") || isSuperAdmin()) {
      items.push({ 
        title: "SEO Settings", 
        icon: FileText, 
        path: "/admin/seo",
        requiredPermission: "can_edit_settings",
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => {
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/admin");
  };

  if (loading) {
    return (
      <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Touch Cleaning" className="h-10 w-auto" />
            <div>
              <p className="font-semibold text-sm">Touch Cleaning</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Touch Cleaning" className="h-10 w-auto" />
          <div>
            <p className="font-semibold text-sm">Touch Cleaning</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  {expandedItems.includes(item.title) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedItems.includes(item.title) && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive(child.path)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.path!)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
};
