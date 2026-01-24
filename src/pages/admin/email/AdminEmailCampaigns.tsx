import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Plus, RefreshCw, Eye, Trash2, Send, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  target_audience: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

const AdminEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bulk_email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load campaigns" });
    } else {
      setCampaigns(data || []);
    }
    setLoading(false);
  };

  const handleDeleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from("bulk_email_campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete campaign" });
    } else {
      toast({ title: "Success", description: "Campaign deleted" });
      fetchCampaigns();
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ElementType }> = {
      draft: { color: "bg-muted text-foreground", icon: FileText },
      sending: { color: "bg-blue-500", icon: Send },
      completed: { color: "bg-green-500", icon: CheckCircle },
      failed: { color: "bg-red-500", icon: XCircle },
      scheduled: { color: "bg-yellow-500", icon: Clock },
    };
    const { color, icon: Icon } = config[status] || { color: "bg-muted", icon: FileText };
    return (
      <Badge className={`${color} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getAudienceBadge = (audience: string) => {
    const labels: Record<string, string> = {
      all_customers: "All Customers",
      all_staff: "All Staff",
      all_users: "All Users",
      newsletter_subscribers: "Newsletter Subscribers",
    };
    return <Badge variant="outline">{labels[audience] || audience}</Badge>;
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
                <h1 className="text-2xl font-bold">Bulk Email Campaigns</h1>
                <p className="text-muted-foreground">Create and manage email campaigns</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchCampaigns}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild>
                <Link to="/admin/email/campaigns/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{campaigns.filter(c => c.status === "completed").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-muted-foreground">{campaigns.filter(c => c.status === "draft").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{campaigns.reduce((sum, c) => sum + c.sent_count, 0)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent / Failed</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">{campaign.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getAudienceBadge(campaign.target_audience)}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{campaign.total_recipients}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{campaign.sent_count}</span>
                        {campaign.failed_count > 0 && (
                          <span className="text-red-600 ml-1">/ {campaign.failed_count}</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(campaign.created_at), "PP")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/email/campaigns/${campaign.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {campaign.status === "draft" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{campaign.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {campaigns.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No campaigns created yet</p>
                  <Button asChild>
                    <Link to="/admin/email/campaigns/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </RequirePermission>
    </AdminLayout>
  );
};

export default AdminEmailCampaigns;
