import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  status: string;
  estimated_cost: number;
  staff_id: string | null;
  created_at: string;
}

interface StaffMember {
  id: string;
  full_name: string;
}

const BookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
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

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const fetchStaff = async () => {
    const { data: staffRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "staff");

    if (staffRoles && staffRoles.length > 0) {
      const staffIds = staffRoles.map((r) => r.user_id);
      const { data: staffProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", staffIds);

      if (staffProfiles) {
        setStaff(staffProfiles);
      }
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status",
      });
    } else {
      toast({
        title: "Success",
        description: "Booking status updated",
      });
      fetchBookings();
    }
  };

  const assignStaff = async (bookingId: string, staffId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ staff_id: staffId, status: "confirmed" })
      .eq("id", bookingId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign staff",
      });
    } else {
      toast({
        title: "Success",
        description: "Staff assigned successfully",
      });
      fetchBookings();
    }
  };

  const updateCost = async (bookingId: string, cost: number) => {
    const { error } = await supabase
      .from("bookings")
      .update({ estimated_cost: cost })
      .eq("id", bookingId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cost",
      });
    } else {
      toast({
        title: "Success",
        description: "Cost updated successfully",
      });
      fetchBookings();
      setSelectedBooking(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings Management</h1>
          <p className="text-muted-foreground">Manage all customer bookings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading bookings...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
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
                        <TableCell className="max-w-xs truncate">{booking.service_address}</TableCell>
                        <TableCell>{format(new Date(booking.preferred_date), "PP")}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatus(booking.id, value as "pending" | "confirmed" | "in_progress" | "completed" | "cancelled")}
                          >
                            <SelectTrigger className="w-32">
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
                        </TableCell>
                        <TableCell>
                          <Select
                            value={booking.staff_id || "unassigned"}
                            onValueChange={(value) => assignStaff(booking.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign staff" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {staff.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                ${booking.estimated_cost || 0}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Cost</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="cost">Estimated Cost</Label>
                                  <Input
                                    id="cost"
                                    type="number"
                                    step="0.01"
                                    defaultValue={selectedBooking?.estimated_cost || 0}
                                    onBlur={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (!isNaN(value) && selectedBooking) {
                                        updateCost(selectedBooking.id, value);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {format(new Date(booking.created_at), "PP")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookingsManagement;