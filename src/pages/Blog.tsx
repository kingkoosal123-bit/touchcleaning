import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
  read_time: string | null;
  is_featured: boolean | null;
  image_url: string | null;
  slug: string;
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const { data, error } = await supabase
        .from("cms_blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!error && data) {
        setBlogPosts(data);
      }
      setLoading(false);
    };

    fetchBlogPosts();
  }, []);

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(blogPosts.map(post => post.category)))];

  // Filter posts by category
  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = filteredPosts.filter(post => post.is_featured);
  const recentPosts = filteredPosts.filter(post => !post.is_featured);

  // Fallback posts if CMS is empty
  const fallbackPosts: BlogPost[] = [
    {
      id: "1",
      title: "The Ultimate Guide to Office Cleaning Best Practices",
      excerpt: "Discover professional tips and techniques for maintaining a pristine office environment that boosts productivity and employee satisfaction.",
      category: "Commercial Cleaning",
      published_at: "2024-03-15",
      created_at: "2024-03-15",
      read_time: "5 min read",
      is_featured: true,
      image_url: null,
      slug: "office-cleaning-best-practices",
    },
    {
      id: "2",
      title: "Eco-Friendly Cleaning: Why It Matters for Your Business",
      excerpt: "Learn about the benefits of sustainable cleaning products and how they contribute to a healthier workplace and environment.",
      category: "Sustainability",
      published_at: "2024-03-10",
      created_at: "2024-03-10",
      read_time: "4 min read",
      is_featured: true,
      image_url: null,
      slug: "eco-friendly-cleaning",
    },
    {
      id: "3",
      title: "Deep Cleaning vs Regular Cleaning: What's the Difference?",
      excerpt: "Understanding when to schedule deep cleaning services and how they differ from regular maintenance cleaning.",
      category: "Residential",
      published_at: "2024-03-05",
      created_at: "2024-03-05",
      read_time: "6 min read",
      is_featured: false,
      image_url: null,
      slug: "deep-cleaning-vs-regular",
    },
  ];

  const displayPosts = filteredPosts.length > 0 ? filteredPosts : fallbackPosts;
  const displayFeatured = featuredPosts.length > 0 ? featuredPosts : fallbackPosts.filter(p => p.is_featured);
  const displayRecent = recentPosts.length > 0 ? recentPosts : fallbackPosts.filter(p => !p.is_featured);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Cleaning Insights & Tips
            </h1>
            <p className="text-xl text-muted-foreground">
              Expert advice, industry insights, and practical tips from Touch Cleaning's professional team.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {(blogPosts.length > 0 ? categories : ["All", "Commercial Cleaning", "Residential", "Sustainability"]).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {Array(4).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse border-border">
                  <div className="aspect-video bg-muted" />
                  <CardHeader>
                    <div className="bg-muted h-6 w-1/4 mb-3 rounded" />
                    <div className="bg-muted h-8 w-3/4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted h-16 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {displayFeatured.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-bold text-foreground mb-8">Featured Articles</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {displayFeatured.map((post) => (
                      <Card 
                        key={post.id} 
                        className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-border"
                      >
                        <div className="aspect-video overflow-hidden">
                          {post.image_url ? (
                            <img 
                              src={post.image_url} 
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center">
                              <div className="text-8xl text-primary/40 font-bold">
                                {post.title.charAt(0)}
                              </div>
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary">{post.category}</Badge>
                            <div className="flex items-center text-sm text-muted-foreground gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.published_at || post.created_at)}
                              </span>
                              {post.read_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {post.read_time}
                                </span>
                              )}
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {post.title}
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                          <Button variant="link" className="p-0 text-primary">
                            Read More <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Posts */}
              {displayRecent.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-8">Recent Articles</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayRecent.map((post) => (
                      <Card 
                        key={post.id} 
                        className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-border"
                      >
                        <div className="aspect-video overflow-hidden">
                          {post.image_url ? (
                            <img 
                              src={post.image_url} 
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/5 to-muted flex items-center justify-center">
                              <div className="text-6xl text-primary/30 font-bold">
                                {post.title.charAt(0)}
                              </div>
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <Badge variant="secondary" className="w-fit mb-3">
                            {post.category}
                          </Badge>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.published_at || post.created_at)}
                            </span>
                            {post.read_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.read_time}
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                          <Button variant="link" className="p-0 text-primary text-sm">
                            Read More <ArrowRight className="ml-2 w-3 h-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {displayPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No blog posts found for this category.</p>
                </div>
              )}
            </>
          )}

          {/* Newsletter CTA */}
          <div className="mt-20 bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated with Cleaning Tips
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for expert cleaning advice, industry insights, and exclusive offers.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Subscribe Now</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;