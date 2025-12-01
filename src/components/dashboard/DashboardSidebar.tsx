import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  UserCog, 
  ClipboardList,
  User
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";

export function DashboardSidebar() {
  const { open, setOpen } = useSidebar();
  const { isAdmin, isStaff } = useUserRole();

  const adminItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Users", url: "/dashboard/users", icon: Users },
    { title: "Bookings", url: "/dashboard/bookings", icon: Calendar },
    { title: "SEO Settings", url: "/dashboard/seo", icon: BarChart3 },
    { title: "Staff", url: "/dashboard/staff", icon: UserCog },
  ];

  const staffItems = [
    { title: "My Jobs", url: "/dashboard", icon: ClipboardList },
    { title: "Schedule", url: "/dashboard/schedule", icon: Calendar },
  ];

  const customerItems = [
    { title: "My Profile", url: "/dashboard", icon: User },
    { title: "My Bookings", url: "/dashboard/bookings", icon: Calendar },
  ];

  const items = isAdmin ? adminItems : isStaff ? staffItems : customerItems;

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdmin ? "Admin Panel" : isStaff ? "Staff Portal" : "My Account"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}