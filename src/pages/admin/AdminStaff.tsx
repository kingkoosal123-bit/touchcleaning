import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Eye, Clock, UserPlus, MapPin, Image, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Staff {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  tasks_completed: number;
  tasks_assigned: number;
  total_hours: number;
  total_earnings: number;
  hourly_rate: number;
}

interface StaffTask {
  id: string;
  service_type: string;
  status: string;
  preferred_date: string;
  service_address: string;
  staff_hours_worked: number | null;
  actual_cost: number | null;
  task_accepted_at: string | null;
  task_started_at: string | null;
  completed_at: string | null;
  first_name: string;
  last_name: string;
}

interface TaskPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  uploaded_at: string;
}

const AdminStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>([]);
  const [taskPhotos, setTaskPhotos] = useState<TaskPhoto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    // Fetch staff roles
    const { data: staffRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "staff");

    if (!staffRoles || staffRoles.length === 0) {
      setStaff([]);
      setLoading(false);
      return;
    }

    const staffIds = staffRoles.map((r) => r.user_id);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", staffIds);

    // Fetch staff details
    const { data: staffDetails } = await supabase
      .from("staff_details")
      .select("user_id, hourly_rate")
      .in("user_id", staffIds);

    // Fetch bookings assigned to staff
    const { data: bookings } = await supabase
      .from("bookings")
      .select("staff_id, status, staff_hours_worked, actual_cost")
      .in("staff_id", staffIds);

    // Combine data
    const staffWithStats: Staff[] = (profiles || []).map((profile) => {
      const staffBookings = bookings?.filter((b) => b.staff_id === profile.id) || [];
      const completedTasks = staffBookings.filter((b) => b.status === "completed").length;
      const totalHours = staffBookings.reduce((sum, b) => sum + (b.staff_hours_worked || 0), 0);
      const details = staffDetails?.find((d) => d.user_id === profile.id);
      const hourlyRate = details?.hourly_rate || 30;
      const totalEarnings = totalHours * hourlyRate;

      return {
        id: profile.id,
        user_id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        tasks_completed: completedTasks,
        tasks_assigned: staffBookings.length,
        total_hours: totalHours,
        total_earnings: totalEarnings,
        hourly_rate: hourlyRate,
      };
    });

    setStaff(staffWithStats);
    setLoading(false);
  };

  const viewStaffTasks = async (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    
    const { data } = await supabase
      .from("bookings")
      .select("id, service_type, status, preferred_date, service_address, staff_hours_worked, actual_cost, task_accepted_at, task_started_at, completed_at, first_name, last_name")
      .eq("staff_id", staffMember.id)
      .order("preferred_date", { ascending: false });

    setStaffTasks(data || []);
    setDialogOpen(true);
  };

  const viewTaskPhotos = async (taskId: string) => {
    const { data } = await supabase
      .from("task_photos")
      .select("*")
      .eq("booking_id", taskId)
      .order("uploaded_at", { ascending: false });

    setTaskPhotos(data || []);
    setPhotosDialogOpen(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setEditDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;

    // Update profile
    await supabase
      .from("profiles")
      .update({
        full_name: editingStaff.full_name,
        phone: editingStaff.phone,
      })
      .eq("id", editingStaff.user_id);

    // Update staff details
    await supabase
      .from("staff_details")
      .update({
        hourly_rate: editingStaff.hourly_rate,
      })
      .eq("user_id", editingStaff.user_id);

    toast({ title: "Success", description: "Staff updated successfully" });
    setEditDialogOpen(false);
    fetchStaff();
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    // Remove staff role and make them a customer
    await supabase.from("user_roles").delete().eq("user_id", staffMember.user_id);
    await supabase.from("staff_details").update({ is_active: false }).eq("user_id", staffMember.user_id);
    await supabase.from("user_roles").insert({ user_id: staffMember.user_id, role: "customer" });

    toast({ title: "Success", description: "Staff access removed. User is now a customer." });
    fetchStaff();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      in_progress: "bg-purple-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>{status.replace("_", " ")}</Badge>;
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      (s.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground">Manage staff members who perform cleaning tasks</p>
          </div>
          <Button asChild>
            <Link to="/admin/staff/create">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Staff
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{staff.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{staff.reduce((sum, s) => sum + s.tasks_completed, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours Worked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{staff.reduce((sum, s) => sum + s.total_hours, 0).toFixed(1)}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${staff.reduce((sum, s) => sum + s.total_earnings, 0).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {staffMember.avatar_url ? (
                            <img src={staffMember.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-primary font-semibold">
                              {staffMember.full_name?.charAt(0) || "S"}
                            </span>
                          )}
                        </div>
                        <p className="font-medium">{staffMember.full_name || "No name"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{staffMember.phone || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{staffMember.tasks_assigned} assigned</Badge>
                        <Badge className="bg-green-500 text-white">{staffMember.tasks_completed} done</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {staffMember.total_hours.toFixed(1)}h
                      </div>
                    </TableCell>
                    <TableCell>${staffMember.hourly_rate}/hr</TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">${staffMember.total_earnings.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>{format(new Date(staffMember.created_at), "PP")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => viewStaffTasks(staffMember)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditStaff(staffMember)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Staff Access?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove staff privileges from {staffMember.full_name}. They will become a regular customer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStaff(staffMember)}>
                                Remove Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredStaff.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No staff members found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Tasks Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tasks for {selectedStaff?.full_name || "Staff"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {staffTasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Photos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.first_name} {task.last_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {task.service_address.substring(0, 25)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{task.service_type.replace("_", " ")}</TableCell>
                      <TableCell>{format(new Date(task.preferred_date), "PP")}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{task.staff_hours_worked?.toFixed(1) || "N/A"}h</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => viewTaskPhotos(task.id)}>
                          <Image className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No tasks found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Photos Dialog */}
      <Dialog open={photosDialogOpen} onOpenChange={setPhotosDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {taskPhotos.length > 0 ? (
              taskPhotos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <img 
                    src={photo.photo_url} 
                    alt={photo.caption || "Task photo"} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {photo.caption && <p className="text-sm text-muted-foreground">{photo.caption}</p>}
                  <p className="text-xs text-muted-foreground">{format(new Date(photo.uploaded_at), "PPp")}</p>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-muted-foreground py-8">No photos uploaded</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff: {editingStaff?.full_name}</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={editingStaff.full_name || ""}
                  onChange={(e) => setEditingStaff({ ...editingStaff, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editingStaff.phone || ""}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  value={editingStaff.hourly_rate}
                  onChange={(e) => setEditingStaff({ ...editingStaff, hourly_rate: parseFloat(e.target.value) || 30 })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateStaff}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminStaff;