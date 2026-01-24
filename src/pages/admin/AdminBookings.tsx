import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Search, Eye, UserPlus, MapPin, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { emailService } from "@/lib/email";
import { Link } from "react-router-dom";
import { fetchActiveStaff, StaffMember, formatServiceType } from "@/lib/admin-utils";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface Booking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  service_type: string;
  property_type: string;
  service_address: string;
  preferred_date: string;
  end_date: string | null;
  booking_type: string | null;
  selected_services: string[] | null;
  status: BookingStatus;
  staff_id: string | null;
  estimated_hours: number | null;
  estimated_cost: number | null;
  actual_hours: number | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    loadStaff();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load bookings" });
    } else if (data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const loadStaff = async () => {
    const activeStaff = await fetchActiveStaff();
    setStaff(activeStaff);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ 
        status: newStatus,
        ...(newStatus === "completed" && { completed_at: new Date().toISOString() })
      })
      .eq("id", bookingId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    } else {
      toast({ title: "Success", description: "Booking status updated" });
      fetchBookings();
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const assignStaff = async (bookingId: string, staffUserId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const previousStaffId = booking.staff_id;
    const isReassignment = previousStaffId !== null && previousStaffId !== staffUserId;

    const { error } = await supabase
      .from("bookings")
      .update({ 
        staff_id: staffUserId, 
        status: booking.status === "pending" ? "confirmed" as BookingStatus : booking.status 
      })
      .eq("id", bookingId);

    if (error) {
      console.error("Error assigning staff:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to assign staff" });
    } else {
      const staffMember = staff.find(s => s.user_id === staffUserId);
      toast({ 
        title: "Success", 
        description: isReassignment 
          ? `Staff reassigned to ${staffMember?.full_name || "new staff"}`
          : "Staff assigned successfully" 
      });
      
      try {
        await emailService.sendWorkAssignment(booking.email, {
          service_type: formatServiceType(booking.service_type),
          property_type: booking.property_type,
          preferred_date: format(new Date(booking.preferred_date), "PPP"),
          service_address: booking.service_address,
          estimated_hours: booking.estimated_hours,
          customer_name: `${booking.first_name} ${booking.last_name}`,
          customer_phone: booking.phone,
          notes: booking.notes,
          staff_name: staffMember?.full_name || "Staff Member",
        });
      } catch (e) {
        console.error("Failed to send work assignment email:", e);
      }
      
      fetchBookings();
    }
  };

  const unassignStaff = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ staff_id: null, status: "pending" as BookingStatus })
      .eq("id", bookingId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to unassign staff" });
    } else {
      toast({ title: "Success", description: "Staff unassigned" });
      fetchBookings();
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking({ ...booking });
    setEditDialogOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;

    const { error } = await supabase
      .from("bookings")
      .update({
        first_name: editingBooking.first_name,
        last_name: editingBooking.last_name,
        email: editingBooking.email,
        phone: editingBooking.phone,
        service_address: editingBooking.service_address,
        preferred_date: editingBooking.preferred_date,
        estimated_hours: editingBooking.estimated_hours,
        estimated_cost: editingBooking.estimated_cost,
        actual_hours: editingBooking.actual_hours,
        actual_cost: editingBooking.actual_cost,
        notes: editingBooking.notes,
      })
      .eq("id", editingBooking.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update booking" });
    } else {
      toast({ title: "Success", description: "Booking updated successfully" });
      setEditDialogOpen(false);
      setEditingBooking(null);
      fetchBookings();
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete booking" });
    } else {
      toast({ title: "Success", description: "Booking deleted successfully" });
      fetchBookings();
    }
  };

  const getStaffName = (staffId: string | null) => {
    if (!staffId) return null;
    const staffMember = staff.find((s) => s.user_id === staffId);
    return staffMember?.full_name || "Unknown Staff";
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      <RequirePermission permission="can_manage_bookings">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Booking Management</h1>
            <p className="text-muted-foreground">View and manage all customer bookings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { fetchBookings(); loadStaff(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/admin/bookings/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === "pending").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === "confirmed").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">{bookings.filter(b => b.status === "in_progress").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === "completed").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff count indicator */}
        <div className="text-sm text-muted-foreground">
          {staff.length > 0 ? (
            <span className="text-green-600">✓ {staff.length} active staff available for assignment</span>
          ) : (
            <span className="text-orange-600">⚠ No active staff found. Please add staff members first.</span>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.first_name} {booking.last_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{formatServiceType(booking.service_type)}</p>
                        <p className="text-sm text-muted-foreground">{booking.property_type}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(booking.preferred_date), "PPP")}</TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateBookingStatus(booking.id, value as BookingStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <StatusBadge status={booking.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {booking.staff_id ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{getStaffName(booking.staff_id)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => unassignStaff(booking.id)}
                          >
                            Unassign
                          </Button>
                        </div>
                      ) : (
                        <Select 
                          value="" 
                          onValueChange={(staffId) => assignStaff(booking.id, staffId)}
                        >
                          <SelectTrigger className="w-36">
                            <UserPlus className="h-4 w-4 mr-1" />
                            <span>Assign</span>
                          </SelectTrigger>
                          <SelectContent>
                            {staff.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">No staff available</div>
                            ) : (
                              staff.map((s) => (
                                <SelectItem key={s.user_id} value={s.user_id}>
                                  {s.full_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>${booking.estimated_cost?.toFixed(2) || "0.00"}</p>
                        {booking.actual_cost && (
                          <p className="text-green-600">${booking.actual_cost.toFixed(2)} actual</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">
                                      {selectedBooking.first_name} {selectedBooking.last_name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Contact</p>
                                    <p>{selectedBooking.email}</p>
                                    <p>{selectedBooking.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Service</p>
                                    <p>{formatServiceType(selectedBooking.service_type)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Property</p>
                                    <p>{selectedBooking.property_type}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {selectedBooking.service_address}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Preferred Date</p>
                                    <p>{format(new Date(selectedBooking.preferred_date), "PPP")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <StatusBadge status={selectedBooking.status} />
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Assigned Staff</p>
                                    <p>{getStaffName(selectedBooking.staff_id) || "Unassigned"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Booking Type</p>
                                    <p className="capitalize">{selectedBooking.booking_type || "One-time"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Estimated</p>
                                    <p>{selectedBooking.estimated_hours || 0}h / ${selectedBooking.estimated_cost?.toFixed(2) || "0.00"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Actual</p>
                                    <p>{selectedBooking.actual_hours || 0}h / ${selectedBooking.actual_cost?.toFixed(2) || "0.00"}</p>
                                  </div>
                                </div>
                                {selectedBooking.selected_services && selectedBooking.selected_services.length > 0 && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Selected Services</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {selectedBooking.selected_services.map((service, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-muted rounded text-sm">{service}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {selectedBooking.notes && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p>{selectedBooking.notes}</p>
                                  </div>
                                )}
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button variant="outline" onClick={() => handleEditBooking(selectedBooking)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Booking
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => handleEditBooking(booking)}>
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
                              <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the booking for {booking.first_name} {booking.last_name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredBookings.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No bookings found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first-name">First Name</Label>
                  <Input
                    id="edit-first-name"
                    value={editingBooking.first_name}
                    onChange={(e) => setEditingBooking({ ...editingBooking, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last-name">Last Name</Label>
                  <Input
                    id="edit-last-name"
                    value={editingBooking.last_name}
                    onChange={(e) => setEditingBooking({ ...editingBooking, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingBooking.email}
                    onChange={(e) => setEditingBooking({ ...editingBooking, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingBooking.phone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, phone: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-address">Service Address</Label>
                  <Input
                    id="edit-address"
                    value={editingBooking.service_address}
                    onChange={(e) => setEditingBooking({ ...editingBooking, service_address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Preferred Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingBooking.preferred_date}
                    onChange={(e) => setEditingBooking({ ...editingBooking, preferred_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-est-hours">Estimated Hours</Label>
                  <Input
                    id="edit-est-hours"
                    type="number"
                    step="0.5"
                    value={editingBooking.estimated_hours || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, estimated_hours: parseFloat(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-est-cost">Estimated Cost ($)</Label>
                  <Input
                    id="edit-est-cost"
                    type="number"
                    step="0.01"
                    value={editingBooking.estimated_cost || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, estimated_cost: parseFloat(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-act-hours">Actual Hours</Label>
                  <Input
                    id="edit-act-hours"
                    type="number"
                    step="0.5"
                    value={editingBooking.actual_hours || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, actual_hours: parseFloat(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-act-cost">Actual Cost ($)</Label>
                  <Input
                    id="edit-act-cost"
                    type="number"
                    step="0.01"
                    value={editingBooking.actual_cost || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, actual_cost: parseFloat(e.target.value) || null })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingBooking.notes || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBooking}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </RequirePermission>
    </AdminLayout>
  );
};

export default AdminBookings;
