import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Save, Users, Eye, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Recipient {
  id: string;
  email: string;
  name: string | null;
}

const CreateEmailCampaign = () => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    html_content: "",
    target_audience: "all_customers",
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipients(formData.target_audience);
  }, [formData.target_audience]);

  const fetchRecipients = async (audience: string) => {
    setLoadingRecipients(true);
    try {
      let roleFilter: "customer" | "staff" | null = "customer";
      if (audience === "all_staff") roleFilter = "staff";
      else if (audience === "all_users") roleFilter = null;

      if (roleFilter === null) {
        // Get all profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name");

        // Get user roles to identify users
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id");

        const userIds = roles?.map(r => r.user_id) || [];
        const validProfiles = profiles?.filter(p => userIds.includes(p.id)) || [];

        setRecipients(validProfiles.map(p => ({
          id: p.id,
          email: "",
          name: p.full_name,
        })));
      } else {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", roleFilter);

        if (roles && roles.length > 0) {
          const userIds = roles.map(r => r.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);

          setRecipients(profiles?.map(p => ({
            id: p.id,
            email: "",
            name: p.full_name,
          })) || []);
        } else {
          setRecipients([]);
        }
      }
    } catch (error) {
      console.error("Error fetching recipients:", error);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.name || !formData.subject || !formData.html_content) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("bulk_email_campaigns")
        .insert({
          name: formData.name,
          subject: formData.subject,
          html_content: formData.html_content,
          target_audience: formData.target_audience,
          status: "draft",
          total_recipients: recipients.length,
          created_by: user.id,
        });

      if (error) throw error;

      toast({ title: "Success", description: "Campaign saved as draft" });
      navigate("/admin/email/campaigns");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save campaign" });
    } finally {
      setSaving(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!formData.name || !formData.subject || !formData.html_content) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields" });
      return;
    }

    if (recipients.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "No recipients found for this audience" });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("bulk_email_campaigns")
        .insert({
          name: formData.name,
          subject: formData.subject,
          html_content: formData.html_content,
          target_audience: formData.target_audience,
          status: "sending",
          total_recipients: recipients.length,
          created_by: user.id,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Insert recipients
      const recipientRecords = recipients.map(r => ({
        campaign_id: campaign.id,
        user_id: r.id,
        email: r.email || "",
        name: r.name,
        status: "pending",
      }));

      const { error: recipientsError } = await supabase
        .from("bulk_email_recipients")
        .insert(recipientRecords);

      if (recipientsError) throw recipientsError;

      // Call edge function to send bulk emails
      const { error: sendError } = await supabase.functions.invoke("send-bulk-email", {
        body: { campaignId: campaign.id },
      });

      if (sendError) {
        console.error("Error sending bulk email:", sendError);
        // Update campaign status to failed
        await supabase
          .from("bulk_email_campaigns")
          .update({ status: "failed" })
          .eq("id", campaign.id);
        throw sendError;
      }

      toast({ title: "Success", description: "Campaign is being sent!" });
      navigate("/admin/email/campaigns");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send campaign" });
    } finally {
      setSending(false);
    }
  };

  const getPreviewHtml = () => {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f7fa;}</style></head><body><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 40px;text-align:center;"><h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;">Touch Cleaning</h1><p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Professional Cleaning Services</p></div><div style="padding:40px;">${formData.html_content || "<p>Your email content will appear here...</p>"}</div><div style="background:#f8fafc;padding:32px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0 0 8px;font-size:14px;color:#64748b;"><strong style="color:#334155;">Touch Cleaning</strong></p><p style="margin:0 0 8px;font-size:13px;color:#64748b;">📧 info@touchcleaning.com.au | 📞 +61 452 419 700</p><p style="margin:0;font-size:12px;color:#94a3b8;">© ${year} Touch Cleaning. All rights reserved.</p></div></div></body></html>`;
  };

  return (
    <AdminLayout>
      <RequirePermission permission="can_edit_settings">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/email/campaigns">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Email Campaign</h1>
              <p className="text-muted-foreground">Send bulk emails to your users</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Summer Promotion 2024"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., 🌞 Summer Special: 20% Off All Services!"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience *</Label>
                    <Select
                      value={formData.target_audience}
                      onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_customers">All Customers</SelectItem>
                        <SelectItem value="all_staff">All Staff</SelectItem>
                        <SelectItem value="all_users">All Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Email Content</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  <CardDescription>Write your email content in HTML format</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="<h2>Hello!</h2><p>Write your email content here...</p>"
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Tip: Use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a href=""&gt; for formatting
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recipients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRecipients ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Recipients</span>
                        <Badge variant="secondary" className="text-lg">{recipients.length}</Badge>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {recipients.slice(0, 10).map((r) => (
                          <p key={r.id} className="text-sm truncate">{r.name || "Unnamed User"}</p>
                        ))}
                        {recipients.length > 10 && (
                          <p className="text-sm text-muted-foreground">+{recipients.length - 10} more...</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveDraft}
                    disabled={saving || sending}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save as Draft
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleSendCampaign}
                    disabled={saving || sending || recipients.length === 0}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Campaign
                  </Button>
                  {recipients.length === 0 && (
                    <p className="text-sm text-destructive text-center">
                      No recipients found for selected audience
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
            </DialogHeader>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={getPreviewHtml()}
                title="Email Preview"
                className="w-full h-[500px] border-0"
              />
            </div>
          </DialogContent>
        </Dialog>
      </RequirePermission>
    </AdminLayout>
  );
};

export default CreateEmailCampaign;
