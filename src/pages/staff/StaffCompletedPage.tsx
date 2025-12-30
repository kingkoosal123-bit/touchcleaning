import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { JobDetailsDialog } from "@/components/staff/JobDetailsDialog";

interface CompletedBooking {
  id: string;
  service_type: string;
  property_type: string;
  service_address: string;
  preferred_date: string;
  first_name: string;
  last_name: string;
  staff_hours_worked: number | null;
  completed_at: string | null;
}

const StaffCompletedPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompletedBookings();
    }
  }, [user]);

  const fetchCompletedBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("staff_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (!error && data) {
      setBookings(data as CompletedBooking[]);
    }
    setLoading(false);
  };

  const totalHours = bookings.reduce((acc, b) => acc + (b.staff_hours_worked || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Completed Jobs</h1>
        <p className="text-muted-foreground">View your completed work history</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Jobs Table */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Job History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed jobs yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Service</TableHead>
                    <TableHead className="hidden md:table-cell">Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="hidden sm:table-cell">Completed</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedBookingId(booking.id);
                        setDetailsOpen(true);
                      }}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-xs md:text-sm">
                            {booking.service_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {booking.property_type.replace(/_/g, " ")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {booking.first_name} {booking.last_name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm max-w-48 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {booking.service_address}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {booking.completed_at
                          ? format(new Date(booking.completed_at), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {booking.staff_hours_worked || 0}h
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

      {/* Job Details Dialog */}
      <JobDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        bookingId={selectedBookingId}
        onStatusUpdate={fetchCompletedBookings}
      />
    </div>
  );
};

export default StaffCompletedPage;
