import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Eye, RefreshCw, Code } from "lucide-react";
import { Link } from "react-router-dom";

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string | null;
  subject: string;
  html_content: string;
  is_active: boolean;
  category: string;
  variables: any;
  created_at: string;
  updated_at: string;
}

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load templates" });
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setEditDialogOpen(true);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    const { error } = await supabase
      .from("email_templates")
      .update({
        name: editingTemplate.name,
        description: editingTemplate.description,
        subject: editingTemplate.subject,
        html_content: editingTemplate.html_content,
        is_active: editingTemplate.is_active,
      })
      .eq("id", editingTemplate.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update template" });
    } else {
      toast({ title: "Success", description: "Template updated successfully" });
      setEditDialogOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    }
  };

  const toggleTemplateActive = async (template: EmailTemplate) => {
    const { error } = await supabase
      .from("email_templates")
      .update({ is_active: !template.is_active })
      .eq("id", template.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update template" });
    } else {
      fetchTemplates();
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      transactional: "bg-blue-500",
      marketing: "bg-purple-500",
    };
    return <Badge className={`${colors[category] || "bg-muted"} text-white`}>{category}</Badge>;
  };

  // Email wrapper for preview
  const getPreviewHtml = (content: string) => {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f7fa;}</style></head><body><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 40px;text-align:center;"><h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;">Touch Cleaning</h1><p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Professional Cleaning Services</p></div><div style="padding:40px;">${content}</div><div style="background:#f8fafc;padding:32px 40px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0 0 8px;font-size:14px;color:#64748b;"><strong style="color:#334155;">Touch Cleaning</strong></p><p style="margin:0 0 8px;font-size:13px;color:#64748b;">📧 info@touchcleaning.com.au | 📞 +61 452 419 700</p><p style="margin:0;font-size:12px;color:#94a3b8;">© ${year} Touch Cleaning. All rights reserved.</p></div></div></body></html>`;
  };

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
      <RequirePermission permission="can_edit_settings">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin/email">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Email Templates</h1>
                <p className="text-muted-foreground">Customize email formats and content</p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchTemplates}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.template_key}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{template.subject}</TableCell>
                      <TableCell>{getCategoryBadge(template.category)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(template.variables as string[])?.slice(0, 3).map((v: string) => (
                            <Badge key={v} variant="outline" className="text-xs">
                              {`{{${v}}}`}
                            </Badge>
                          ))}
                          {(template.variables as string[])?.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{(template.variables as string[]).length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={() => toggleTemplateActive(template)}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(template.updated_at), "PP")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handlePreviewTemplate(template)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Edit Template Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
            </DialogHeader>
            {editingTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Template Name</Label>
                    <Input
                      id="edit-name"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="edit-active"
                        checked={editingTemplate.is_active}
                        onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, is_active: checked })}
                      />
                      <Label htmlFor="edit-active">Active</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingTemplate.description || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subject">Email Subject</Label>
                  <Input
                    id="edit-subject"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="edit-content">HTML Content</Label>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      HTML
                    </Badge>
                  </div>
                  <Textarea
                    id="edit-content"
                    value={editingTemplate.html_content}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, html_content: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Available Variables:</strong> Use these placeholders in your template
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(editingTemplate.variables as string[])?.map((v: string) => (
                      <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateTemplate}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            </DialogHeader>
            {previewTemplate && (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={getPreviewHtml(previewTemplate.html_content)}
                  title="Email Preview"
                  className="w-full h-[500px] border-0"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </RequirePermission>
    </AdminLayout>
  );
};

export default AdminEmailTemplates;
