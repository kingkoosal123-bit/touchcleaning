import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserCog, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CreateStaff = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Store current session before creating new user
    const { data: currentSession } = await supabase.auth.getSession();

    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update the user role to staff
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: "staff" })
          .eq("user_id", data.user.id);

        if (roleError) {
          // If update fails, try insert
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "staff",
          });
        }

        // Sign out the newly created user to restore admin session
        await supabase.auth.signOut();
        
        // Restore admin session if it existed
        if (currentSession?.session) {
          await supabase.auth.setSession({
            access_token: currentSession.session.access_token,
            refresh_token: currentSession.session.refresh_token,
          });
        }

        toast({
          title: "Staff Created",
          description: `Staff account for ${formData.fullName} has been created. They can now sign in at /auth`,
        });
        navigate("/admin/users");
      }
    } catch (error: any) {
      // Restore admin session on error
      if (currentSession?.session) {
        await supabase.auth.setSession({
          access_token: currentSession.session.access_token,
          refresh_token: currentSession.session.refresh_token,
        });
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create staff account",
      });
    }

    setIsLoading(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Staff Account</h1>
            <p className="text-muted-foreground">Add a new staff member to your team</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Staff Details
            </CardTitle>
            <CardDescription>
              Enter the details for the new staff member. They will be able to sign in using these credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@example.com"
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
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Staff Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> After creating the staff account, share the login credentials with the staff member. 
              They can sign in at <code className="bg-muted px-1 rounded">/auth</code> using their email and password.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateStaff;