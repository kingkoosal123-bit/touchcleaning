import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCog,
  CalendarDays,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface Analytics {
  pending_count: number;
  confirmed_count: number;
  in_progress_count: number;
  completed_count: number;
  cancelled_count: number;
  total_bookings: number;
  total_revenue: number;
  avg_booking_value: number;
  total_customers: number;
  active_staff: number;
}

interface RecentBooking {
  id: string;
  first_name: string;
  last_name: string;
  service_type: string;
  preferred_date: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [calendarBookings, setCalendarBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    // Fetch analytics
    const { data: analyticsData } = await supabase
      .from("booking_analytics")
      .select("*")
      .single();

    if (analyticsData) {
      setAnalytics(analyticsData);
    }

    // Fetch recent bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("id, first_name, last_name, service_type, preferred_date, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (bookingsData) {
      setRecentBookings(bookingsData);
    }

    // Fetch calendar bookings for current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data: calendarData } = await supabase
      .from("bookings")
      .select("id, preferred_date, status, service_type")
      .gte("preferred_date", monthStart.toISOString())
      .lte("preferred_date", monthEnd.toISOString());

    if (calendarData) {
      setCalendarBookings(calendarData);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "in_progress": return "bg-purple-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getBookingsForDay = (date: Date) => {
    return calendarBookings.filter((b) => isSameDay(new Date(b.preferred_date), date));
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.total_revenue?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {analytics?.completed_count || 0} completed jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_customers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Staff
              </CardTitle>
              <UserCog className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.active_staff || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Booking Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.avg_booking_value?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">Per completed job</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking Activity Cards */}
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.pending_count || 0}</div>
                <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.confirmed_count || 0}</div>
                <p className="text-sm text-muted-foreground">Ready to start</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.in_progress_count || 0}</div>
                <p className="text-sm text-muted-foreground">Currently working</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.completed_count || 0}</div>
                <p className="text-sm text-muted-foreground">Successfully done</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/bookings">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent bookings</p>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {booking.first_name} {booking.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.service_type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(booking.status)} text-white text-xs`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Booking Calendar - {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                Next
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {monthDays.map((day) => {
                const dayBookings = getBookingsForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    className="min-h-[80px] border border-border rounded-lg p-1 hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-sm text-muted-foreground mb-1">{format(day, "d")}</div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(b.status)} text-white`}
                        >
                          {b.service_type.replace(/_/g, " ").slice(0, 10)}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayBookings.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/bookings" className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Manage Bookings</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/users/create-staff" className="flex flex-col items-center gap-2">
              <UserCog className="h-6 w-6" />
              <span>Create Staff</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/assign" className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6" />
              <span>Assign Jobs</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/analytics" className="flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;