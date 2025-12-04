import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Mail, Phone, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service_interest: string | null;
  message: string;
  status: string | null;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  contacted: "secondary",
  converted: "outline",
  closed: "destructive",
};

const AdminCMSEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    const { data, error } = await supabase
      .from("cms_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch enquiries");
      return;
    }
    setEnquiries(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("cms_enquiries")
      .update({ status, responded_at: status !== "new" ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated");
    fetchEnquiries();
  };

  const saveNotes = async () => {
    if (!selectedEnquiry) return;

    const { error } = await supabase
      .from("cms_enquiries")
      .update({ notes })
      .eq("id", selectedEnquiry.id);

    if (error) {
      toast.error("Failed to save notes");
      return;
    }
    toast.success("Notes saved");
    fetchEnquiries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    const { error } = await supabase.from("cms_enquiries").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete enquiry");
      return;
    }
    toast.success("Enquiry deleted");
    fetchEnquiries();
  };

  const openEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setNotes(enquiry.notes || "");
  };

  const newCount = enquiries.filter(e => e.status === "new").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Enquiries</h1>
            <p className="text-muted-foreground">
              Manage contact form submissions
              {newCount > 0 && (
                <Badge variant="default" className="ml-2">{newCount} new</Badge>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{enquiries.length}</div>
              <p className="text-muted-foreground text-sm">Total Enquiries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{newCount}</div>
              <p className="text-muted-foreground text-sm">New</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{enquiries.filter(e => e.status === "contacted").length}</div>
              <p className="text-muted-foreground text-sm">Contacted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{enquiries.filter(e => e.status === "converted").length}</div>
              <p className="text-muted-foreground text-sm">Converted</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Service Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id} className={enquiry.status === "new" ? "bg-primary/5" : ""}>
                      <TableCell className="font-medium">{enquiry.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {enquiry.email}
                          </div>
                          {enquiry.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {enquiry.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{enquiry.service_interest || "-"}</TableCell>
                      <TableCell>
                        <Select
                          value={enquiry.status || "new"}
                          onValueChange={(value) => updateStatus(enquiry.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge variant={statusColors[enquiry.status || "new"]}>
                              {enquiry.status || "new"}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(enquiry.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEnquiry(enquiry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(enquiry.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enquiry Details</DialogTitle>
            </DialogHeader>
            {selectedEnquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Interest</p>
                    <p className="font-medium">{selectedEnquiry.service_interest || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedEnquiry.email}`} className="font-medium text-primary">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    {selectedEnquiry.phone ? (
                      <a href={`tel:${selectedEnquiry.phone}`} className="font-medium text-primary">
                        {selectedEnquiry.phone}
                      </a>
                    ) : (
                      <p className="font-medium">-</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p>{selectedEnquiry.message}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Internal Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this enquiry..."
                  />
                  <Button className="mt-2" onClick={saveNotes}>Save Notes</Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Received: {format(new Date(selectedEnquiry.created_at), "PPpp")}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCMSEnquiries;