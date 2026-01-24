import { Badge } from "@/components/ui/badge";
import { statusColors, formatStatus } from "@/lib/admin-utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  return (
    <Badge className={`${statusColors[status] || "bg-muted"} text-white ${className}`}>
      {formatStatus(status)}
    </Badge>
  );
};
