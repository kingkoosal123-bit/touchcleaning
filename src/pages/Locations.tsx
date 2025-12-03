import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Locations = () => {
  const serviceAreas = [
    {
      area: "Sydney CBD",
      suburbs: ["Circular Quay", "Barangaroo", "Darling Harbour", "The Rocks", "Martin Place"],
      description: "Complete commercial and residential cleaning services in the heart of Sydney.",
    },
    {
      area: "Eastern Suburbs",
      suburbs: ["Bondi", "Double Bay", "Paddington", "Randwick", "Coogee"],
      description: "Premium cleaning solutions for homes and businesses in Sydney's Eastern Suburbs.",
    },
    {
      area: "North Shore",
      suburbs: ["Chatswood", "Mosman", "Neutral Bay", "North Sydney", "Hornsby"],
      description: "Trusted cleaning services across all North Shore locations.",
    },
    {
      area: "Inner West",
      suburbs: ["Newtown", "Leichhardt", "Balmain", "Marrickville", "Ashfield"],
      description: "Professional cleaning for Inner West homes and commercial properties.",
    },
    {
      area: "Western Suburbs",
      suburbs: ["Parramatta", "Penrith", "Blacktown", "Liverpool", "Campbelltown"],
      description: "Comprehensive cleaning services throughout Western Sydney.",
    },
    {
      area: "Southern Suburbs",
      suburbs: ["Sutherland", "Cronulla", "Hurstville", "Kogarah", "Miranda"],
      description: "Quality cleaning solutions for Southern Sydney residents and businesses.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Our Service Locations
            </h1>
            <p className="text-xl text-muted-foreground">
              Touch Cleaning proudly serves all areas across Sydney, NSW. From the CBD to the suburbs, we're here to help.
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="mb-16">
            <Card className="overflow-hidden border-border">
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-muted flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBvcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                <div className="text-center z-10">
                  <MapPin className="w-24 h-24 text-primary mx-auto mb-4 opacity-60" />
                  <p className="text-2xl font-semibold text-foreground mb-2">Interactive Map</p>
                  <p className="text-muted-foreground">Sydney-wide service coverage</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Service Areas Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Areas We Serve
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceAreas.map((location, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{location.area}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{location.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {location.suburbs.map((suburb, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-muted px-3 py-1 rounded-full text-foreground"
                        >
                          {suburb}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Head Office</p>
                    <p className="text-muted-foreground">Sydney, NSW, Australia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-muted-foreground">+61 XXX XXX XXX</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground">info@touchcleaning.com.au</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Operating Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-foreground">Monday - Friday</span>
                      <span className="text-muted-foreground">7:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-foreground">Saturday</span>
                      <span className="text-muted-foreground">8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-foreground">Sunday</span>
                      <span className="text-muted-foreground">9:00 AM - 3:00 PM</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-primary font-semibold">
                        24/7 Emergency Services Available
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't See Your Area Listed?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              We're continuously expanding our service areas. Contact us to check if we can serve your location.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/book">Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Locations;
