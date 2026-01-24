import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Eye, UserPlus, MapPin, RefreshCw, Plus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { emailService } from "@/lib/email";
import { Link } from "react-router-dom";

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
  status: BookingStatus;
  staff_id: string | null;
  estimated_hours: number | null;
  estimated_cost: number | null;
  notes: string | null;
  created_at: string;
}

interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchStaff();
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

  const fetchStaff = async () => {
    try {
      // First get all staff user IDs from user_roles
      const { data: staffRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "staff");

      if (rolesError) {
        console.error("Error fetching staff roles:", rolesError);
        return;
      }

      if (!staffRoles || staffRoles.length === 0) {
        console.log("No staff roles found");
        setStaff([]);
        return;
      }

      const staffUserIds = staffRoles.map((r) => r.user_id);

      // Get profiles for these staff members
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", staffUserIds);

      if (profilesError) {
        console.error("Error fetching staff profiles:", profilesError);
        return;
      }

      // Get staff details to check active status
      const { data: staffDetails, error: detailsError } = await supabase
        .from("staff_details")
        .select("id, user_id, is_active")
        .in("user_id", staffUserIds);

      if (detailsError) {
        console.error("Error fetching staff details:", detailsError);
      }

      // Combine the data - use user_id as the primary key for staff assignment
      const combinedStaff: StaffMember[] = (profiles || []).map((profile) => {
        const details = staffDetails?.find((d) => d.user_id === profile.id);
        return {
          id: details?.id || profile.id, // staff_details id if available
          user_id: profile.id, // This is what goes in bookings.staff_id
          full_name: profile.full_name || "Unnamed Staff",
          email: profile.phone || "No contact", // Use phone as fallback since email isn't in profiles
          is_active: details?.is_active ?? true,
        };
      });

      // Filter to only active staff
      const activeStaff = combinedStaff.filter((s) => s.is_active);
      console.log("Fetched staff:", activeStaff);
      setStaff(activeStaff);
    } catch (error) {
      console.error("Error in fetchStaff:", error);
    }
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
      // Update selected booking if open
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const assignStaff = async (bookingId: string, staffUserId: string) => {
    // Get booking details first
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
      
      // Send work assignment email
      try {
        await emailService.sendWorkAssignment(booking.email, {
          service_type: booking.service_type.replace(/_/g, " "),
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      in_progress: "bg-purple-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return (
      <Badge className={`${colors[status] || "bg-muted"} text-white`}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
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
            <Button variant="outline" onClick={() => { fetchBookings(); fetchStaff(); }}>
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
                        <p>{booking.service_type.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">{booking.property_type}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(booking.preferred_date), "PPP")}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
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
                          <DialogContent className="max-w-2xl">
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
                                    <p>{selectedBooking.service_type.replace(/_/g, " ")}</p>
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
                                    {getStatusBadge(selectedBooking.status)}
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Assigned Staff</p>
                                    <p>{getStaffName(selectedBooking.staff_id) || "Unassigned"}</p>
                                  </div>
                                </div>
                                {selectedBooking.notes && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p>{selectedBooking.notes}</p>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2 pt-4 border-t">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-sm text-muted-foreground">Update Status</label>
                                    <Select
                                      value={selectedBooking.status}
                                      onValueChange={(value) =>
                                        updateBookingStatus(selectedBooking.id, value as BookingStatus)
                                      }
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-sm text-muted-foreground">
                                      {selectedBooking.staff_id ? "Reassign Staff" : "Assign Staff"}
                                    </label>
                                    <Select 
                                      value={selectedBooking.staff_id || ""}
                                      onValueChange={(staffId) => assignStaff(selectedBooking.id, staffId)}
                                    >
                                      <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select staff..." />
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
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {/* Always show staff assignment dropdown */}
                        {booking.status !== "completed" && booking.status !== "cancelled" && (
                          <Select 
                            value={booking.staff_id || ""} 
                            onValueChange={(staffId) => assignStaff(booking.id, staffId)}
                          >
                            <SelectTrigger className="w-36">
                              <UserPlus className="h-4 w-4 mr-1" />
                              <span className="truncate">
                                {booking.staff_id ? "Reassign" : "Assign"}
                              </span>
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
      </RequirePermission>
    </AdminLayout>
  );
};

export default AdminBookings;
