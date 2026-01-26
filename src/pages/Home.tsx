import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Shield, Users, Award, CheckCircle, ArrowRight, Building2, Home as HomeIcon, Layers, GraduationCap, PartyPopper, Droplets, Building } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import teamImage from "@/assets/team-cleaning.jpg";
import InteractiveHero from "@/components/home/InteractiveHero";
// Icon mapping for services
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Shield,
  Users,
  Award,
  Building2,
  Home: HomeIcon,
  Layers,
  GraduationCap,
  PartyPopper,
  Droplets,
  Building,
};

interface CMSService {
  id: string;
  title: string;
  short_description: string | null;
  description: string;
  icon: string | null;
  slug: string;
  image_url: string | null;
}

const Home = () => {
  const [services, setServices] = useState<CMSService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("cms_services")
        .select("id, title, short_description, description, icon, slug, image_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(3);

      if (!error && data) {
        setServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  const whyChooseUs = [
    "Experienced and trained professionals",
    "Eco-friendly cleaning products",
    "Flexible scheduling options",
    "Competitive pricing",
    "Insured and bonded services",
    "Quality guaranteed results",
  ];

  // Fallback services if CMS is empty
  const fallbackServices = [
    {
      id: "1",
      icon: "Sparkles",
      title: "Commercial Cleaning",
      short_description: "Professional cleaning solutions for offices, retail spaces, and commercial properties.",
      description: "",
      slug: "commercial",
      image_url: null,
    },
    {
      id: "2",
      icon: "Shield",
      title: "Residential Cleaning",
      short_description: "Quality home cleaning services tailored to your lifestyle and schedule.",
      description: "",
      slug: "residential",
      image_url: null,
    },
    {
      id: "3",
      icon: "Users",
      title: "Specialized Services",
      short_description: "Deep cleaning, carpet cleaning, window cleaning, and more specialized solutions.",
      description: "",
      slug: "deep_clean",
      image_url: null,
    },
  ];

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="home" />
      <Navbar />
      
      {/* Interactive Hero Section */}
      <InteractiveHero />

      {/* Services Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive cleaning solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="border-border animate-pulse">
                  <CardContent className="pt-8">
                    <div className="bg-muted w-16 h-16 rounded-lg mb-6" />
                    <div className="bg-muted h-8 w-3/4 mb-4 rounded" />
                    <div className="bg-muted h-20 rounded" />
                  </CardContent>
                </Card>
              ))
            ) : (
              displayServices.map((service) => {
                const IconComponent = iconMap[service.icon || "Sparkles"] || Sparkles;
                return (
                  <Card key={service.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="pt-8">
                      {service.image_url ? (
                        <div className="w-full h-40 rounded-lg mb-6 overflow-hidden">
                          <img 
                            src={service.image_url} 
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <h3 className="text-2xl font-semibold text-foreground mb-4">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {service.short_description || service.description}
                      </p>
                      <Link
                        to={`/services`}
                        className="text-primary font-medium inline-flex items-center hover:gap-2 transition-all"
                      >
                        Learn More <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/services">
                See All Services <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why Choose Touch Cleaning?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                With over 500 satisfied clients including multinational companies and government projects, we deliver excellence in every clean.
              </p>
              <div className="space-y-4">
                {whyChooseUs.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="mt-8">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={teamImage} 
                  alt="Professional cleaning team" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <Card className="absolute -bottom-6 -left-6 border-border p-6 bg-background/95 backdrop-blur">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Quality Certified</h3>
                      <p className="text-sm text-muted-foreground">ISO certified services</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Fully Insured</h3>
                      <p className="text-sm text-muted-foreground">Complete coverage for peace of mind</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Expert Team</h3>
                      <p className="text-sm text-muted-foreground">Trained and vetted professionals</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Book your cleaning service today and enjoy a spotless, fresh space
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link to="/book">Book Your Service Now</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;