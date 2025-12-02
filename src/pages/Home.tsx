import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Shield, Users, Award, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import heroImage from "@/assets/hero-cleaning.jpg";
import teamImage from "@/assets/team-cleaning.jpg";

const Home = () => {
  const services = [
    {
      icon: Sparkles,
      title: "Commercial Cleaning",
      description: "Professional cleaning solutions for offices, retail spaces, and commercial properties.",
    },
    {
      icon: Shield,
      title: "Residential Cleaning",
      description: "Quality home cleaning services tailored to your lifestyle and schedule.",
    },
    {
      icon: Users,
      title: "Specialized Services",
      description: "Deep cleaning, carpet cleaning, window cleaning, and more specialized solutions.",
    },
  ];

  const stats = [
    { number: "500+", label: "Satisfied Clients" },
    { number: "15+", label: "Years Experience" },
    { number: "100%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" },
  ];

  const whyChooseUs = [
    "Experienced and trained professionals",
    "Eco-friendly cleaning products",
    "Flexible scheduling options",
    "Competitive pricing",
    "Insured and bonded services",
    "Quality guaranteed results",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="home" />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Professional cleaning service" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-accent/20" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Clean Place,
              <span className="text-primary block mt-2">Happier Face</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional cleaning solutions for homes and businesses across Sydney, NSW
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/book">Book Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/services">Our Services</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border bg-card/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
            {services.map((service, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <Link
                    to="/services"
                    className="text-primary font-medium inline-flex items-center hover:gap-2 transition-all"
                  >
                    Learn More <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
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
