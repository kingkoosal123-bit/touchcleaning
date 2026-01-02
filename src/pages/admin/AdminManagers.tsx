import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, UserPlus, Shield, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminUser {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  admin_level: string | null;
  department: string | null;
  can_manage_bookings: boolean | null;
  can_manage_customers: boolean | null;
  can_manage_staff: boolean | null;
  can_manage_payments: boolean | null;
  can_manage_admins: boolean | null;
  can_view_reports: boolean | null;
  can_edit_settings: boolean | null;
}

const AdminManagers = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    // Fetch admin roles
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      setAdmins([]);
      setLoading(false);
      return;
    }

    const adminIds = adminRoles.map((r) => r.user_id);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", adminIds);

    // Fetch admin details
    const { data: adminDetails } = await supabase
      .from("admin_details")
      .select("*")
      .in("user_id", adminIds);

    // Combine data
    const adminsWithDetails: AdminUser[] = (profiles || []).map((profile) => {
      const details = adminDetails?.find((d) => d.user_id === profile.id);
      return {
        id: details?.id || "",
        user_id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        admin_level: details?.admin_level || "standard",
        department: details?.department || null,
        can_manage_bookings: details?.can_manage_bookings ?? true,
        can_manage_customers: details?.can_manage_customers ?? true,
        can_manage_staff: details?.can_manage_staff ?? true,
        can_manage_payments: details?.can_manage_payments ?? true,
        can_manage_admins: details?.can_manage_admins ?? false,
        can_view_reports: details?.can_view_reports ?? true,
        can_edit_settings: details?.can_edit_settings ?? false,
      };
    });

    setAdmins(adminsWithDetails);
    setLoading(false);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditDialogOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;

    const { error } = await supabase
      .from("admin_details")
      .update({
        admin_level: editingAdmin.admin_level,
        department: editingAdmin.department,
        can_manage_bookings: editingAdmin.can_manage_bookings,
        can_manage_customers: editingAdmin.can_manage_customers,
        can_manage_staff: editingAdmin.can_manage_staff,
        can_manage_payments: editingAdmin.can_manage_payments,
        can_manage_admins: editingAdmin.can_manage_admins,
        can_view_reports: editingAdmin.can_view_reports,
        can_edit_settings: editingAdmin.can_edit_settings,
      })
      .eq("user_id", editingAdmin.user_id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update admin" });
    } else {
      toast({ title: "Success", description: "Admin updated successfully" });
      setEditDialogOpen(false);
      fetchAdmins();
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    // Remove admin role and details, make them a customer
    await supabase.from("user_roles").delete().eq("user_id", admin.user_id);
    await supabase.from("admin_details").delete().eq("user_id", admin.user_id);
    await supabase.from("user_roles").insert({ user_id: admin.user_id, role: "customer" });
    
    // Create customer details
    await supabase.from("customer_details").upsert({
      user_id: admin.user_id,
      referral_code: admin.user_id.substring(0, 8).toUpperCase(),
    });

    toast({ title: "Success", description: "Admin access removed. User is now a customer." });
    fetchAdmins();
  };

  const getAdminLevelBadge = (level: string | null) => {
    switch (level) {
      case "admin":
        return <Badge className="bg-destructive text-destructive-foreground">Admin</Badge>;
      case "manager":
        return <Badge className="bg-primary text-primary-foreground">Manager</Badge>;
      case "supervisor":
        return <Badge variant="secondary">Supervisor</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    return (
      (admin.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (admin.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (admin.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
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
      <RequirePermission permission="can_manage_admins">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin & Manager Users</h1>
            <p className="text-muted-foreground">Manage administrators and managers who can access this dashboard</p>
          </div>
          <Button asChild>
            <Link to="/admin/managers/create">
              <Shield className="h-4 w-4 mr-2" />
              Create Admin/Manager
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{admins.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{admins.filter(a => a.admin_level === "admin").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{admins.filter(a => a.admin_level === "manager").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Supervisors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{admins.filter(a => a.admin_level === "supervisor").length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.user_id}>
                    <TableCell>
                      <p className="font-medium">{admin.full_name || "No name"}</p>
                    </TableCell>
                    <TableCell>{admin.phone || "N/A"}</TableCell>
                    <TableCell>{getAdminLevelBadge(admin.admin_level)}</TableCell>
                    <TableCell>{admin.department || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.can_manage_bookings && <Badge variant="outline" className="text-xs">Bookings</Badge>}
                        {admin.can_manage_staff && <Badge variant="outline" className="text-xs">Staff</Badge>}
                        {admin.can_manage_customers && <Badge variant="outline" className="text-xs">Customers</Badge>}
                        {admin.can_manage_admins && <Badge variant="outline" className="text-xs">Admins</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(admin.created_at), "PP")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditAdmin(admin)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Admin Access?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove admin privileges from {admin.full_name}. They will become a regular customer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAdmin(admin)}>
                                Remove Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAdmins.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No admin/manager users found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit: {editingAdmin?.full_name}</DialogTitle>
          </DialogHeader>
          {editingAdmin && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role Type</Label>
                <Select
                  value={editingAdmin.admin_level || "standard"}
                  onValueChange={(value) => setEditingAdmin({ ...editingAdmin, admin_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (Full Access)</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={editingAdmin.department || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, department: e.target.value })}
                  placeholder="e.g., Operations"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "can_manage_bookings", label: "Manage Bookings" },
                    { key: "can_manage_customers", label: "Manage Customers" },
                    { key: "can_manage_staff", label: "Manage Staff" },
                    { key: "can_manage_payments", label: "Manage Payments" },
                    { key: "can_manage_admins", label: "Manage Admins" },
                    { key: "can_view_reports", label: "View Reports" },
                    { key: "can_edit_settings", label: "Edit Settings" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editingAdmin[key as keyof AdminUser] as boolean}
                        onChange={(e) =>
                          setEditingAdmin({ ...editingAdmin, [key]: e.target.checked })
                        }
                        className="rounded border-input"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAdmin}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </RequirePermission>
    </AdminLayout>
  );
};

export default AdminManagers;