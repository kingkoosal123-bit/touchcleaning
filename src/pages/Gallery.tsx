import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Gallery = () => {
  const galleryItems = [
    {
      category: "Commercial Projects",
      images: [
        { id: 1, title: "Corporate Office - Sydney CBD", description: "Complete office cleaning and maintenance" },
        { id: 2, title: "Retail Space - Westfield", description: "High-traffic retail cleaning" },
        { id: 3, title: "Government Building", description: "Specialized government facility cleaning" },
        { id: 4, title: "Medical Center", description: "Healthcare facility sanitization" },
      ],
    },
    {
      category: "Residential Projects",
      images: [
        { id: 5, title: "Luxury Home - Mosman", description: "Premium residential deep clean" },
        { id: 6, title: "Apartment Complex", description: "Multi-unit residential cleaning" },
        { id: 7, title: "Villa - North Shore", description: "End-of-lease cleaning service" },
        { id: 8, title: "Penthouse Suite", description: "High-end property maintenance" },
      ],
    },
    {
      category: "Specialized Services",
      images: [
        { id: 9, title: "Carpet Restoration", description: "Professional carpet steam cleaning" },
        { id: 10, title: "Window Cleaning - High Rise", description: "Commercial building exterior cleaning" },
        { id: 11, title: "Post-Construction Cleanup", description: "New building final cleaning" },
        { id: 12, title: "Industrial Facility", description: "Heavy-duty industrial cleaning" },
      ],
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
              Our Gallery
            </h1>
            <p className="text-xl text-muted-foreground">
              Showcasing our excellence across 500+ successful cleaning projects. From corporate offices to luxury residences, see the Touch Cleaning difference.
            </p>
          </div>

          {/* Gallery Categories */}
          {galleryItems.map((category, catIndex) => (
            <div key={catIndex} className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8">
                {category.category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.images.map((item) => (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-border"
                  >
                    <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center">
                      <div className="text-6xl text-primary/40 font-bold">
                        {item.id}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Stats Section */}
          <div className="mt-20 bg-muted rounded-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Projects Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-muted-foreground">Corporate Clients</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Government Projects</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Gallery;
