import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
} from "lucide-react";
import { JobCard } from "@/components/staff/JobCard";
import { JobDetailsDialog } from "@/components/staff/JobDetailsDialog";
import { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface Booking {
  id: string;
  service_type: string;
  property_type: string;
  service_address: string;
  preferred_date: string;
  status: BookingStatus;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  estimated_hours: number | null;
  notes: string | null;
  staff_hours_worked: number | null;
}

const StaffJobsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newJobAlert, setNewJobAlert] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel("staff-bookings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `staff_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNewJobAlert(true);
            toast({
              title: "🎉 New Job Assigned!",
              description: "You have a new job assignment. Check your jobs list.",
            });
            // Show notification bell badge
            const bellBadge = document.querySelector(".notification-count");
            if (bellBadge) {
              bellBadge.classList.remove("hidden");
              bellBadge.textContent = "1";
            }
          }
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("staff_id", user.id)
      .order("preferred_date", { ascending: true });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  };

  const updateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const updates: Record<string, any> = { status: newStatus };

    if (newStatus === "confirmed") {
      updates.task_accepted_at = new Date().toISOString();
    } else if (newStatus === "in_progress") {
      updates.task_started_at = new Date().toISOString();
    } else if (newStatus === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", bookingId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    } else {
      toast({
        title: "Success",
        description: `Job ${newStatus === "confirmed" ? "accepted" : newStatus === "in_progress" ? "started" : "completed"}`,
      });
      fetchBookings();
    }
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDetailsOpen(true);
  };

  const newJobs = bookings.filter((b) => b.status === "pending");
  const acceptedJobs = bookings.filter((b) => b.status === "confirmed");
  const inProgressJobs = bookings.filter((b) => b.status === "in_progress");

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
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <p className="text-muted-foreground">Manage your assigned cleaning jobs</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{newJobs.length}</div>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{acceptedJobs.length}</div>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{inProgressJobs.length}</div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {newJobs.length + acceptedJobs.length + inProgressJobs.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Job Alert */}
      {newJobs.length > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  You have {newJobs.length} new job{newJobs.length > 1 ? "s" : ""} waiting to be accepted!
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  Review and accept jobs to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Tabs */}
      <Tabs defaultValue={newJobs.length > 0 ? "new" : "accepted"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="new" className="gap-2">
            New
            {newJobs.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                {newJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            Accepted
            {acceptedJobs.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                {acceptedJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="gap-2">
            In Progress
            {inProgressJobs.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                {inProgressJobs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {newJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No new job assignments
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {newJobs.map((booking) => (
                <JobCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onAccept={(id) => updateStatus(id, "confirmed")}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No accepted jobs
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {acceptedJobs.map((booking) => (
                <JobCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onStart={(id) => updateStatus(id, "in_progress")}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No jobs in progress
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {inProgressJobs.map((booking) => (
                <JobCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onComplete={(id) => updateStatus(id, "completed")}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <JobDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        bookingId={selectedBookingId}
        onStatusUpdate={fetchBookings}
      />
    </div>
  );
};

export default StaffJobsPage;
