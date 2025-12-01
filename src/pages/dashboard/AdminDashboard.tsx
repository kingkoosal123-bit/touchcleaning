import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Activity, Clock, CheckCircle2, AlertCircle, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive overview of your cleaning business</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/dashboard/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              View Bookings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${analytics?.total_revenue.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              From {analytics?.completed_count || 0} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Users className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{analytics?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {(analytics?.pending_count || 0) + (analytics?.confirmed_count || 0) + (analytics?.in_progress_count || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Pending, confirmed & in progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${analytics?.avg_booking_value.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per completed booking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Booking Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <span className="text-sm font-bold">{analytics?.pending_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Confirmed</span>
              </div>
              <span className="text-sm font-bold">{analytics?.confirmed_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <span className="text-sm font-bold">{analytics?.in_progress_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm font-bold">{analytics?.completed_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium">Cancelled</span>
              </div>
              <span className="text-sm font-bold">{analytics?.cancelled_count || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-secondary" />
              Staff & Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-secondary/10 to-transparent">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Staff Members</p>
                  <p className="text-2xl font-bold text-secondary mt-1">{analytics?.active_staff || 0}</p>
                </div>
                <Users className="h-8 w-8 text-secondary/50" />
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-primary mt-1">{analytics?.total_bookings || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/50" />
              </div>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link to="/dashboard/users">
                  <UserCog className="mr-2 h-4 w-4" />
                  Manage Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-muted/50 to-background">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link to="/dashboard/bookings">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Manage Bookings</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link to="/dashboard/users">
                <Users className="h-6 w-6 mb-2" />
                <span>User Management</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link to="/dashboard/analytics">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};