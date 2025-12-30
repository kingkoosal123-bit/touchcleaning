import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CheckCircle, Clock, User, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface CompletedBooking {
  id: string;
  service_type: string;
  property_type: string;
  first_name: string;
  last_name: string;
  staff_hours_worked: number | null;
  completed_at: string | null;
  staff_id: string | null;
  staff_name?: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  payroll_created: boolean;
}

const AdminBookingPayroll = () => {
  const [bookings, setBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [staffDetails, setStaffDetails] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    hourly_rate: 30,
    bonus: 0,
    bonus_reason: "",
    tax_deduction: 20,
    other_deductions: 0,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    setLoading(true);
    
    // Fetch completed bookings with staff assigned
    const { data: completedBookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "completed")
      .not("staff_id", "is", null)
      .order("completed_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch bookings" });
      setLoading(false);
      return;
    }

    if (completedBookings && completedBookings.length > 0) {
      // Get staff names
      const staffIds = [...new Set(completedBookings.map(b => b.staff_id).filter(Boolean))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", staffIds as string[]);

      // Check which bookings already have payroll created
      const { data: existingPayrolls } = await supabase
        .from("staff_payroll")
        .select("id, notes")
        .like("notes", "%booking_id:%");

      const bookingIdsWithPayroll = new Set(
        existingPayrolls?.map(p => {
          const match = p.notes?.match(/booking_id:([a-f0-9-]+)/);
          return match ? match[1] : null;
        }).filter(Boolean)
      );

      const enrichedBookings = completedBookings.map(b => ({
        ...b,
        staff_name: profiles?.find(p => p.id === b.staff_id)?.full_name || "Unknown",
        payroll_created: bookingIdsWithPayroll.has(b.id),
      }));

      setBookings(enrichedBookings);
    } else {
      setBookings([]);
    }

    setLoading(false);
  };

  const openPayrollDialog = async (booking: CompletedBooking) => {
    setSelectedBooking(booking);
    
    // Fetch staff details to get hourly rate
    if (booking.staff_id) {
      const { data: details } = await supabase
        .from("staff_details")
        .select("*")
        .eq("user_id", booking.staff_id)
        .single();

      if (details) {
        setStaffDetails(details);
        setFormData(prev => ({
          ...prev,
          hourly_rate: details.hourly_rate || 30,
        }));
      }
    }

    setDialogOpen(true);
  };

  const calculatePayroll = () => {
    if (!selectedBooking) return { gross: 0, tax: 0, superAmount: 0, net: 0 };

    const hours = selectedBooking.staff_hours_worked || 0;
    const gross = (hours * formData.hourly_rate) + formData.bonus - formData.other_deductions;
    const tax = gross * (formData.tax_deduction / 100);
    const superAmount = gross * 0.115; // 11.5% superannuation
    const net = gross - tax;

    return { gross, tax, superAmount, net };
  };

  const handleCreatePayroll = async () => {
    if (!selectedBooking || !staffDetails) return;
    
    setProcessingPayroll(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Not authenticated" });
      setProcessingPayroll(false);
      return;
    }

    const calc = calculatePayroll();
    const today = new Date();
    const payPeriodStart = selectedBooking.completed_at 
      ? new Date(selectedBooking.completed_at).toISOString().split("T")[0]
      : today.toISOString().split("T")[0];

    // Create payroll record
    const { error: payrollError } = await supabase.from("staff_payroll").insert({
      staff_id: staffDetails.id,
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodStart,
      hours_worked: selectedBooking.staff_hours_worked || 0,
      hourly_rate: formData.hourly_rate,
      gross_pay: calc.gross,
      tax_withheld: calc.tax,
      superannuation: calc.superAmount,
      net_pay: calc.net,
      bonus: formData.bonus,
      bonus_reason: formData.bonus_reason || null,
      deductions: formData.other_deductions,
      created_by: user.id,
      payment_status: "pending",
      notes: `booking_id:${selectedBooking.id}`,
    });

    if (payrollError) {
      toast({ variant: "destructive", title: "Error", description: payrollError.message });
      setProcessingPayroll(false);
      return;
    }

    // Update staff total earnings
    const { error: updateError } = await supabase
      .from("staff_details")
      .update({
        total_earnings: (staffDetails.total_earnings || 0) + calc.net,
        total_hours_worked: (staffDetails.total_hours_worked || 0) + (selectedBooking.staff_hours_worked || 0),
        total_tasks_completed: (staffDetails.total_tasks_completed || 0) + 1,
      })
      .eq("id", staffDetails.id);

    if (updateError) {
      console.error("Failed to update staff details:", updateError);
    }

    // Update booking actual cost
    await supabase
      .from("bookings")
      .update({ actual_cost: calc.gross })
      .eq("id", selectedBooking.id);

    toast({ title: "Success", description: "Payroll created successfully" });
    setDialogOpen(false);
    setSelectedBooking(null);
    setFormData({ hourly_rate: 30, bonus: 0, bonus_reason: "", tax_deduction: 20, other_deductions: 0 });
    fetchCompletedBookings();
    setProcessingPayroll(false);
  };

  const calc = calculatePayroll();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payroll from Bookings</h1>
          <p className="text-muted-foreground">Create payroll records for completed bookings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payroll</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.filter(b => !b.payroll_created).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.reduce((sum, b) => sum + (b.staff_hours_worked || 0), 0).toFixed(1)}h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payroll Created</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.filter(b => b.payroll_created).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Bookings</CardTitle>
            <CardDescription>Review completed jobs and create payroll for staff</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed bookings found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.service_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.property_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.first_name} {booking.last_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {booking.staff_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {booking.staff_hours_worked || 0}h
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.completed_at 
                          ? format(new Date(booking.completed_at), "MMM d, yyyy")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        {booking.payroll_created ? (
                          <Badge className="bg-green-500">Payroll Created</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!booking.payroll_created && (
                          <Button 
                            size="sm" 
                            onClick={() => openPayrollDialog(booking)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Create Payroll
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Payroll Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Payroll from Booking</DialogTitle>
              <DialogDescription>
                Set pay details for this completed job
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                {/* Booking Info */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">
                        {selectedBooking.service_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Staff:</span>
                      <span className="font-medium">{selectedBooking.staff_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours Worked:</span>
                      <span className="font-medium">{selectedBooking.staff_hours_worked || 0}h</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Pay Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Tax Deduction (%)</Label>
                    <Input
                      type="number"
                      value={formData.tax_deduction}
                      onChange={(e) => setFormData({ ...formData, tax_deduction: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bonus ($)</Label>
                    <Input
                      type="number"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Other Deductions ($)</Label>
                    <Input
                      type="number"
                      value={formData.other_deductions}
                      onChange={(e) => setFormData({ ...formData, other_deductions: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {formData.bonus > 0 && (
                  <div>
                    <Label>Bonus Reason</Label>
                    <Input
                      placeholder="e.g., Excellent work, customer tip"
                      value={formData.bonus_reason}
                      onChange={(e) => setFormData({ ...formData, bonus_reason: e.target.value })}
                    />
                  </div>
                )}

                {/* Calculation Summary */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>Gross Pay:</div>
                    <div className="font-semibold text-right">${calc.gross.toFixed(2)}</div>
                    <div>Tax ({formData.tax_deduction}%):</div>
                    <div className="font-semibold text-right">-${calc.tax.toFixed(2)}</div>
                    <div>Superannuation (11.5%):</div>
                    <div className="font-semibold text-right">${calc.superAmount.toFixed(2)}</div>
                    <div className="border-t pt-2">Net Pay:</div>
                    <div className="font-bold text-primary text-right border-t pt-2">${calc.net.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleCreatePayroll} 
                  className="w-full"
                  disabled={processingPayroll}
                >
                  {processingPayroll ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <DollarSign className="h-4 w-4 mr-2" />
                  )}
                  Create Payroll Record
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBookingPayroll;
