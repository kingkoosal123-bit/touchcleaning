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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { emailService } from "@/lib/email";

const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone must be less than 20 characters"),
  address: z.string().trim().min(1, "Address is required").max(500, "Address must be less than 500 characters"),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
});

const SERVICES = [
  { id: "commercial", label: "Commercial, Office & Housekeeping" },
  { id: "floor_scrub", label: "Floor Scrub, Strip & Sealing" },
  { id: "school_childcare", label: "School, Childcare & Aged Care Cleaning" },
  { id: "hospitality", label: "Hospitality, Pub, Nightclub & Event Cleaning" },
  { id: "window_construction", label: "Professional Window & Construction Cleaning" },
  { id: "pressure_lawn", label: "High Pressure and Lawn Mowing" },
  { id: "domestic_lease", label: "Domestic & End of Lease Cleaning" },
  { id: "strata_apartment", label: "Strata, Apartment & Regular House Cleaning" },
];

const BOOKING_TYPES = [
  { id: "day", label: "One-time (Single Day)", description: "Single cleaning service" },
  { id: "weekly", label: "Weekly", description: "Recurring every week" },
  { id: "monthly", label: "Monthly", description: "Recurring every month" },
  { id: "contract", label: "Contract", description: "Long-term agreement" },
];

const BookNow = () => {
  const [searchParams] = useSearchParams();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [bookingType, setBookingType] = useState("day");
  const [propertyType, setPropertyType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pre-fill service from URL params
  useEffect(() => {
    const service = searchParams.get("service");
    if (service) {
      // Map old service types to new ones
      const serviceMap: Record<string, string> = {
        residential: "strata_apartment",
        commercial: "commercial",
        deep_clean: "domestic_lease",
        carpet_clean: "floor_scrub",
        window_clean: "window_construction",
        end_of_lease: "domestic_lease",
      };
      const mappedService = serviceMap[service] || service;
      if (SERVICES.find(s => s.id === mappedService)) {
        setSelectedServices([mappedService]);
      }
    }
  }, [searchParams]);

  // Auto-calculate end date based on booking type
  useEffect(() => {
    if (startDate && bookingType !== "day") {
      switch (bookingType) {
        case "weekly":
          setEndDate(addWeeks(startDate, 4)); // 4 weeks by default
          break;
        case "monthly":
          setEndDate(addMonths(startDate, 3)); // 3 months by default
          break;
        case "contract":
          setEndDate(addMonths(startDate, 12)); // 12 months by default
          break;
      }
    } else if (bookingType === "day") {
      setEndDate(undefined);
    }
  }, [startDate, bookingType]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !startDate || selectedServices.length === 0 || !propertyType) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one service.",
      });
      return;
    }

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

    // Use first selected service as primary service_type for backwards compatibility
    const primaryService = selectedServices[0];

    const { error } = await supabase.from("bookings").insert([{
      customer_id: user.id,
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      email: result.data.email,
      phone: result.data.phone,
      service_type: primaryService as any,
      property_type: propertyType as "apartment" | "house" | "office" | "retail" | "industrial",
      service_address: result.data.address,
      preferred_date: format(startDate, "yyyy-MM-dd"),
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
      booking_type: bookingType,
      selected_services: selectedServices,
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
      // Send booking confirmation email
      try {
        await emailService.sendBookingConfirmation(result.data.email, {
          first_name: result.data.firstName,
          last_name: result.data.lastName,
          email: result.data.email,
          phone: result.data.phone,
          service_type: SERVICES.find(s => s.id === primaryService)?.label || primaryService,
          property_type: propertyType,
          preferred_date: format(startDate, "PPP"),
          service_address: result.data.address,
          booking_type: BOOKING_TYPES.find(t => t.id === bookingType)?.label || bookingType,
          selected_services: selectedServices.map(id => SERVICES.find(s => s.id === id)?.label || id),
          notes: result.data.notes,
        });
      } catch (e) {
        console.error("Failed to send booking confirmation email:", e);
      }
      
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Book Your Service
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Fill out the form below and we'll get back to you with a quote within 24 hours
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Service Booking Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
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

                {/* Booking Type */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">Booking Type *</h3>
                  <RadioGroup value={bookingType} onValueChange={setBookingType} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BOOKING_TYPES.map((type) => (
                      <div key={type.id} className="relative">
                        <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                        <Label
                          htmlFor={type.id}
                          className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                            peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                            hover:border-primary/50"
                        >
                          <span className="font-medium text-sm text-center">{type.label}</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">{type.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Services Selection */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">Select Services * (Choose one or more)</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {SERVICES.map((service) => (
                      <div 
                        key={service.id} 
                        className={cn(
                          "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                          selectedServices.includes(service.id) 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <Checkbox 
                          id={service.id}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <Label htmlFor={service.id} className="cursor-pointer text-sm leading-tight">
                          {service.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedServices.length === 0 && (
                    <p className="text-sm text-muted-foreground">Please select at least one service</p>
                  )}
                </div>

                {/* Property & Date */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">Property & Schedule</h3>
                  
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

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{bookingType === "day" ? "Service Date *" : "Start Date *"}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {bookingType !== "day" && (
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : "Pick end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              disabled={(date) =>
                                (startDate && date < startDate) || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          {bookingType === "weekly" && "Service will repeat weekly until end date"}
                          {bookingType === "monthly" && "Service will repeat monthly until end date"}
                          {bookingType === "contract" && "Contract period end date"}
                        </p>
                      </div>
                    )}
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
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full" 
                    disabled={loading || !startDate || selectedServices.length === 0 || !propertyType}
                  >
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