import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface ScheduledJob {
  id: string;
  service_type: string;
  property_type: string;
  service_address: string;
  preferred_date: string;
  status: BookingStatus;
  first_name: string;
  last_name: string;
  estimated_hours: number | null;
}

const StaffSchedulePage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("staff_id", user.id)
      .in("status", ["pending", "confirmed", "in_progress"])
      .order("preferred_date", { ascending: true });

    if (!error && data) {
      setBookings(data as ScheduledJob[]);
    }
    setLoading(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getJobsForDate = (date: Date) => {
    return bookings.filter((b) => isSameDay(new Date(b.preferred_date), date));
  };

  const selectedDateJobs = selectedDate ? getJobsForDate(selectedDate) : [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500",
      confirmed: "bg-blue-500",
      in_progress: "bg-purple-500",
    };
    return colors[status] || "bg-muted";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Schedule</h1>
        <p className="text-sm text-muted-foreground">View your upcoming job calendar</p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                <div key={idx} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-1 md:py-2">
                  <span className="md:hidden">{day}</span>
                  <span className="hidden md:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5 md:gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 md:h-16" />
              ))}

              {days.map((day) => {
                const dayJobs = getJobsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "h-10 md:h-16 p-0.5 md:p-1 rounded-lg text-left transition-colors relative",
                      isToday(day) && "bg-primary/10",
                      isSelected && "ring-2 ring-primary",
                      dayJobs.length > 0 && "hover:bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm",
                        isToday(day) && "font-bold text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayJobs.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap">
                        {dayJobs.slice(0, 3).map((job) => (
                          <div
                            key={job.id}
                            className={cn("h-1.5 w-1.5 rounded-full", getStatusColor(job.status))}
                          />
                        ))}
                        {dayJobs.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{dayJobs.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-amber-500" />
                <span className="text-xs md:text-sm text-muted-foreground">New</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-blue-500" />
                <span className="text-xs md:text-sm text-muted-foreground">Accepted</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-purple-500" />
                <span className="text-xs md:text-sm text-muted-foreground">In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}
            </CardTitle>
            <CardDescription>
              {selectedDateJobs.length} job{selectedDateJobs.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-muted-foreground text-center py-8">
                Click on a date to view scheduled jobs
              </p>
            ) : selectedDateJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No jobs scheduled for this day
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">
                        {job.service_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <Badge
                        className={cn(
                          "text-white text-xs",
                          getStatusColor(job.status)
                        )}
                      >
                        {job.status === "pending"
                          ? "New"
                          : job.status === "confirmed"
                          ? "Accepted"
                          : "In Progress"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{job.first_name} {job.last_name}</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{job.service_address}</span>
                      </div>
                      {job.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{job.estimated_hours}h estimated</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffSchedulePage;
