import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Settings {
  company_info: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
  };
  business_hours: {
    monday_friday: string;
    saturday: string;
    sunday: string;
    emergency: boolean;
  };
  stats: {
    clients: string;
    experience: string;
    satisfaction: string;
    support: string;
  };
  why_choose_us: string[];
  social_links: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
}

const defaultSettings: Settings = {
  company_info: {
    name: "Touch Cleaning",
    tagline: "Clean Place, Happier Face",
    phone: "+61 XXX XXX XXX",
    email: "info@touchcleaning.com.au",
    address: "Sydney, NSW, Australia",
  },
  business_hours: {
    monday_friday: "7:00 AM - 7:00 PM",
    saturday: "8:00 AM - 5:00 PM",
    sunday: "9:00 AM - 3:00 PM",
    emergency: true,
  },
  stats: {
    clients: "500+",
    experience: "15+",
    satisfaction: "100%",
    support: "24/7",
  },
  why_choose_us: [
    "Experienced and trained professionals",
    "Eco-friendly cleaning products",
    "Flexible scheduling options",
    "Competitive pricing",
    "Insured and bonded services",
    "Quality guaranteed results",
  ],
  social_links: {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
  },
};

const AdminCMSSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("cms_site_settings")
      .select("*");

    if (error) {
      toast.error("Failed to fetch settings");
      setLoading(false);
      return;
    }

    const loadedSettings = { ...defaultSettings };
    data?.forEach((item) => {
      if (item.setting_key in loadedSettings) {
        (loadedSettings as any)[item.setting_key] = item.setting_value;
      }
    });

    setSettings(loadedSettings);
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);

    const updates = Object.entries(settings).map(([key, value]) => ({
      setting_key: key,
      setting_value: value,
      category: key === "stats" || key === "why_choose_us" ? "homepage" : "general",
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("cms_site_settings")
        .upsert(update, { onConflict: "setting_key" });

      if (error) {
        toast.error(`Failed to save ${update.setting_key}`);
        setSaving(false);
        return;
      }
    }

    toast.success("Settings saved successfully");
    setSaving(false);
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Site Settings</h1>
            <p className="text-muted-foreground">Manage global website content and settings</p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>

        <Tabs defaultValue="company">
          <TabsList>
            <TabsTrigger value="company">Company Info</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
            <TabsTrigger value="stats">Homepage Stats</TabsTrigger>
            <TabsTrigger value="features">Why Choose Us</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic company details displayed across the website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={settings.company_info.name}
                      onChange={(e) =>
                        updateSetting("company_info", { ...settings.company_info, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={settings.company_info.tagline}
                      onChange={(e) =>
                        updateSetting("company_info", { ...settings.company_info, tagline: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={settings.company_info.phone}
                      onChange={(e) =>
                        updateSetting("company_info", { ...settings.company_info, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={settings.company_info.email}
                      onChange={(e) =>
                        updateSetting("company_info", { ...settings.company_info, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={settings.company_info.address}
                    onChange={(e) =>
                      updateSetting("company_info", { ...settings.company_info, address: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Operating hours displayed on contact page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Monday - Friday</Label>
                    <Input
                      value={settings.business_hours.monday_friday}
                      onChange={(e) =>
                        updateSetting("business_hours", { ...settings.business_hours, monday_friday: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Saturday</Label>
                    <Input
                      value={settings.business_hours.saturday}
                      onChange={(e) =>
                        updateSetting("business_hours", { ...settings.business_hours, saturday: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sunday</Label>
                    <Input
                      value={settings.business_hours.sunday}
                      onChange={(e) =>
                        updateSetting("business_hours", { ...settings.business_hours, sunday: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.business_hours.emergency}
                    onCheckedChange={(checked) =>
                      updateSetting("business_hours", { ...settings.business_hours, emergency: checked })
                    }
                  />
                  <Label>24/7 Emergency Services Available</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Statistics</CardTitle>
                <CardDescription>Key numbers displayed on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Satisfied Clients</Label>
                    <Input
                      value={settings.stats.clients}
                      onChange={(e) =>
                        updateSetting("stats", { ...settings.stats, clients: e.target.value })
                      }
                      placeholder="e.g., 500+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years Experience</Label>
                    <Input
                      value={settings.stats.experience}
                      onChange={(e) =>
                        updateSetting("stats", { ...settings.stats, experience: e.target.value })
                      }
                      placeholder="e.g., 15+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Satisfaction Rate</Label>
                    <Input
                      value={settings.stats.satisfaction}
                      onChange={(e) =>
                        updateSetting("stats", { ...settings.stats, satisfaction: e.target.value })
                      }
                      placeholder="e.g., 100%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Availability</Label>
                    <Input
                      value={settings.stats.support}
                      onChange={(e) =>
                        updateSetting("stats", { ...settings.stats, support: e.target.value })
                      }
                      placeholder="e.g., 24/7"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us</CardTitle>
                <CardDescription>Key benefits displayed on homepage (one per line)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.why_choose_us.join("\n")}
                  onChange={(e) =>
                    updateSetting("why_choose_us", e.target.value.split("\n").filter((l) => l.trim()))
                  }
                  rows={8}
                  placeholder="Experienced and trained professionals&#10;Eco-friendly cleaning products&#10;Flexible scheduling options"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Social media URLs for footer and contact page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input
                      value={settings.social_links.facebook}
                      onChange={(e) =>
                        updateSetting("social_links", { ...settings.social_links, facebook: e.target.value })
                      }
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={settings.social_links.instagram}
                      onChange={(e) =>
                        updateSetting("social_links", { ...settings.social_links, instagram: e.target.value })
                      }
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input
                      value={settings.social_links.linkedin}
                      onChange={(e) =>
                        updateSetting("social_links", { ...settings.social_links, linkedin: e.target.value })
                      }
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter/X</Label>
                    <Input
                      value={settings.social_links.twitter}
                      onChange={(e) =>
                        updateSetting("social_links", { ...settings.social_links, twitter: e.target.value })
                      }
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCMSSettings;