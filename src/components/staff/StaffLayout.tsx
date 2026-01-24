import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  CheckCircle,
  DollarSign,
  Calendar,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";

const sidebarItems = [
  { title: "My Jobs", href: "/staff", icon: Briefcase, end: true },
  { title: "Completed", href: "/staff/completed", icon: CheckCircle },
  { title: "Schedule", href: "/staff/schedule", icon: Calendar },
  { title: "Earnings", href: "/staff/earnings", icon: DollarSign },
];

export const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-logout after 15 minutes of inactivity
  useInactivityTimeout();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "ST";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:block">Staff Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" id="notification-bell">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center notification-count hidden">
              0
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Staff Account</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/staff/profile")}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                Go to Website
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border hidden lg:block z-40">
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};
