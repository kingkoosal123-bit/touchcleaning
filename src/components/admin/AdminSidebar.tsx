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
  Globe,
  Image,
  Newspaper,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/touch-cleaning-logo.svg";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  {
    title: "Booking Management",
    icon: Calendar,
    children: [
      { title: "All Bookings", path: "/admin/bookings" },
      { title: "Create Booking", path: "/admin/bookings/create" },
      { title: "Assign Staff", path: "/admin/bookings/assign" },
    ],
  },
  {
    title: "Customer Management",
    icon: Users,
    children: [
      { title: "Customer Database", path: "/admin/customers" },
      { title: "Enquiries", path: "/admin/cms/enquiries" },
    ],
  },
  {
    title: "Staff Management",
    icon: UserCog,
    children: [
      { title: "Staff Database", path: "/admin/staff" },
      { title: "Create Staff", path: "/admin/users/create-staff" },
      { title: "Payroll Management", path: "/admin/payroll" },
    ],
  },
  {
    title: "User Management",
    icon: Building2,
    children: [
      { title: "All Users", path: "/admin/users" },
      { title: "Create Admin", path: "/admin/users/create-admin" },
    ],
  },
  {
    title: "CMS",
    icon: Palette,
    children: [
      { title: "Services", path: "/admin/cms/services" },
      { title: "Team Members", path: "/admin/cms/team" },
      { title: "Locations", path: "/admin/cms/locations" },
      { title: "Gallery", path: "/admin/cms/gallery" },
      { title: "Blog Posts", path: "/admin/cms/blog" },
      { title: "Site Settings", path: "/admin/cms/settings" },
    ],
  },
  { title: "Reports & Analytics", icon: BarChart3, path: "/admin/analytics" },
  { title: "SEO Settings", icon: FileText, path: "/admin/seo" },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Booking Management", "User Management", "Staff Management", "CMS"]);

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