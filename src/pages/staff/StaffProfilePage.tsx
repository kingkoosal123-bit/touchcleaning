import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
}

interface StaffDetails {
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  transport_type: string | null;
}

const StaffProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [staffDetails, setStaffDetails] = useState<StaffDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [profileRes, staffRes] = await Promise.all([
      supabase.from("profiles").select("full_name, phone, address").eq("id", user.id).single(),
      supabase
        .from("staff_details")
        .select("emergency_contact_name, emergency_contact_phone, emergency_contact_relation, transport_type")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
    }
    if (staffRes.data) {
      setStaffDetails(staffRes.data);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile" });
    } else {
      toast({ title: "Success", description: "Profile updated" });
    }

    setSaving(false);
  };

  const handleSaveEmergencyContact = async () => {
    if (!user || !staffDetails) return;
    setSaving(true);

    const { error } = await supabase
      .from("staff_details")
      .update({
        emergency_contact_name: staffDetails.emergency_contact_name,
        emergency_contact_phone: staffDetails.emergency_contact_phone,
        emergency_contact_relation: staffDetails.emergency_contact_relation,
        transport_type: staffDetails.transport_type,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update details" });
    } else {
      toast({ title: "Success", description: "Details updated" });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your basic contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile?.full_name || ""}
              onChange={(e) => setProfile((prev) => prev ? { ...prev, full_name: e.target.value } : null)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile?.phone || ""}
              onChange={(e) => setProfile((prev) => prev ? { ...prev, phone: e.target.value } : null)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile?.address || ""}
              onChange={(e) => setProfile((prev) => prev ? { ...prev, address: e.target.value } : null)}
              placeholder="Enter your address"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {staffDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
            <CardDescription>Contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_name">Contact Name</Label>
              <Input
                id="emergency_name"
                value={staffDetails.emergency_contact_name || ""}
                onChange={(e) =>
                  setStaffDetails((prev) => prev ? { ...prev, emergency_contact_name: e.target.value } : null)
                }
                placeholder="Emergency contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Contact Phone</Label>
              <Input
                id="emergency_phone"
                value={staffDetails.emergency_contact_phone || ""}
                onChange={(e) =>
                  setStaffDetails((prev) => prev ? { ...prev, emergency_contact_phone: e.target.value } : null)
                }
                placeholder="Emergency contact phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_relation">Relationship</Label>
              <Input
                id="emergency_relation"
                value={staffDetails.emergency_contact_relation || ""}
                onChange={(e) =>
                  setStaffDetails((prev) => prev ? { ...prev, emergency_contact_relation: e.target.value } : null)
                }
                placeholder="e.g. Spouse, Parent, Sibling"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="transport">Transport Type</Label>
              <Input
                id="transport"
                value={staffDetails.transport_type || ""}
                onChange={(e) =>
                  setStaffDetails((prev) => prev ? { ...prev, transport_type: e.target.value } : null)
                }
                placeholder="e.g. Car, Public Transport, Bicycle"
              />
            </div>

            <Button onClick={handleSaveEmergencyContact} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Emergency Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffProfilePage;
