import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Sparkles, Wind, Droplets, Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

// Icon mapping for services
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Home,
  Sparkles,
  Wind,
  Droplets,
  Briefcase,
};

interface CMSService {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  features: string[] | null;
  icon: string | null;
  image_url: string | null;
  is_featured: boolean | null;
}

const Services = () => {
  const [services, setServices] = useState<CMSService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("cms_services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  // Fallback services if CMS is empty
  const fallbackServices: CMSService[] = [
    {
      id: "1",
      icon: "Building2",
      title: "Commercial Cleaning",
      slug: "commercial",
      description: "Professional cleaning services for offices, retail spaces, and commercial properties. We understand the importance of maintaining a clean and professional environment for your business.",
      short_description: null,
      features: ["Office cleaning", "Retail space maintenance", "Industrial cleaning", "Post-construction cleanup"],
      image_url: null,
      is_featured: true,
    },
    {
      id: "2",
      icon: "Home",
      title: "Residential Cleaning",
      slug: "residential",
      description: "Comprehensive home cleaning solutions tailored to your lifestyle. From regular maintenance to deep cleaning, we've got your home covered.",
      short_description: null,
      features: ["Regular house cleaning", "Deep cleaning services", "Move in/out cleaning", "Spring cleaning"],
      image_url: null,
      is_featured: true,
    },
    {
      id: "3",
      icon: "Sparkles",
      title: "Deep Cleaning",
      slug: "deep_clean",
      description: "Intensive cleaning services that go beyond surface-level maintenance. Perfect for seasonal refreshes or special occasions.",
      short_description: null,
      features: ["Kitchen deep clean", "Bathroom sanitization", "Appliance cleaning", "Detailed dusting"],
      image_url: null,
      is_featured: false,
    },
    {
      id: "4",
      icon: "Wind",
      title: "Carpet & Upholstery",
      slug: "carpet_clean",
      description: "Professional carpet and upholstery cleaning using advanced equipment and eco-friendly solutions to restore freshness.",
      short_description: null,
      features: ["Carpet steam cleaning", "Stain removal", "Upholstery cleaning", "Odor elimination"],
      image_url: null,
      is_featured: false,
    },
    {
      id: "5",
      icon: "Droplets",
      title: "Window Cleaning",
      slug: "window_clean",
      description: "Crystal-clear window cleaning services for both residential and commercial properties, ensuring streak-free shine.",
      short_description: null,
      features: ["Interior window cleaning", "Exterior window cleaning", "High-rise window access", "Screen cleaning"],
      image_url: null,
      is_featured: false,
    },
    {
      id: "6",
      icon: "Briefcase",
      title: "End of Lease",
      slug: "end_of_lease",
      description: "Thorough end of lease cleaning to ensure you get your bond back. We cover every detail required by property managers.",
      short_description: null,
      features: ["Full property cleaning", "Carpet steam cleaning", "Oven & appliance cleaning", "Window & blind cleaning"],
      image_url: null,
      is_featured: false,
    },
  ];

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="services" />
      <Navbar />
      
      <div className="pt-40 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive cleaning solutions designed to meet your specific needs, backed by years of experience and 500+ satisfied clients.
            </p>
          </div>

          {/* Services Grid */}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {Array(6).fill(0).map((_, index) => (
                <Card key={index} className="border-border animate-pulse">
                  <CardHeader>
                    <div className="bg-muted w-16 h-16 rounded-lg mb-4" />
                    <div className="bg-muted h-8 w-3/4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted h-24 rounded mb-4" />
                    <div className="bg-muted h-10 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {displayServices.map((service) => {
                const IconComponent = iconMap[service.icon || "Sparkles"] || Sparkles;
                return (
                  <Card key={service.id} className="border-border hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col">
                    {service.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={service.image_url} 
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      {!service.image_url && (
                        <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <CardTitle className="text-2xl">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-muted-foreground mb-6">{service.description}</p>
                      {service.features && service.features.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-auto">
                        <Button asChild className="w-full">
                          <Link to={`/book?service=${service.slug}`}>Book Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-muted rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need a Custom Cleaning Solution?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We offer customized cleaning packages tailored to your specific requirements. Get in touch with us to discuss your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/book">Book a Service</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;