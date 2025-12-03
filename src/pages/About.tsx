import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, Eye, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              About Touch Cleaning
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your trusted partner for professional cleaning solutions across Sydney, NSW
            </p>
          </div>

          {/* Story Section */}
          <div className="mb-20">
            <Card className="border-border">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Touch Cleaning Australia has been setting the standard for professional cleaning services in Sydney, NSW for over 15 years. What started as a small family business has grown into a trusted name serving over 500 clients across residential, commercial, and government sectors.
                  </p>
                  <p>
                    Our commitment to excellence and attention to detail has earned us the trust of multinational companies and government projects. We take pride in every job we undertake, treating each space as if it were our own.
                  </p>
                  <p>
                    At Touch Cleaning, we believe that a clean environment directly impacts happiness and productivity. That's why our motto, "Clean place, happier face," drives everything we do. We're not just cleaning spaces; we're creating environments where people can thrive.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="border-border">
              <CardContent className="pt-8">
                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide exceptional cleaning services that exceed expectations while maintaining the highest standards of professionalism, reliability, and environmental responsibility.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-8">
                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To be Sydney's most trusted and innovative cleaning service provider, recognized for our commitment to quality, sustainability, and customer satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Our Core Values
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Award, title: "Excellence", description: "We strive for perfection in every task" },
                { icon: Heart, title: "Integrity", description: "Honest and transparent in all we do" },
                { icon: Target, title: "Reliability", description: "Consistent service you can count on" },
                { icon: Eye, title: "Attention to Detail", description: "No corner left unturned" },
              ].map((value, index) => (
                <Card key={index} className="border-border text-center">
                  <CardContent className="pt-8">
                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <Card className="border-border bg-muted/50">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                Why Clients Choose Us
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <p className="text-muted-foreground">Satisfied Clients</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">15+</div>
                  <p className="text-muted-foreground">Years of Experience</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <p className="text-muted-foreground">Satisfaction Guarantee</p>
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
