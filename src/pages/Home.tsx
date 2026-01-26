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
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              What We Offer
            </span>
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
              displayServices.map((service, index) => {
                const IconComponent = iconMap[service.icon || "Sparkles"] || Sparkles;
                return (
                  <Card 
                    key={service.id} 
                    className="group border-border/50 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="pt-8 relative">
                      {/* Decorative gradient */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                      
                      {service.image_url ? (
                        <div className="w-full h-44 rounded-xl mb-6 overflow-hidden">
                          <img 
                            src={service.image_url} 
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {service.short_description || service.description}
                      </p>
                      <Link
                        to={`/services`}
                        className="inline-flex items-center gap-2 text-primary font-medium group/link"
                      >
                        Learn More 
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline" className="group border-primary/30 hover:border-primary hover:bg-primary/5">
              <Link to="/services">
                See All Services 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                Why Us
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why Choose Touch Cleaning?
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                With over 500 satisfied clients including multinational companies and government projects, we deliver excellence in every clean.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {whyChooseUs.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-foreground text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="mt-10 group">
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              {/* Image with decorative frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 rounded-3xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <img 
                  src={teamImage} 
                  alt="Professional cleaning team" 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Floating trust badges */}
              <Card className="absolute -bottom-6 -left-6 border-border/50 bg-card/95 backdrop-blur-sm shadow-xl max-w-xs">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-primary to-primary/70 p-3 rounded-xl">
                      <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Quality Certified</h3>
                      <p className="text-xs text-muted-foreground">ISO certified services</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-secondary to-secondary/70 p-3 rounded-xl">
                      <Shield className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Fully Insured</h3>
                      <p className="text-xs text-muted-foreground">Complete peace of mind</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Expert Team</h3>
                      <p className="text-xs text-muted-foreground">Trained professionals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm">
            Get Started Today
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
            Book your cleaning service today and enjoy a spotless, fresh space
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 group shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/book">
                Book Your Service Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;