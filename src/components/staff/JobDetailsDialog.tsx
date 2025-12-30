import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Camera,
  Upload,
  X,
  Play,
  CheckCircle,
  ThumbsUp,
  FileText,
  Loader2,
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface TaskPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  uploaded_at: string;
}

interface JobDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  onStatusUpdate: () => void;
}

export const JobDetailsDialog = ({
  open,
  onOpenChange,
  bookingId,
  onStatusUpdate,
}: JobDetailsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any>(null);
  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hoursWorked, setHoursWorked] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (open && bookingId) {
      fetchBookingDetails();
      fetchPhotos();
    }
  }, [open, bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (!error && data) {
      setBooking(data);
      setHoursWorked(data.staff_hours_worked?.toString() || "");
    }
    setLoading(false);
  };

  const fetchPhotos = async () => {
    if (!bookingId) return;

    const { data } = await supabase
      .from("task_photos")
      .select("*")
      .eq("booking_id", bookingId)
      .order("uploaded_at", { ascending: false });

    if (data) {
      setPhotos(data);
    }
  };

  const updateStatus = async (newStatus: BookingStatus) => {
    if (!bookingId) return;
    setUpdatingStatus(true);

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
      toast({
        title: "Success",
        description: `Job ${newStatus === "confirmed" ? "accepted" : newStatus === "in_progress" ? "started" : "completed"}`,
      });
      fetchBookingDetails();
      onStatusUpdate();
    }
    setUpdatingStatus(false);
  };

  const updateHours = async () => {
    if (!bookingId) return;
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
      toast({ title: "Success", description: "Hours saved" });
      fetchBookingDetails();
      onStatusUpdate();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user || !bookingId) return;

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
    fetchPhotos();
    setUploading(false);
    e.target.value = "";
  };

  const deletePhoto = async (photoId: string) => {
    const { error } = await supabase.from("task_photos").delete().eq("id", photoId);
    if (!error) {
      fetchPhotos();
      toast({ title: "Photo deleted" });
    }
  };

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; label: string; textColor: string }> = {
      pending: { bg: "bg-amber-500/10", label: "New Assignment", textColor: "text-amber-600" },
      confirmed: { bg: "bg-blue-500/10", label: "Accepted", textColor: "text-blue-600" },
      in_progress: { bg: "bg-purple-500/10", label: "In Progress", textColor: "text-purple-600" },
      completed: { bg: "bg-green-500/10", label: "Completed", textColor: "text-green-600" },
      cancelled: { bg: "bg-red-500/10", label: "Cancelled", textColor: "text-red-600" },
    };
    return config[status] || { bg: "bg-muted", label: status, textColor: "text-muted-foreground" };
  };

  if (!booking) return null;

  const statusConfig = getStatusConfig(booking.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Job Details</span>
            <Badge className={`${statusConfig.bg} ${statusConfig.textColor} border-0`}>
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Service Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {booking.service_type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </h3>
                <p className="text-muted-foreground">
                  {booking.property_type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">{booking.first_name} {booking.last_name}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <a href={`tel:${booking.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Phone className="h-3 w-3" />
                      {booking.phone}
                    </a>
                    <a href={`mailto:${booking.email}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Mail className="h-3 w-3" />
                      {booking.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <button
                  onClick={() => openGoogleMaps(booking.service_address)}
                  className="text-primary hover:underline text-left"
                >
                  {booking.service_address}
                </button>
              </div>

              {/* Schedule */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </h4>
                <div className="flex items-center gap-4">
                  <span>{format(new Date(booking.preferred_date), "EEEE, MMMM d, yyyy")}</span>
                  {booking.estimated_hours && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {booking.estimated_hours}h estimated
                    </Badge>
                  )}
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h4>
                  <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg">
                    {booking.notes}
                  </p>
                </div>
              )}

              <Separator />

              {/* Hours Worked */}
              {(booking.status === "in_progress" || booking.status === "completed") && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hours Worked
                  </h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="Enter hours"
                      value={hoursWorked}
                      onChange={(e) => setHoursWorked(e.target.value)}
                      className="w-32"
                    />
                    <Button variant="secondary" onClick={updateHours}>
                      Save Hours
                    </Button>
                    {booking.staff_hours_worked && (
                      <span className="text-sm text-muted-foreground">
                        Current: {booking.staff_hours_worked}h
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Photo Upload */}
              {(booking.status === "in_progress" || booking.status === "completed") && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Job Photos (Optional)
                  </h4>
                  <div className="space-y-3">
                    <Label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                      <span>{uploading ? "Uploading..." : "Click to upload photos"}</span>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                    </Label>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.photo_url}
                              alt="Job photo"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => deletePhoto(photo.id)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Status Actions */}
              <div className="flex items-center gap-2">
                {booking.status === "pending" && (
                  <Button
                    onClick={() => updateStatus("confirmed")}
                    disabled={updatingStatus}
                    className="flex-1 gap-2"
                  >
                    {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                    Accept Job
                  </Button>
                )}
                {booking.status === "confirmed" && (
                  <Button
                    onClick={() => updateStatus("in_progress")}
                    disabled={updatingStatus}
                    className="flex-1 gap-2"
                  >
                    {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start Job
                  </Button>
                )}
                {booking.status === "in_progress" && (
                  <Button
                    onClick={() => updateStatus("completed")}
                    disabled={updatingStatus}
                    className="flex-1 gap-2"
                  >
                    {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Complete Job
                  </Button>
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
