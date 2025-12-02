import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Clock, Camera, CheckCircle, Play, Upload, X, User } from "lucide-react";
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
}

interface TaskPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  uploaded_at: string;
}

const StaffDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hoursWorked, setHoursWorked] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

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
    setLoading(false);
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
    const updates: any = { status: newStatus };
    
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
      toast({ title: "Success", description: "Status updated" });
      fetchMyBookings();
    }
  };

  const updateHoursWorked = async (bookingId: string) => {
    const hours = parseFloat(hoursWorked);
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
      setHoursWorked("");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    // Max 5 photos at a time
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

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
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
          <div>
            <h1 className="text-3xl font-bold">My Jobs</h1>
            <p className="text-muted-foreground">Your assigned cleaning tasks</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </div>
                <p className="text-sm text-muted-foreground">Assigned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-500">
                  {bookings.filter((b) => b.status === "in_progress").length}
                </div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">
                  {bookings.filter((b) => b.status === "completed").length}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {bookings.reduce((acc, b) => acc + (b.staff_hours_worked || 0), 0).toFixed(1)}h
                </div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </CardContent>
            </Card>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No jobs assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.service_type.replace(/_/g, " ").toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {booking.property_type.toUpperCase()}
                        </p>
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
                    <div className="space-y-2">
                      <button
                        onClick={() => openGoogleMaps(booking.service_address)}
                        className="flex items-start gap-2 text-sm hover:text-primary transition-colors w-full text-left"
                      >
                        <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                        <span className="underline">{booking.service_address}</span>
                      </button>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(booking.preferred_date), "PPP")}</span>
                      </div>
                      {booking.estimated_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.estimated_hours}h estimated</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">{booking.notes}</p>
                      </div>
                    )}

                    {/* Hours Worked */}
                    {booking.status === "in_progress" || booking.status === "completed" ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="Hours worked"
                          value={hoursWorked}
                          onChange={(e) => setHoursWorked(e.target.value)}
                          className="w-32"
                        />
                        <Button size="sm" onClick={() => updateHoursWorked(booking.id)}>
                          Update Hours
                        </Button>
                        {booking.staff_hours_worked && (
                          <span className="text-sm text-muted-foreground">
                            Current: {booking.staff_hours_worked}h
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {booking.status === "confirmed" && (
                        <Button onClick={() => updateStatus(booking.id, "in_progress")} size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Start Work
                        </Button>
                      )}
                      {booking.status === "in_progress" && (
                        <Button onClick={() => updateStatus(booking.id, "completed")} size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}

                      {/* Photo Upload Dialog */}
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
                            {/* Upload */}
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handlePhotoUpload(e, booking.id)}
                                className="hidden"
                                id="photo-upload"
                                disabled={uploading}
                              />
                              <label
                                htmlFor="photo-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {uploading ? "Uploading..." : "Click to upload photos (max 5)"}
                                </p>
                              </label>
                            </div>

                            {/* Photos Grid */}
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
                            {photos.length === 0 && (
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaffDashboard;