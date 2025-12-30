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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
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
  const [remarks, setRemarks] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (open && bookingId) {
      fetchBookingDetails();
      fetchPhotos();
      setShowCompletionForm(false);
      setValidationError("");
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
      setRemarks(data.notes || "");
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
      if (newStatus === "completed") {
        onOpenChange(false);
      }
    }
    setUpdatingStatus(false);
  };

  const handleCompleteJobClick = () => {
    setShowCompletionForm(true);
    setValidationError("");
  };

  const validateAndCompleteJob = async () => {
    const hours = parseFloat(hoursWorked);
    
    if (!hoursWorked || isNaN(hours) || hours <= 0) {
      setValidationError("Please enter valid hours worked (required)");
      return;
    }

    // Save hours and remarks first
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ 
        staff_hours_worked: hours,
        notes: remarks || booking?.notes
      })
      .eq("id", bookingId);

    if (updateError) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save job details" });
      return;
    }

    // Then complete the job
    await updateStatus("completed");
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
      <DialogContent className="max-w-2xl max-h-[90vh] mx-4 w-[calc(100vw-2rem)]">
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
          ) : showCompletionForm ? (
            /* Job Completion Form */
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Complete Job - Final Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {validationError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{validationError}</span>
                    </div>
                  )}

                  {/* Hours Worked - Required */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Hours Worked <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="Enter total hours worked"
                      value={hoursWorked}
                      onChange={(e) => {
                        setHoursWorked(e.target.value);
                        setValidationError("");
                      }}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Required: Enter the actual hours you worked on this job</p>
                  </div>

                  {/* Photo Upload - Optional */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      Job Photos <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Label
                      htmlFor="completion-photo-upload"
                      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                      <span>{uploading ? "Uploading..." : "Click to upload photos"}</span>
                      <input
                        id="completion-photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                    </Label>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.photo_url}
                              alt="Job photo"
                              className="w-full h-16 object-cover rounded-lg"
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
                    <p className="text-xs text-muted-foreground">Upload before/after photos of your work</p>
                  </div>

                  {/* Remarks - Optional */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Remarks / Notes <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Textarea
                      placeholder="Add any notes about the job, special circumstances, or feedback..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Any additional notes for the manager</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCompletionForm(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={validateAndCompleteJob}
                  disabled={updatingStatus}
                  className="flex-1 gap-2"
                >
                  {updatingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Save & Complete Job
                </Button>
              </div>
            </div>
          ) : (
            /* Regular Job Details View */
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

              {/* Completed Job Info */}
              {booking.status === "completed" && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Completion Details
                    </h4>
                    <div className="bg-green-500/10 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Hours Worked:</span>
                        <span className="font-semibold">{booking.staff_hours_worked || 0}h</span>
                      </div>
                      {booking.completed_at && (
                        <div className="flex justify-between">
                          <span>Completed At:</span>
                          <span>{format(new Date(booking.completed_at), "MMM d, yyyy h:mm a")}</span>
                        </div>
                      )}
                      {photos.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm mb-2">Photos: {photos.length}</p>
                          <div className="grid grid-cols-4 gap-2">
                            {photos.map((photo) => (
                              <img
                                key={photo.id}
                                src={photo.photo_url}
                                alt="Job photo"
                                className="w-full h-16 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
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
                    onClick={handleCompleteJobClick}
                    disabled={updatingStatus}
                    className="flex-1 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
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
