import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, Eye, Heart, Users, Clock, Shield, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import touchLogo from "@/assets/touch-cleaning-logo.svg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Logo */}
      <div className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="mb-8 p-6 bg-primary/10 rounded-2xl shadow-lg border-2 border-primary/30">
              <img 
                src={touchLogo} 
                alt="Touch Cleaning Logo" 
                className="h-24 md:h-32 w-auto"
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">Touch Cleaning</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
              Your trusted partner for professional cleaning solutions across Sydney, NSW. 
              Creating cleaner spaces and happier faces since 2009.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "15+", label: "Years Experience", icon: Clock },
              { value: "500+", label: "Happy Clients", icon: Users },
              { value: "100%", label: "Satisfaction", icon: Shield },
              { value: "24/7", label: "Support", icon: Sparkles },
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Story Section */}
          <div className="mb-16">
            <Card className="border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Our Story</h2>
                <p className="text-muted-foreground">Building trust, one clean at a time</p>
              </div>
              <CardContent className="pt-8 pb-8">
                <div className="space-y-5 text-muted-foreground leading-relaxed text-base md:text-lg">
                  <p>
                    Touch Cleaning Australia has been setting the standard for professional cleaning services in Sydney, NSW for over 15 years. What started as a small family business has grown into a trusted name serving over 500 clients across residential, commercial, and government sectors.
                  </p>
                  <p>
                    Our commitment to excellence and attention to detail has earned us the trust of multinational companies and government projects. We take pride in every job we undertake, treating each space as if it were our own.
                  </p>
                  <p>
                    At Touch Cleaning, we believe that a clean environment directly impacts happiness and productivity. That's why our motto, <span className="font-semibold text-primary">"Clean place, happier face,"</span> drives everything we do. We're not just cleaning spaces; we're creating environments where people can thrive.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 group hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/90 transition-colors shadow-lg">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  To provide exceptional cleaning services that exceed expectations while maintaining the highest standards of professionalism, reliability, and environmental responsibility.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5 group hover:border-secondary/60 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="bg-secondary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/90 transition-colors shadow-lg">
                  <Eye className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-secondary-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  To be Sydney's most trusted and innovative cleaning service provider, recognized for our commitment to quality, sustainability, and customer satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Core Values
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide us in delivering excellence every day
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Award, title: "Excellence", description: "We strive for perfection in every task we undertake", color: "primary" },
                { icon: Heart, title: "Integrity", description: "Honest, transparent, and ethical in all our dealings", color: "secondary" },
                { icon: Target, title: "Reliability", description: "Consistent, dependable service you can always count on", color: "primary" },
                { icon: Eye, title: "Attention", description: "Meticulous attention to detail, no corner left unturned", color: "secondary" },
              ].map((value, index) => (
                <Card key={index} className={`border-2 ${value.color === 'primary' ? 'border-primary/20 hover:border-primary/50' : 'border-secondary/20 hover:border-secondary/50'} text-center group hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <CardContent className="pt-8 pb-8">
                    <div className={`${value.color === 'primary' ? 'bg-primary' : 'bg-secondary'} w-14 h-14 rounded-xl flex items-center justify-center mb-5 mx-auto shadow-md group-hover:scale-110 transition-transform`}>
                      <value.icon className={`w-7 h-7 ${value.color === 'primary' ? 'text-primary-foreground' : 'text-secondary-foreground'}`} />
                    </div>
                    <h3 className={`text-xl font-semibold ${value.color === 'primary' ? 'text-primary' : 'text-foreground'} mb-3`}>
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Us - Enhanced */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 overflow-hidden">
            <CardContent className="pt-10 pb-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  Why Clients Choose Us
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Numbers that speak to our commitment and success
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center p-6 bg-primary/10 rounded-2xl border-2 border-primary/30 hover:bg-primary/15 transition-colors">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-3">500+</div>
                  <p className="text-lg text-foreground font-medium mb-1">Satisfied Clients</p>
                  <p className="text-sm text-muted-foreground">Across Sydney and NSW</p>
                </div>
                <div className="text-center p-6 bg-secondary/10 rounded-2xl border-2 border-secondary/30 hover:bg-secondary/15 transition-colors">
                  <div className="text-5xl md:text-6xl font-bold text-secondary-foreground mb-3">15+</div>
                  <p className="text-lg text-foreground font-medium mb-1">Years of Experience</p>
                  <p className="text-sm text-muted-foreground">Industry expertise</p>
                </div>
                <div className="text-center p-6 bg-primary/10 rounded-2xl border-2 border-primary/30 hover:bg-primary/15 transition-colors">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-3">100%</div>
                  <p className="text-lg text-foreground font-medium mb-1">Satisfaction Guarantee</p>
                  <p className="text-sm text-muted-foreground">Your happiness matters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
