import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, AlertTriangle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CreateAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    adminLevel: "admin",
    department: "",
  });
  const [permissions, setPermissions] = useState({
    can_manage_bookings: true,
    can_manage_staff: false,
    can_manage_customers: true,
    can_manage_payments: false,
    can_manage_admins: false,
    can_view_reports: true,
    can_edit_settings: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePermissionChange = (key: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated. Please log in again.");
      }

      console.log("Creating admin with data:", {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: "admin",
        adminLevel: formData.adminLevel,
        department: formData.department || null,
        permissions: permissions,
      });

      // Call edge function to create admin user
      const response = await supabase.functions.invoke("create-user-with-role", {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          role: "admin",
          adminLevel: formData.adminLevel,
          department: formData.department || null,
          permissions: permissions,
        },
      });

      console.log("Edge function response:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "Failed to create admin");
      }

      if (!response.data?.success) {
        console.error("Edge function failed:", response.data);
        throw new Error(response.data?.error || "Failed to create admin");
      }

      toast({
        title: "Admin Created",
        description: `Admin account for ${formData.fullName} has been created successfully.`,
      });
      navigate("/admin/managers");
    } catch (error: any) {
      console.error("Create admin error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create admin account",
      });
    }

    setIsLoading(false);
  };

  const permissionsList = [
    { key: "can_manage_bookings", label: "Manage Bookings", description: "View, create, and modify bookings" },
    { key: "can_manage_staff", label: "Manage Staff", description: "Add, edit, and manage staff members" },
    { key: "can_manage_customers", label: "Manage Customers", description: "View and manage customer accounts" },
    { key: "can_manage_payments", label: "Manage Payments & Payroll", description: "Process payments and manage payroll" },
    { key: "can_manage_admins", label: "Manage Admins", description: "Create and manage other admin accounts" },
    { key: "can_view_reports", label: "View Reports", description: "Access analytics and reports" },
    { key: "can_edit_settings", label: "Edit Settings", description: "Modify system settings" },
  ];

  return (
    <AdminLayout>
      <RequirePermission permission="can_manage_admins">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/managers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Admin/Manager Account</h1>
            <p className="text-muted-foreground">Add a new administrator or manager with custom permissions</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Admin/Manager accounts have access to admin dashboard based on permissions. Only create accounts for trusted personnel.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Details
              </CardTitle>
              <CardDescription>
                Enter the details for the new administrator/manager.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Admin Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+61 400 000 000"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminLevel">Role Type</Label>
                  <Select value={formData.adminLevel} onValueChange={(v) => setFormData({ ...formData, adminLevel: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="manager">Manager (Limited Access)</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Operations"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Access Permissions
              </CardTitle>
              <CardDescription>
                Select what this user can access and manage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissionsList.map((perm) => (
                  <div key={perm.key} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id={perm.key}
                      checked={permissions[perm.key as keyof typeof permissions]}
                      onCheckedChange={() => handlePermissionChange(perm.key as keyof typeof permissions)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={perm.key} className="font-medium cursor-pointer">
                        {perm.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{perm.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> After creating the account, share the login credentials with the user. 
              They can sign in at <code className="bg-muted px-1 rounded">/auth/admin</code> using their email and password.
            </p>
          </CardContent>
        </Card>
      </div>
      </RequirePermission>
    </AdminLayout>
  );
};

export default CreateAdmin;