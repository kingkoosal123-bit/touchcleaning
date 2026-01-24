import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  UserCog,
  Star,
  Activity,
  BarChart3,
  PieChartIcon,
  Target,
  Zap,
} from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO } from "date-fns";

interface BookingAnalytics {
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

interface DailyBooking {
  date: string;
  count: number;
  revenue: number;
}

interface ServiceBreakdown {
  service_type: string;
  count: number;
  revenue: number;
}

interface StaffPerformance {
  staff_id: string;
  name: string;
  completed_jobs: number;
  total_revenue: number;
  avg_rating: number;
  hours_worked: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [dailyData, setDailyData] = useState<DailyBooking[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceBreakdown[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [conversionData, setConversionData] = useState({
    enquiries: 0,
    bookings: 0,
    completed: 0,
    rate: 0,
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);

    try {
      // Fetch main analytics
      const { data: analyticsData } = await supabase
        .from("booking_analytics")
        .select("*")
        .maybeSingle();

      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      // Fetch bookings for date range
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, created_at, preferred_date, status, service_type, actual_cost, staff_id")
        .gte("created_at", startDate.toISOString());

      if (bookings) {
        // Process daily data
        const dailyMap = new Map<string, { count: number; revenue: number }>();
        const dates = eachDayOfInterval({ start: startDate, end: new Date() });
        
        dates.forEach(date => {
          const key = format(date, "yyyy-MM-dd");
          dailyMap.set(key, { count: 0, revenue: 0 });
        });

        bookings.forEach(b => {
          const key = format(parseISO(b.created_at), "yyyy-MM-dd");
          const existing = dailyMap.get(key) || { count: 0, revenue: 0 };
          dailyMap.set(key, {
            count: existing.count + 1,
            revenue: existing.revenue + (b.actual_cost || 0),
          });
        });

        setDailyData(
          Array.from(dailyMap.entries()).map(([date, data]) => ({
            date: format(parseISO(date), "MMM dd"),
            ...data,
          }))
        );

        // Process service breakdown
        const serviceMap = new Map<string, { count: number; revenue: number }>();
        bookings.forEach(b => {
          const existing = serviceMap.get(b.service_type) || { count: 0, revenue: 0 };
          serviceMap.set(b.service_type, {
            count: existing.count + 1,
            revenue: existing.revenue + (b.actual_cost || 0),
          });
        });

        setServiceBreakdown(
          Array.from(serviceMap.entries()).map(([service_type, data]) => ({
            service_type: service_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            ...data,
          }))
        );
      }

      // Fetch staff performance
      const { data: staffData } = await supabase
        .from("staff_details")
        .select(`
          id,
          user_id,
          total_tasks_completed,
          total_earnings,
          average_rating,
          total_hours_worked,
          profiles!inner(full_name)
        `)
        .eq("is_active", true)
        .order("total_tasks_completed", { ascending: false })
        .limit(10);

      if (staffData) {
        setStaffPerformance(
          staffData.map(s => ({
            staff_id: s.id,
            name: (s.profiles as any)?.full_name || "Unknown",
            completed_jobs: s.total_tasks_completed || 0,
            total_revenue: s.total_earnings || 0,
            avg_rating: s.average_rating || 0,
            hours_worked: s.total_hours_worked || 0,
          }))
        );
      }

      // Fetch conversion data
      const { count: enquiryCount } = await supabase
        .from("cms_enquiries")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString());

      const completedBookings = bookings?.filter(b => b.status === "completed").length || 0;
      const totalBookings = bookings?.length || 0;

      setConversionData({
        enquiries: enquiryCount || 0,
        bookings: totalBookings,
        completed: completedBookings,
        rate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const exportData = () => {
    const csvContent = [
      ["Metric", "Value"],
      ["Total Bookings", analytics?.total_bookings || 0],
      ["Total Revenue", analytics?.total_revenue || 0],
      ["Average Booking Value", analytics?.avg_booking_value || 0],
      ["Total Customers", analytics?.total_customers || 0],
      ["Active Staff", analytics?.active_staff || 0],
      ["Pending Bookings", analytics?.pending_count || 0],
      ["Completed Bookings", analytics?.completed_count || 0],
      ["Conversion Rate", `${conversionData.rate}%`],
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusData = [
    { name: "Pending", value: analytics?.pending_count || 0, color: "hsl(45, 93%, 47%)" },
    { name: "Confirmed", value: analytics?.confirmed_count || 0, color: "hsl(217, 91%, 60%)" },
    { name: "In Progress", value: analytics?.in_progress_count || 0, color: "hsl(271, 91%, 65%)" },
    { name: "Completed", value: analytics?.completed_count || 0, color: "hsl(142, 71%, 45%)" },
    { name: "Cancelled", value: analytics?.cancelled_count || 0, color: "hsl(0, 84%, 60%)" },
  ];

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Comprehensive insights into your business performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(analytics?.total_revenue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                From completed jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_bookings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.pending_count || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_customers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Value</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(analytics?.avg_booking_value || 0).toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionData.rate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Bookings completed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Booking Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Trend</CardTitle>
                  <CardDescription>Daily bookings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorCount)"
                          name="Bookings"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Status</CardTitle>
                  <CardDescription>Current status distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Service Type Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Service Types</CardTitle>
                  <CardDescription>Breakdown by service category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={serviceBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis dataKey="service_type" type="category" width={100} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Service Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue by Service</CardTitle>
                  <CardDescription>Income breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="revenue"
                          nameKey="service_type"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {serviceBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Summary Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              {statusData.map((status) => (
                <Card key={status.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-sm text-muted-foreground">{status.name}</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{status.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Based on completed jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staffPerformance.slice(0, 5).map((staff, index) => (
                      <div key={staff.staff_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{staff.completed_jobs} jobs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${staff.total_revenue.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {staff.avg_rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {staffPerformance.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No staff data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Productivity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Staff Productivity</CardTitle>
                  <CardDescription>Jobs completed comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={staffPerformance.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="completed_jobs" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Completed Jobs" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Staff Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Staff Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <UserCog className="h-8 w-8 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold">{analytics?.active_staff || 0}</div>
                    <p className="text-sm text-muted-foreground">Active Staff</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {staffPerformance.reduce((sum, s) => sum + s.completed_jobs, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Jobs Done</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {staffPerformance.reduce((sum, s) => sum + s.hours_worked, 0).toFixed(0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Hours Worked</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {staffPerformance.length > 0
                        ? (staffPerformance.reduce((sum, s) => sum + s.avg_rating, 0) / staffPerformance.length).toFixed(1)
                        : "0.0"}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Enquiries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{conversionData.enquiries}</div>
                  <p className="text-sm text-muted-foreground">Contact form submissions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Bookings Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{conversionData.bookings}</div>
                  <p className="text-sm text-muted-foreground">Total bookings made</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{conversionData.completed}</div>
                  <p className="text-sm text-muted-foreground">Successfully delivered</p>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Funnel</CardTitle>
                <CardDescription>From enquiry to completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">Enquiries</div>
                      <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full flex items-center justify-end pr-3"
                          style={{ width: "100%" }}
                        >
                          <span className="text-sm font-medium text-primary-foreground">{conversionData.enquiries}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">Bookings</div>
                      <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full bg-chart-2 rounded-full flex items-center justify-end pr-3"
                          style={{ width: conversionData.enquiries > 0 ? `${(conversionData.bookings / conversionData.enquiries) * 100}%` : "0%" }}
                        >
                          <span className="text-sm font-medium text-primary-foreground">{conversionData.bookings}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">Completed</div>
                      <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full flex items-center justify-end pr-3"
                          style={{ width: conversionData.enquiries > 0 ? `${(conversionData.completed / conversionData.enquiries) * 100}%` : "0%" }}
                        >
                          <span className="text-sm font-medium text-white">{conversionData.completed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Completion Rate</span>
                    <span className="text-2xl font-bold text-green-500">{conversionData.rate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
