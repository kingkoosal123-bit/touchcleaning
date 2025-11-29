import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Booking {
  id: string;
  service_type: string;
  property_type: string;
  service_address: string;
  preferred_date: string;
  status: string;
  estimated_cost: number;
  created_at: string;
}

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, [user]);

  const fetchMyBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading your bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your cleaning bookings</p>
        </div>
        <Button asChild>
          <Link to="/book">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No bookings yet</p>
              <Button asChild>
                <Link to="/book">Book Your First Cleaning</Link>
              </Button>
            </div>
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
                    booking.status === "confirmed" ? "outline" :
                    booking.status === "cancelled" ? "destructive" : "secondary"
                  }>
                    {booking.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.service_address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(booking.preferred_date), "PPP")}</span>
                </div>
                {booking.estimated_cost && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Estimated Cost</span>
                    <span className="text-sm font-bold">${booking.estimated_cost}</span>
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