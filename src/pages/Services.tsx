import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Sparkles, Wind, Droplets, Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import residentialImage from "@/assets/residential-clean.jpg";
import commercialImage from "@/assets/commercial-clean.jpg";

const Services = () => {
  const services = [
    {
      icon: Building2,
      title: "Commercial Cleaning",
      description: "Professional cleaning services for offices, retail spaces, and commercial properties. We understand the importance of maintaining a clean and professional environment for your business.",
      features: [
        "Office cleaning",
        "Retail space maintenance",
        "Industrial cleaning",
        "Post-construction cleanup",
      ],
    },
    {
      icon: Home,
      title: "Residential Cleaning",
      description: "Comprehensive home cleaning solutions tailored to your lifestyle. From regular maintenance to deep cleaning, we've got your home covered.",
      features: [
        "Regular house cleaning",
        "Deep cleaning services",
        "Move in/out cleaning",
        "Spring cleaning",
      ],
    },
    {
      icon: Sparkles,
      title: "Deep Cleaning",
      description: "Intensive cleaning services that go beyond surface-level maintenance. Perfect for seasonal refreshes or special occasions.",
      features: [
        "Kitchen deep clean",
        "Bathroom sanitization",
        "Appliance cleaning",
        "Detailed dusting",
      ],
    },
    {
      icon: Wind,
      title: "Carpet & Upholstery",
      description: "Professional carpet and upholstery cleaning using advanced equipment and eco-friendly solutions to restore freshness.",
      features: [
        "Carpet steam cleaning",
        "Stain removal",
        "Upholstery cleaning",
        "Odor elimination",
      ],
    },
    {
      icon: Droplets,
      title: "Window Cleaning",
      description: "Crystal-clear window cleaning services for both residential and commercial properties, ensuring streak-free shine.",
      features: [
        "Interior window cleaning",
        "Exterior window cleaning",
        "High-rise window access",
        "Screen cleaning",
      ],
    },
    {
      icon: Briefcase,
      title: "Specialized Services",
      description: "Custom cleaning solutions for unique requirements, including government projects and specialized facilities.",
      features: [
        "Medical facility cleaning",
        "School cleaning",
        "Government projects",
        "Event cleanup",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="services" />
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
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

          {/* Featured Services with Images */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="h-64 overflow-hidden">
                <img 
                  src={residentialImage} 
                  alt="Residential cleaning services" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Home className="mr-2 h-6 w-6 text-primary" />
                  Residential Cleaning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Transform your home with our comprehensive residential cleaning services. Professional, reliable, and tailored to your lifestyle.
                </p>
                <Button asChild>
                  <Link to="/contact">Get a Quote</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="h-64 overflow-hidden">
                <img 
                  src={commercialImage} 
                  alt="Commercial cleaning services" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Building2 className="mr-2 h-6 w-6 text-secondary" />
                  Commercial Cleaning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Maintain a professional environment with our commercial cleaning solutions. Trusted by 500+ businesses across Sydney.
                </p>
                <Button asChild>
                  <Link to="/contact">Get a Quote</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

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
