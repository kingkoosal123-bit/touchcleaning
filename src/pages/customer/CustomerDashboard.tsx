import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, User, Phone, Mail, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface Booking {
  id: string;
  service_type: string;
  property_type: string;
  service_address: string;
  preferred_date: string;
  status: BookingStatus;
  estimated_hours: number | null;
  estimated_cost: number | null;
  notes: string | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingsData) {
      setBookings(bookingsData as Booking[]);
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, phone, address")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-12 px-4">
          <div className="container mx-auto flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-12 px-4">
        <div className="container mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your bookings and profile</p>
            </div>
            <Button asChild>
              <Link to="/book">Book New Service</Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.full_name || "No name set"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.phone || "No phone set"}</span>
                  </div>
                  {profile?.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="lg:col-span-2 grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">{bookings.length}</div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-500">
                    {bookings.filter((b) => b.status === "completed").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-yellow-500">
                    {bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bookings */}
          <div>
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any bookings yet</p>
                  <Button asChild>
                    <Link to="/book">Book Your First Service</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {booking.service_type.replace(/_/g, " ").toUpperCase()}
                        </CardTitle>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.property_type}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{booking.service_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(booking.preferred_date), "PPP")}</span>
                      </div>
                      {booking.estimated_hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.estimated_hours} hours</span>
                        </div>
                      )}
                      {booking.estimated_cost && (
                        <p className="text-sm font-medium">
                          Estimated: ${booking.estimated_cost.toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Booked on {format(new Date(booking.created_at), "PP")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;