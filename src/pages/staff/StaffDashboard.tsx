import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Camera, 
  CheckCircle, 
  Play, 
  Upload, 
  X, 
  User, 
  DollarSign, 
  Briefcase,
  ThumbsUp,
  FileText,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  estimated_hours: number | null;
  notes: string | null;
  service_location_lat: number | null;
  service_location_lng: number | null;
  staff_hours_worked: number | null;
  task_accepted_at: string | null;
  task_started_at: string | null;
  completed_at: string | null;
}

interface TaskPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  uploaded_at: string;
}

interface PayrollRecord {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  tax_withheld: number;
  superannuation: number;
  net_pay: number;
  bonus: number;
  deductions: number;
  payment_status: string;
  payment_date: string | null;
}

interface StaffDetails {
  id: string;
  hourly_rate: number;
  total_hours_worked: number;
  total_earnings: number;
  total_tasks_completed: number;
  average_rating: number;
}

const StaffDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [staffDetails, setStaffDetails] = useState<StaffDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hoursWorked, setHoursWorked] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    await Promise.all([fetchMyBookings(), fetchPayroll(), fetchStaffDetails()]);
    setLoading(false);
  };

  const fetchMyBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("staff_id", user.id)
      .order("preferred_date", { ascending: true });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
  };

  const fetchPayroll = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("staff_payroll")
      .select("*")
      .order("pay_period_end", { ascending: false });

    if (data) {
      setPayroll(data as PayrollRecord[]);
    }
  };

  const fetchStaffDetails = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("staff_details")
      .select("id, hourly_rate, total_hours_worked, total_earnings, total_tasks_completed, average_rating")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setStaffDetails(data as StaffDetails);
    }
  };

  const fetchPhotos = async (bookingId: string) => {
    const { data } = await supabase
      .from("task_photos")
      .select("*")
      .eq("booking_id", bookingId)
      .order("uploaded_at", { ascending: false });

    if (data) {
      setPhotos(data);
    }
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
      toast({ title: "Success", description: `Job ${newStatus === "confirmed" ? "accepted" : newStatus === "in_progress" ? "started" : "completed"}` });
      fetchMyBookings();
    }
  };

  const updateHoursWorked = async (bookingId: string) => {
    const hours = parseFloat(hoursWorked[bookingId] || "0");
    if (isNaN(hours) || hours <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Please enter valid hours" });
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({ staff_hours_worked: hours })
      .eq("id", bookingId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update hours" });
    } else {
      toast({ title: "Success", description: "Hours updated" });
      fetchMyBookings();
      setHoursWorked(prev => ({ ...prev, [bookingId]: "" }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    if (files.length > 5) {
      toast({ variant: "destructive", title: "Error", description: "Maximum 5 photos at a time" });
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${bookingId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("task-photos")
        .upload(fileName, file);

      if (uploadError) {
        toast({ variant: "destructive", title: "Error", description: `Failed to upload ${file.name}` });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("task-photos")
        .getPublicUrl(fileName);

      await supabase.from("task_photos").insert({
        booking_id: bookingId,
        staff_id: user.id,
        photo_url: publicUrl,
      });
    }

    toast({ title: "Success", description: "Photos uploaded" });
    fetchPhotos(bookingId);
    setUploading(false);
  };

  const deletePhoto = async (photoId: string) => {
    const { error } = await supabase.from("task_photos").delete().eq("id", photoId);
    if (!error && selectedBooking) {
      fetchPhotos(selectedBooking.id);
      toast({ title: "Photo deleted" });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; label: string }> = {
      pending: { bg: "bg-yellow-500", label: "Assigned" },
      confirmed: { bg: "bg-blue-500", label: "Accepted" },
      in_progress: { bg: "bg-purple-500", label: "In Progress" },
      completed: { bg: "bg-green-500", label: "Completed" },
      cancelled: { bg: "bg-red-500", label: "Cancelled" },
    };
    const { bg, label } = config[status] || { bg: "bg-muted", label: status };
    return <Badge className={`${bg} text-white`}>{label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      paid: "bg-green-500",
      processing: "bg-blue-500",
    };
    return (
      <Badge className={`${colors[status] || "bg-muted"} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  const activeJobs = bookings.filter(b => ["pending", "confirmed", "in_progress"].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === "completed");
  const totalEarnings = payroll.filter(p => p.payment_status === "paid").reduce((acc, p) => acc + p.net_pay, 0);
  const pendingPay = payroll.filter(p => p.payment_status === "pending").reduce((acc, p) => acc + p.net_pay, 0);

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
          <div>
            <h1 className="text-3xl font-bold">Staff Dashboard</h1>
            <p className="text-muted-foreground">Manage your jobs and track your earnings</p>
          </div>

          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Briefcase className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activeJobs.length}</div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{completedJobs.length}</div>
                    <p className="text-sm text-muted-foreground">Completed</p>
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
                    <div className="text-2xl font-bold">
                      {bookings.reduce((acc, b) => acc + (b.staff_hours_worked || 0), 0).toFixed(1)}h
                    </div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">${pendingPay.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Pending Pay</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="jobs">My Jobs</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="payroll">Payroll & Earnings</TabsTrigger>
            </TabsList>

            {/* Active Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              {activeJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No active jobs assigned</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {activeJobs.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {booking.service_type.replace(/_/g, " ").toUpperCase()}
                            </CardTitle>
                            <CardDescription>
                              {booking.property_type.replace(/_/g, " ")}
                            </CardDescription>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Customer Info */}
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{booking.first_name} {booking.last_name}</p>
                            <p className="text-xs text-muted-foreground">{booking.phone}</p>
                          </div>
                        </div>

                        {/* Location */}
                        <button
                          onClick={() => openGoogleMaps(booking.service_address)}
                          className="flex items-start gap-2 text-sm hover:text-primary transition-colors w-full text-left"
                        >
                          <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span className="underline">{booking.service_address}</span>
                        </button>

                        {/* Date & Time */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(booking.preferred_date), "PPP")}</span>
                          </div>
                          {booking.estimated_hours && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.estimated_hours}h est.</span>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm text-muted-foreground">{booking.notes}</p>
                          </div>
                        )}

                        {/* Hours Input for In Progress/Completed */}
                        {(booking.status === "in_progress" || booking.status === "completed") && (
                          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="Hours worked"
                              value={hoursWorked[booking.id] || ""}
                              onChange={(e) => setHoursWorked(prev => ({ ...prev, [booking.id]: e.target.value }))}
                              className="w-28"
                            />
                            <Button size="sm" variant="secondary" onClick={() => updateHoursWorked(booking.id)}>
                              Save
                            </Button>
                            {booking.staff_hours_worked && (
                              <span className="text-sm text-muted-foreground ml-2">
                                Current: {booking.staff_hours_worked}h
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          {/* Status: Pending (Assigned) → Accept */}
                          {booking.status === "pending" && (
                            <Button onClick={() => updateStatus(booking.id, "confirmed")} size="sm" className="flex-1">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Accept Job
                            </Button>
                          )}
                          
                          {/* Status: Confirmed (Accepted) → Start Work */}
                          {booking.status === "confirmed" && (
                            <Button onClick={() => updateStatus(booking.id, "in_progress")} size="sm" className="flex-1">
                              <Play className="h-4 w-4 mr-1" />
                              Start Work
                            </Button>
                          )}
                          
                          {/* Status: In Progress → Complete */}
                          {booking.status === "in_progress" && (
                            <Button onClick={() => updateStatus(booking.id, "completed")} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete Job
                            </Button>
                          )}

                          {/* Photo Upload Dialog - Available for all active jobs */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  fetchPhotos(booking.id);
                                }}
                              >
                                <Camera className="h-4 w-4 mr-1" />
                                Photos
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Task Photos</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handlePhotoUpload(e, booking.id)}
                                    className="hidden"
                                    id={`photo-upload-${booking.id}`}
                                    disabled={uploading}
                                  />
                                  <label
                                    htmlFor={`photo-upload-${booking.id}`}
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      {uploading ? "Uploading..." : "Click to upload photos (max 5)"}
                                    </p>
                                  </label>
                                </div>

                                {/* Photos Grid */}
                                {photos.length > 0 ? (
                                  <div className="grid grid-cols-3 gap-4">
                                    {photos.map((photo) => (
                                      <div key={photo.id} className="relative group">
                                        <img
                                          src={photo.photo_url}
                                          alt="Task"
                                          className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                          onClick={() => deletePhoto(photo.id)}
                                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {format(new Date(photo.uploaded_at), "PP")}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-center text-muted-foreground py-4">No photos uploaded yet</p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Completed Jobs Tab */}
            <TabsContent value="completed" className="space-y-4">
              {completedJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No completed jobs yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {completedJobs.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            {booking.service_type.replace(/_/g, " ").toUpperCase()}
                          </CardTitle>
                          {getStatusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.first_name} {booking.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(booking.preferred_date), "PP")}</span>
                        </div>
                        {booking.staff_hours_worked && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.staff_hours_worked} hours worked</span>
                          </div>
                        )}
                        {booking.completed_at && (
                          <p className="text-xs text-muted-foreground">
                            Completed on {format(new Date(booking.completed_at), "PPP")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Payroll Tab */}
            <TabsContent value="payroll" className="space-y-6">
              {/* Earnings Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Hourly Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${staffDetails?.hourly_rate?.toFixed(2) || "30.00"}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned (Paid)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">${pendingPay.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Payroll Records Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payroll History
                  </CardTitle>
                  <CardDescription>Your payment records and pay slips</CardDescription>
                </CardHeader>
                <CardContent>
                  {payroll.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No payroll records yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pay Period</TableHead>
                            <TableHead className="text-right">Hours</TableHead>
                            <TableHead className="text-right">Gross</TableHead>
                            <TableHead className="text-right">Tax</TableHead>
                            <TableHead className="text-right">Super</TableHead>
                            <TableHead className="text-right">Net Pay</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payroll.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="text-sm">
                                  {format(new Date(record.pay_period_start), "dd MMM")} - {format(new Date(record.pay_period_end), "dd MMM yyyy")}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{record.hours_worked}h</TableCell>
                              <TableCell className="text-right">${record.gross_pay.toFixed(2)}</TableCell>
                              <TableCell className="text-right text-muted-foreground">-${record.tax_withheld.toFixed(2)}</TableCell>
                              <TableCell className="text-right text-muted-foreground">${record.superannuation.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium">${record.net_pay.toFixed(2)}</TableCell>
                              <TableCell>{getPaymentStatusBadge(record.payment_status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaffDashboard;