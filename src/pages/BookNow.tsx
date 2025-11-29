import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const BookNow = () => {
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !date || !serviceType || !propertyType) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("bookings").insert([{
      customer_id: user.id,
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      service_type: serviceType as "residential" | "commercial" | "deep_clean" | "carpet_clean" | "window_clean" | "end_of_lease",
      property_type: propertyType as "apartment" | "house" | "office" | "retail" | "industrial",
      service_address: formData.get("address") as string,
      preferred_date: format(date, "yyyy-MM-dd"),
      notes: formData.get("notes") as string || null,
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
      
      <div className="pt-32 pb-20 px-4">
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
                      <Input id="firstName" name="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" placeholder="Smith" required />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+61 XXX XXX XXX" required />
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
                    <Input id="address" name="address" placeholder="123 Main St, Sydney NSW 2000" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Details</Label>
                    <Textarea 
                      id="notes"
                      name="notes"
                      placeholder="Tell us more about your cleaning requirements..."
                      rows={4}
                    />
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