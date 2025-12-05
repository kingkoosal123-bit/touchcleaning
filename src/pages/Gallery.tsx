import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
}

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from("cms_gallery")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setGalleryItems(data);
      }
      setLoading(false);
    };

    fetchGallery();
  }, []);

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(galleryItems.map(item => item.category)))];
  
  // Filter items by category
  const filteredItems = selectedCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  // Fallback gallery if CMS is empty
  const fallbackGallery = [
    { id: "1", title: "Corporate Office - Sydney CBD", description: "Complete office cleaning and maintenance", category: "Commercial Projects", image_url: "" },
    { id: "2", title: "Retail Space - Westfield", description: "High-traffic retail cleaning", category: "Commercial Projects", image_url: "" },
    { id: "3", title: "Luxury Home - Mosman", description: "Premium residential deep clean", category: "Residential Projects", image_url: "" },
    { id: "4", title: "Carpet Restoration", description: "Professional carpet steam cleaning", category: "Specialized Services", image_url: "" },
  ];

  const displayItems = filteredItems.length > 0 ? filteredItems : (selectedCategory === "All" ? fallbackGallery : []);

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

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Gallery Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse border-border">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4">
                    <div className="bg-muted h-5 w-3/4 mb-2 rounded" />
                    <div className="bg-muted h-4 w-full rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-border"
                >
                  <div className="aspect-square overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center">
                        <div className="text-6xl text-primary/40 font-bold">
                          {item.title.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && displayItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No gallery items found for this category.</p>
            </div>
          )}

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