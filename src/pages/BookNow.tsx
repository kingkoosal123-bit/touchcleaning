import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone must be less than 20 characters"),
  address: z.string().trim().min(1, "Address is required").max(500, "Address must be less than 500 characters"),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
});

const BookNow = () => {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pre-fill service type from URL params
  useEffect(() => {
    const service = searchParams.get("service");
    if (service && ["residential", "commercial", "deep_clean", "carpet_clean", "window_clean", "end_of_lease"].includes(service)) {
      setServiceType(service);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !date || !serviceType || !propertyType) return;

    const formData = new FormData(e.currentTarget);
    const rawData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      notes: (formData.get("notes") as string) || undefined,
    };

    // Validate with zod
    const result = bookingSchema.safeParse(rawData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form.",
      });
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await supabase.from("bookings").insert([{
      customer_id: user.id,
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      email: result.data.email,
      phone: result.data.phone,
      service_type: serviceType as "residential" | "commercial" | "deep_clean" | "carpet_clean" | "window_clean" | "end_of_lease",
      property_type: propertyType as "apartment" | "house" | "office" | "retail" | "industrial",
      service_address: result.data.address,
      preferred_date: format(date, "yyyy-MM-dd"),
      notes: result.data.notes || null,
    }]);

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again.",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your booking has been submitted. We'll contact you shortly.",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Book Your Service
            </h1>
            <p className="text-xl text-muted-foreground">
              Fill out the form below and we'll get back to you with a quote within 24 hours
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Service Booking Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" placeholder="John" required maxLength={50} />
                      {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" placeholder="Smith" required maxLength={50} />
                      {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required maxLength={255} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+61 XXX XXX XXX" required maxLength={20} />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">Service Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select value={serviceType} onValueChange={setServiceType} required>
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential Cleaning</SelectItem>
                        <SelectItem value="commercial">Commercial Cleaning</SelectItem>
                        <SelectItem value="deep_clean">Deep Clean</SelectItem>
                        <SelectItem value="carpet_clean">Carpet Cleaning</SelectItem>
                        <SelectItem value="window_clean">Window Cleaning</SelectItem>
                        <SelectItem value="end_of_lease">End of Lease Clean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select value={propertyType} onValueChange={setPropertyType} required>
                      <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="retail">Retail Space</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Input id="address" name="address" placeholder="123 Main St, Sydney NSW 2000" required maxLength={500} />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Details</Label>
                    <Textarea 
                      id="notes"
                      name="notes"
                      placeholder="Tell us more about your cleaning requirements..."
                      rows={4}
                      maxLength={2000}
                    />
                    {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full" disabled={loading || !date || !serviceType || !propertyType}>
                    {loading ? "Submitting..." : "Submit Booking Request"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    By submitting this form, you agree to our terms and conditions
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookNow;