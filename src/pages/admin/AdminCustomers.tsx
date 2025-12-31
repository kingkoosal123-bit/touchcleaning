import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Eye, Phone, MapPin, Pencil, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  bookings_count: number;
  total_spent: number;
  last_booking: string | null;
}

interface CustomerBooking {
  id: string;
  service_type: string;
  status: string;
  preferred_date: string;
  actual_cost: number | null;
  service_address: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBookings, setCustomerBookings] = useState<CustomerBooking[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("admin_details")
        .select("admin_level")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setIsSuperAdmin(data?.admin_level === "super");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // Fetch profiles with customer role
    const { data: customerRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "customer");

    if (!customerRoles) {
      setLoading(false);
      return;
    }

    const customerIds = customerRoles.map((r) => r.user_id);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", customerIds);

    // Fetch bookings for stats
    const { data: bookings } = await supabase
      .from("bookings")
      .select("customer_id, actual_cost, preferred_date")
      .in("customer_id", customerIds);

    // Combine data
    const customersWithStats: Customer[] = (profiles || []).map((profile) => {
      const customerBookings = bookings?.filter((b) => b.customer_id === profile.id) || [];
      const totalSpent = customerBookings.reduce((sum, b) => sum + (b.actual_cost || 0), 0);
      const lastBooking = customerBookings.length > 0
        ? customerBookings.sort((a, b) => new Date(b.preferred_date).getTime() - new Date(a.preferred_date).getTime())[0].preferred_date
        : null;

      return {
        id: profile.id,
        user_id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        created_at: profile.created_at,
        bookings_count: customerBookings.length,
        total_spent: totalSpent,
        last_booking: lastBooking,
      };
    });

    setCustomers(customersWithStats);
    setLoading(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editingCustomer.full_name,
        phone: editingCustomer.phone,
        address: editingCustomer.address,
      })
      .eq("id", editingCustomer.user_id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update customer" });
    } else {
      toast({ title: "Success", description: "Customer updated successfully" });
      setEditDialogOpen(false);
      fetchCustomers();
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    // This will cascade delete from auth.users due to FK constraints
    const { error } = await supabase.auth.admin.deleteUser(customer.user_id);
    
    if (error) {
      // Fallback: just remove roles and mark as inactive
      await supabase.from("user_roles").delete().eq("user_id", customer.user_id);
      await supabase.from("customer_details").update({ is_active: false }).eq("user_id", customer.user_id);
      toast({ title: "Success", description: "Customer deactivated" });
    } else {
      toast({ title: "Success", description: "Customer deleted" });
    }
    fetchCustomers();
  };

  const viewCustomerBookings = async (customer: Customer) => {
    setSelectedCustomer(customer);
    
    const { data } = await supabase
      .from("bookings")
      .select("id, service_type, status, preferred_date, actual_cost, service_address")
      .eq("customer_id", customer.id)
      .order("preferred_date", { ascending: false });

    setCustomerBookings(data || []);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      in_progress: "bg-purple-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>{status.replace("_", " ")}</Badge>;
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      (customer.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (customer.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (customer.address?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Customer Database</h1>
          <p className="text-muted-foreground">View and manage all customers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Per Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${customers.length > 0 ? (customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(2) : "0.00"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customers.reduce((sum, c) => sum + c.bookings_count, 0)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Booking</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.full_name || "No name"}</p>
                        {customer.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.address.substring(0, 30)}...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone && (
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.bookings_count} bookings</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">${customer.total_spent.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      {customer.last_booking ? format(new Date(customer.last_booking), "PP") : "N/A"}
                    </TableCell>
                    <TableCell>{format(new Date(customer.created_at), "PP")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewCustomerBookings(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isSuperAdmin && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will deactivate the customer {customer.full_name}. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCustomer(customer)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCustomers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No customers found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Bookings Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bookings for {selectedCustomer?.full_name || "Customer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {customerBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="capitalize">{booking.service_type.replace("_", " ")}</TableCell>
                      <TableCell>{format(new Date(booking.preferred_date), "PP")}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{booking.service_address}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>${booking.actual_cost?.toFixed(2) || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No bookings found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingCustomer.full_name || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editingCustomer.phone || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editingCustomer.address || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCustomer}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCustomers;
