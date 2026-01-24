import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Mail, FileText, Send, Users, RefreshCw, ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface EmailStats {
  totalSent: number;
  sentToday: number;
  sentThisWeek: number;
  failedCount: number;
}

interface RecentEmail {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  status: string;
  template_key: string | null;
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
}

const AdminEmailDashboard = () => {
  const [stats, setStats] = useState<EmailStats>({ totalSent: 0, sentToday: 0, sentThisWeek: 0, failedCount: 0 });
  const [recentEmails, setRecentEmails] = useState<RecentEmail[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch email logs
      const { data: logs, error: logsError } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (logsError) throw logsError;
      setRecentEmails(logs || []);

      // Calculate stats
      const { count: totalCount } = await supabase
        .from("email_logs")
        .select("*", { count: "exact", head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from("email_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekCount } = await supabase
        .from("email_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      const { count: failedCount } = await supabase
        .from("email_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");

      setStats({
        totalSent: totalCount || 0,
        sentToday: todayCount || 0,
        sentThisWeek: weekCount || 0,
        failedCount: failedCount || 0,
      });

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("bulk_email_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

    } catch (error) {
      console.error("Error fetching email data:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load email data" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ElementType }> = {
      sent: { color: "bg-green-500", icon: CheckCircle },
      failed: { color: "bg-red-500", icon: XCircle },
      pending: { color: "bg-yellow-500", icon: Clock },
      draft: { color: "bg-muted", icon: FileText },
      sending: { color: "bg-blue-500", icon: Send },
      completed: { color: "bg-green-500", icon: CheckCircle },
    };
    const { color, icon: Icon } = config[status] || { color: "bg-muted", icon: Mail };
    return (
      <Badge className={`${color} text-white flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Email Management</h1>
              <p className="text-muted-foreground">Manage email templates, track sent emails, and create campaigns</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild>
                <Link to="/admin/email/campaigns/create">
                  <Send className="h-4 w-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Emails Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalSent}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sent Today</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.sentToday}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.sentThisWeek}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{stats.failedCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/admin/email/templates">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Email Templates</CardTitle>
                      <CardDescription>Manage and customize email formats</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between">
                    View Templates
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/email/logs">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Email Logs</CardTitle>
                      <CardDescription>View all sent email history</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between">
                    View Logs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/email/campaigns">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Bulk Campaigns</CardTitle>
                      <CardDescription>Send emails to multiple users</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between">
                    View Campaigns
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recent">Recent Emails</TabsTrigger>
              <TabsTrigger value="campaigns">Recent Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Emails</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/email/logs">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentEmails.length > 0 ? (
                        recentEmails.map((email) => (
                          <TableRow key={email.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{email.recipient_name || "—"}</p>
                                <p className="text-sm text-muted-foreground">{email.recipient_email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{email.template_key || "Custom"}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(email.status)}</TableCell>
                            <TableCell>{format(new Date(email.created_at), "PP p")}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No emails sent yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Campaigns</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/email/campaigns">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{campaign.name}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">{campaign.subject}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                            <TableCell>{campaign.total_recipients}</TableCell>
                            <TableCell>
                              <span className="text-green-600">{campaign.sent_count}</span>
                              {campaign.failed_count > 0 && (
                                <span className="text-red-600 ml-1">/ {campaign.failed_count} failed</span>
                              )}
                            </TableCell>
                            <TableCell>{format(new Date(campaign.created_at), "PP")}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No campaigns created yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RequirePermission>
    </AdminLayout>
  );
};

export default AdminEmailDashboard;
