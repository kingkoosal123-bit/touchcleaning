import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  hourly_rate: number;
  total_hours_worked: number;
  total_earnings: number;
}

interface PayrollRecord {
  id: string;
  staff_id: string;
  staff_name?: string;
  pay_period_start: string;
  pay_period_end: string;
  hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  tax_withheld: number;
  superannuation: number;
  net_pay: number;
  payment_status: string;
  payment_date: string | null;
}

const AdminPayroll = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: "",
    pay_period_start: "",
    pay_period_end: "",
    hours_worked: 0,
    bonus: 0,
    deductions: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch staff with their details
    const { data: staffRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "staff");

    if (staffRoles) {
      const userIds = staffRoles.map(r => r.user_id);
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const { data: staffDetails } = await supabase
        .from("staff_details")
        .select("*")
        .in("user_id", userIds);

      if (profiles && staffDetails) {
        const staffList = profiles.map(p => {
          const details = staffDetails.find(d => d.user_id === p.id);
          return {
            id: details?.id || p.id,
            user_id: p.id,
            full_name: p.full_name || "Unknown",
            hourly_rate: details?.hourly_rate || 30,
            total_hours_worked: details?.total_hours_worked || 0,
            total_earnings: details?.total_earnings || 0,
          };
        });
        setStaff(staffList);
      }
    }

    // Fetch payroll records
    const { data: payroll } = await supabase
      .from("staff_payroll")
      .select("*")
      .order("created_at", { ascending: false });

    if (payroll) {
      // Get staff names for payroll records
      const staffIds = [...new Set(payroll.map(p => p.staff_id))];
      const { data: staffDetailsForPayroll } = await supabase
        .from("staff_details")
        .select("id, user_id")
        .in("id", staffIds);

      const userIdsForPayroll = staffDetailsForPayroll?.map(s => s.user_id) || [];
      const { data: profilesForPayroll } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIdsForPayroll);

      const payrollWithNames = payroll.map(p => {
        const staffDetail = staffDetailsForPayroll?.find(s => s.id === p.staff_id);
        const profile = profilesForPayroll?.find(pr => pr.id === staffDetail?.user_id);
        return {
          ...p,
          staff_name: profile?.full_name || "Unknown",
        };
      });
      setPayrollRecords(payrollWithNames);
    }

    setLoading(false);
  };

  const calculatePayroll = () => {
    const selectedStaff = staff.find(s => s.id === formData.staff_id);
    if (!selectedStaff) return { gross: 0, tax: 0, super: 0, net: 0 };

    const gross = (formData.hours_worked * selectedStaff.hourly_rate) + formData.bonus - formData.deductions;
    const tax = gross * 0.2; // 20% tax
    const superAmount = gross * 0.115; // 11.5% superannuation
    const net = gross - tax;

    return { gross, tax, super: superAmount, net };
  };

  const handleCreatePayroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const selectedStaff = staff.find(s => s.id === formData.staff_id);
    if (!selectedStaff) return;

    const calc = calculatePayroll();

    const { error } = await supabase.from("staff_payroll").insert({
      staff_id: formData.staff_id,
      pay_period_start: formData.pay_period_start,
      pay_period_end: formData.pay_period_end,
      hours_worked: formData.hours_worked,
      hourly_rate: selectedStaff.hourly_rate,
      gross_pay: calc.gross,
      tax_withheld: calc.tax,
      superannuation: calc.super,
      net_pay: calc.net,
      bonus: formData.bonus,
      deductions: formData.deductions,
      created_by: user.id,
      payment_status: "pending",
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Payroll record created" });
      setDialogOpen(false);
      setFormData({ staff_id: "", pay_period_start: "", pay_period_end: "", hours_worked: 0, bonus: 0, deductions: 0 });
      fetchData();
    }
  };

  const updatePayrollStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("staff_payroll")
      .update({ 
        payment_status: status,
        payment_date: status === "paid" ? new Date().toISOString().split("T")[0] : null
      })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Payment status updated" });
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const calc = calculatePayroll();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Manage staff payroll and payments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Create Payroll</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Payroll Record</DialogTitle>
                <DialogDescription>Generate a new payroll entry for a staff member</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Staff Member</Label>
                  <Select value={formData.staff_id} onValueChange={(v) => setFormData({ ...formData, staff_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                    <SelectContent>
                      {staff.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.full_name} (${s.hourly_rate}/hr)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Period Start</Label>
                    <Input type="date" value={formData.pay_period_start} onChange={(e) => setFormData({ ...formData, pay_period_start: e.target.value })} />
                  </div>
                  <div>
                    <Label>Period End</Label>
                    <Input type="date" value={formData.pay_period_end} onChange={(e) => setFormData({ ...formData, pay_period_end: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Hours Worked</Label>
                    <Input type="number" value={formData.hours_worked} onChange={(e) => setFormData({ ...formData, hours_worked: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Bonus ($)</Label>
                    <Input type="number" value={formData.bonus} onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Deductions ($)</Label>
                    <Input type="number" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })} />
                  </div>
                </div>
                {formData.staff_id && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>Gross Pay: <span className="font-semibold">${calc.gross.toFixed(2)}</span></div>
                      <div>Tax (20%): <span className="font-semibold">${calc.tax.toFixed(2)}</span></div>
                      <div>Super (11.5%): <span className="font-semibold">${calc.super.toFixed(2)}</span></div>
                      <div>Net Pay: <span className="font-semibold text-primary">${calc.net.toFixed(2)}</span></div>
                    </CardContent>
                  </Card>
                )}
                <Button onClick={handleCreatePayroll} className="w-full">Create Payroll Record</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payrollRecords.filter(p => p.payment_status === "pending").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payrollRecords.filter(p => p.payment_status === "paid").reduce((sum, p) => sum + p.net_pay, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll Records</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payrollRecords.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
            <CardDescription>View and manage all payroll entries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.staff_name}</TableCell>
                      <TableCell>
                        {format(new Date(record.pay_period_start), "MMM d")} - {format(new Date(record.pay_period_end), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{record.hours_worked}h</TableCell>
                      <TableCell>${record.gross_pay.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">${record.net_pay.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(record.payment_status || "pending")}</TableCell>
                      <TableCell>
                        <Select
                          value={record.payment_status || "pending"}
                          onValueChange={(v) => updatePayrollStatus(record.id, v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayroll;
