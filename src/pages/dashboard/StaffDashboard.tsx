import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  service_type: string;
  property_type: string;
  service_address: string;
  preferred_date: string;
  status: string;
  first_name: string;
  last_name: string;
  phone: string;
  estimated_hours: number;
}

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyBookings();
  }, [user]);

  const fetchMyBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("staff_id", user.id)
      .order("preferred_date", { ascending: true });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const updateStatus = async (bookingId: string, newStatus: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled") => {
    const { error } = await supabase
      .from("bookings")
      .update({ 
        status: newStatus,
        ...(newStatus === "completed" && { completed_at: new Date().toISOString() })
      })
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
      fetchMyBookings();
    }
  };

  if (loading) {
    return <div>Loading your jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <p className="text-muted-foreground">Your assigned cleaning jobs</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No jobs assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {booking.service_type.replace(/_/g, " ").toUpperCase()}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {booking.property_type.toUpperCase()}
                    </p>
                  </div>
                  <Badge variant={
                    booking.status === "completed" ? "default" :
                    booking.status === "in_progress" ? "secondary" :
                    booking.status === "confirmed" ? "outline" : "secondary"
                  }>
                    {booking.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.service_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(booking.preferred_date), "PPP")}</span>
                  </div>
                  {booking.estimated_hours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{booking.estimated_hours} hours</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm">{booking.first_name} {booking.last_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.phone}</p>
                </div>

                {booking.status !== "completed" && booking.status !== "cancelled" && (
                  <div className="flex gap-2">
                    {booking.status === "confirmed" && (
                      <Button 
                        onClick={() => updateStatus(booking.id, "in_progress")}
                        size="sm"
                      >
                        Start Job
                      </Button>
                    )}
                    {booking.status === "in_progress" && (
                      <Button 
                        onClick={() => updateStatus(booking.id, "completed")}
                        size="sm"
                      >
                        Complete Job
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};