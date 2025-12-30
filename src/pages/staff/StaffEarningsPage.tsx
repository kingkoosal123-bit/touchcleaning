import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Clock,
  TrendingUp,
  Wallet,
  Calendar,
} from "lucide-react";

interface PayrollRecord {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  tax_withheld: number | null;
  superannuation: number | null;
  net_pay: number;
  bonus: number | null;
  deductions: number | null;
  payment_status: string | null;
  payment_date: string | null;
}

interface StaffDetails {
  hourly_rate: number | null;
  total_hours_worked: number | null;
  total_earnings: number | null;
  total_tasks_completed: number | null;
  average_rating: number | null;
}

const StaffEarningsPage = () => {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [staffDetails, setStaffDetails] = useState<StaffDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [payrollRes, detailsRes] = await Promise.all([
      supabase
        .from("staff_payroll")
        .select("*")
        .order("pay_period_end", { ascending: false }),
      supabase
        .from("staff_details")
        .select("hourly_rate, total_hours_worked, total_earnings, total_tasks_completed, average_rating")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (payrollRes.data) {
      setPayroll(payrollRes.data as PayrollRecord[]);
    }
    if (detailsRes.data) {
      setStaffDetails(detailsRes.data);
    }

    setLoading(false);
  };

  const totalEarned = payroll
    .filter((p) => p.payment_status === "paid")
    .reduce((acc, p) => acc + p.net_pay, 0);

  const pendingPay = payroll
    .filter((p) => p.payment_status === "pending")
    .reduce((acc, p) => acc + p.net_pay, 0);

  const totalHours = payroll.reduce((acc, p) => acc + p.hours_worked, 0);

  const getPaymentStatusBadge = (status: string | null) => {
    const config: Record<string, { bg: string; label: string }> = {
      paid: { bg: "bg-green-500/10 text-green-600", label: "Paid" },
      pending: { bg: "bg-amber-500/10 text-amber-600", label: "Pending" },
      processing: { bg: "bg-blue-500/10 text-blue-600", label: "Processing" },
    };
    const { bg, label } = config[status || "pending"] || { bg: "bg-muted", label: status || "Unknown" };
    return <Badge className={`${bg} border-0`}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">View your earnings and payroll history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">${pendingPay.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Pending Pay</p>
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
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                <p className="text-sm text-muted-foreground">Hours Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">${staffDetails?.hourly_rate || 0}/hr</div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll History
          </CardTitle>
          <CardDescription>View your payment records</CardDescription>
        </CardHeader>
        <CardContent>
          {payroll.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No payroll records yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Super</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(record.pay_period_start), "MMM d")} -</p>
                        <p>{format(new Date(record.pay_period_end), "MMM d, yyyy")}</p>
                      </div>
                    </TableCell>
                    <TableCell>{record.hours_worked}h</TableCell>
                    <TableCell>${record.hourly_rate}/hr</TableCell>
                    <TableCell>${record.gross_pay.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      -${(record.tax_withheld || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      -${(record.superannuation || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium">${record.net_pay.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(record.payment_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffEarningsPage;
