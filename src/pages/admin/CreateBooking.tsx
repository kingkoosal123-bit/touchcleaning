import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { format } from "date-fns";
import { emailService } from "@/lib/email";

const adminBookingSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  last_name: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone must be less than 20 characters"),
  service_address: z.string().trim().min(1, "Address is required").max(500, "Address must be less than 500 characters"),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
  estimated_hours: z.number().min(0).max(100).optional().nullable(),
  estimated_cost: z.number().min(0).max(100000).optional().nullable(),
});

interface Customer {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

interface StaffMember {
  id: string;
  full_name: string;
}

const CreateBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customer_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    service_type: "" as "residential" | "commercial" | "deep_clean" | "carpet_clean" | "window_clean" | "end_of_lease" | "",
    property_type: "" as "apartment" | "house" | "office" | "retail" | "industrial" | "",
    service_address: "",
    preferred_date: "",
    staff_id: "",
    estimated_hours: "",
    estimated_cost: "",
    notes: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomersAndStaff();
  }, []);

  const fetchCustomersAndStaff = async () => {
    // Fetch customers
    const { data: customerRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "customer");

    if (customerRoles) {
      const userIds = customerRoles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      if (profiles) {
        setCustomers(profiles.map(p => ({
          id: p.id,
          full_name: p.full_name || "Unknown",
          phone: p.phone || "",
        })));
      }
    }

    // Fetch staff
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

      if (profiles) {
        setStaff(profiles.map(p => ({
          id: p.id,
          full_name: p.full_name || "Unknown",
        })));
      }
    }
  };

  const handleCustomerSelect = async (customerId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", customerId)
      .maybeSingle();

    if (profile) {
      const nameParts = (profile.full_name || "").split(" ");
      setFormData({
        ...formData,
        customer_id: customerId,
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        phone: profile.phone || "",
        service_address: profile.address || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_type || !formData.property_type) {
      toast({ variant: "destructive", title: "Error", description: "Please select service and property type" });
      return;
    }

    // Validate with zod
    const rawData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      service_address: formData.service_address,
      notes: formData.notes || undefined,
      estimated_hours: formData.estimated_hours ? Number(formData.estimated_hours) : null,
      estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : null,
    };

    const result = adminBookingSchema.safeParse(rawData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({ variant: "destructive", title: "Validation Error", description: "Please fix the errors in the form." });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const bookingData = {
        customer_id: formData.customer_id,
        first_name: result.data.first_name,
        last_name: result.data.last_name,
        email: result.data.email,
        phone: result.data.phone,
        service_type: formData.service_type as "residential" | "commercial" | "deep_clean" | "carpet_clean" | "window_clean" | "end_of_lease",
        property_type: formData.property_type as "apartment" | "house" | "office" | "retail" | "industrial",
        service_address: result.data.service_address,
        preferred_date: formData.preferred_date,
        staff_id: formData.staff_id || null,
        estimated_hours: result.data.estimated_hours,
        estimated_cost: result.data.estimated_cost,
        notes: result.data.notes || null,
        status: formData.staff_id ? "confirmed" as const : "pending" as const,
      };

      const { error } = await supabase.from("bookings").insert(bookingData);

      if (error) throw error;

      // Send booking confirmation email to customer
      try {
        const serviceLabels: Record<string, string> = {
          residential: "Residential Cleaning",
          commercial: "Commercial Cleaning",
          deep_clean: "Deep Cleaning",
          carpet_clean: "Carpet Cleaning",
          window_clean: "Window Cleaning",
          end_of_lease: "End of Lease",
        };
        
        await emailService.sendBookingConfirmation(result.data.email, {
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          email: result.data.email,
          phone: result.data.phone,
          service_type: serviceLabels[formData.service_type] || formData.service_type,
          property_type: formData.property_type,
          preferred_date: formData.preferred_date ? format(new Date(formData.preferred_date), "PPP") : "TBD",
          service_address: result.data.service_address,
          notes: result.data.notes,
        });
      } catch (e) {
        console.error("Failed to send booking email:", e);
      }

      toast({ title: "Success", description: "Booking created successfully" });
      navigate("/admin/bookings");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }

    setIsLoading(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/bookings"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Manual Booking</h1>
            <p className="text-muted-foreground">Add a new booking for a customer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Customer Details</CardTitle>
              <CardDescription>Select existing customer or enter new details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Existing Customer (Optional)</Label>
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>First Name *</Label>
                  <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required maxLength={50} />
                  {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required maxLength={50} />
                  {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required maxLength={255} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required maxLength={20} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Service Type *</Label>
                  <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v as any })}>
                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential Cleaning</SelectItem>
                      <SelectItem value="commercial">Commercial Cleaning</SelectItem>
                      <SelectItem value="deep_clean">Deep Cleaning</SelectItem>
                      <SelectItem value="carpet_clean">Carpet Cleaning</SelectItem>
                      <SelectItem value="window_clean">Window Cleaning</SelectItem>
                      <SelectItem value="end_of_lease">End of Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Property Type *</Label>
                  <Select value={formData.property_type} onValueChange={(v) => setFormData({ ...formData, property_type: v as any })}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Preferred Date *</Label>
                <Input type="date" value={formData.preferred_date} onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Estimated Hours</Label>
                  <Input type="number" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} />
                </div>
                <div>
                  <Label>Estimated Cost ($)</Label>
                  <Input type="number" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Location & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Service Address *</Label>
                <Input value={formData.service_address} onChange={(e) => setFormData({ ...formData, service_address: e.target.value })} required maxLength={500} />
                {errors.service_address && <p className="text-sm text-destructive">{errors.service_address}</p>}
              </div>
              <div>
                <Label>Assign Staff (Optional)</Label>
                <Select value={formData.staff_id} onValueChange={(v) => setFormData({ ...formData, staff_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                  <SelectContent>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any special instructions..." maxLength={2000} />
                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Booking"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateBooking;
