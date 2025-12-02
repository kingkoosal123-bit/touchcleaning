import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, UserPlus, Shield, UserCog, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: AppRole;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch users" });
      setLoading(false);
      return;
    }

    // Fetch all user roles
    const { data: roles } = await supabase.from("user_roles").select("*");

    // Combine profiles with roles
    const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.id);
      return {
        id: profile.id,
        email: "", // We don't have email in profiles, would need to join with auth.users
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        role: (userRole?.role as AppRole) || "customer",
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    // First, delete existing role
    await supabase.from("user_roles").delete().eq("user_id", userId);

    // Then insert new role
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: newRole,
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update role" });
    } else {
      toast({ title: "Success", description: "User role updated" });
      fetchUsers();
    }
  };

  const getRoleBadge = (role: AppRole) => {
    const config: Record<AppRole, { icon: React.ElementType; color: string }> = {
      admin: { icon: Shield, color: "bg-red-500" },
      staff: { icon: UserCog, color: "bg-blue-500" },
      customer: { icon: User, color: "bg-green-500" },
    };
    const { icon: Icon, color } = config[role];
    return (
      <Badge className={`${color} text-white flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">View and manage all users</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/admin/users/create-staff">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Staff
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/users/create-admin">
                <Shield className="h-4 w-4 mr-2" />
                Create Admin
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.full_name || "No name"}</p>
                    </TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{format(new Date(user.created_at), "PP")}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value as AppRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;