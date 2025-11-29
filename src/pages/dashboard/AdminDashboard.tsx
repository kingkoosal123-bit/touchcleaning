import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

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

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data, error } = await supabase
        .from("booking_analytics")
        .select("*")
        .single();

      if (!error && data) {
        setAnalytics(data);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your cleaning business</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.total_revenue.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              From {analytics?.completed_count || 0} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.pending_count || 0) + (analytics?.confirmed_count || 0) + (analytics?.in_progress_count || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending, confirmed & in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.avg_booking_value.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per completed booking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Pending</span>
              <span className="text-sm font-medium">{analytics?.pending_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Confirmed</span>
              <span className="text-sm font-medium">{analytics?.confirmed_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">In Progress</span>
              <span className="text-sm font-medium">{analytics?.in_progress_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Completed</span>
              <span className="text-sm font-medium">{analytics?.completed_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cancelled</span>
              <span className="text-sm font-medium">{analytics?.cancelled_count || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Staff</span>
                <span className="text-sm font-medium">{analytics?.active_staff || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Bookings</span>
                <span className="text-sm font-medium">{analytics?.total_bookings || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};