import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  ChevronRight,
  Play,
  CheckCircle,
  ThumbsUp,
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface JobCardProps {
  booking: {
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
    staff_hours_worked: number | null;
  };
  onViewDetails: (id: string) => void;
  onAccept?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export const JobCard = ({
  booking,
  onViewDetails,
  onAccept,
  onStart,
  onComplete,
}: JobCardProps) => {
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

  const statusConfig = getStatusConfig(booking.status);

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  const isUpcoming = new Date(booking.preferred_date) > new Date();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {booking.service_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {booking.property_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>
          <Badge className={`${statusConfig.bg} ${statusConfig.textColor} border-0`}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {booking.first_name} {booking.last_name}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href={`tel:${booking.phone}`} className="flex items-center gap-1 hover:text-primary">
              <Phone className="h-3 w-3" />
              {booking.phone}
            </a>
            <a href={`mailto:${booking.email}`} className="flex items-center gap-1 hover:text-primary">
              <Mail className="h-3 w-3" />
              Email
            </a>
          </div>
        </div>

        {/* Location */}
        <button
          onClick={() => openGoogleMaps(booking.service_address)}
          className="flex items-start gap-2 text-sm hover:text-primary transition-colors w-full text-left group"
        >
          <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
          <span className="group-hover:underline">{booking.service_address}</span>
        </button>

        {/* Date & Time */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={isUpcoming ? "text-primary font-medium" : ""}>
              {format(new Date(booking.preferred_date), "EEE, MMM d, yyyy")}
            </span>
          </div>
          {booking.estimated_hours && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{booking.estimated_hours}h estimated</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {booking.notes && (
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg line-clamp-2">
            {booking.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {booking.status === "pending" && onAccept && (
            <Button onClick={() => onAccept(booking.id)} className="flex-1 gap-2">
              <ThumbsUp className="h-4 w-4" />
              Accept Job
            </Button>
          )}
          {booking.status === "confirmed" && onStart && (
            <Button onClick={() => onStart(booking.id)} className="flex-1 gap-2">
              <Play className="h-4 w-4" />
              Start Job
            </Button>
          )}
          {booking.status === "in_progress" && onComplete && (
            <Button onClick={() => onComplete(booking.id)} variant="default" className="flex-1 gap-2">
              <CheckCircle className="h-4 w-4" />
              Complete Job
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onViewDetails(booking.id)}
            className="gap-2"
          >
            Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
