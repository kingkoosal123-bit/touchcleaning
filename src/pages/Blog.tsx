import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Ultimate Guide to Office Cleaning Best Practices",
      excerpt: "Discover professional tips and techniques for maintaining a pristine office environment that boosts productivity and employee satisfaction.",
      category: "Commercial Cleaning",
      date: "March 15, 2024",
      readTime: "5 min read",
      featured: true,
    },
    {
      id: 2,
      title: "Eco-Friendly Cleaning: Why It Matters for Your Business",
      excerpt: "Learn about the benefits of sustainable cleaning products and how they contribute to a healthier workplace and environment.",
      category: "Sustainability",
      date: "March 10, 2024",
      readTime: "4 min read",
      featured: true,
    },
    {
      id: 3,
      title: "Deep Cleaning vs Regular Cleaning: What's the Difference?",
      excerpt: "Understanding when to schedule deep cleaning services and how they differ from regular maintenance cleaning.",
      category: "Residential",
      date: "March 5, 2024",
      readTime: "6 min read",
      featured: false,
    },
    {
      id: 4,
      title: "How to Prepare Your Office for Professional Cleaning",
      excerpt: "A comprehensive checklist to help you maximize the effectiveness of your commercial cleaning service.",
      category: "Tips & Tricks",
      date: "February 28, 2024",
      readTime: "3 min read",
      featured: false,
    },
    {
      id: 5,
      title: "The Benefits of Regular Carpet Cleaning for Businesses",
      excerpt: "Why investing in professional carpet cleaning services can save you money and improve your business image.",
      category: "Commercial Cleaning",
      date: "February 20, 2024",
      readTime: "5 min read",
      featured: false,
    },
    {
      id: 6,
      title: "Top 10 Areas Often Overlooked During Home Cleaning",
      excerpt: "Ensure your home is truly clean by paying attention to these commonly missed spots during routine cleaning.",
      category: "Residential",
      date: "February 15, 2024",
      readTime: "4 min read",
      featured: false,
    },
  ];

  const categories = ["All", "Commercial Cleaning", "Residential", "Sustainability", "Tips & Tricks"];

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
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Posts */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts
                .filter((post) => post.featured)
                .map((post) => (
                  <Card 
                    key={post.id} 
                    className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-border"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center">
                      <div className="text-8xl text-primary/40 font-bold">
                        {post.id}
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary">{post.category}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </span>
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

          {/* Recent Posts */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">Recent Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts
                .filter((post) => !post.featured)
                .map((post) => (
                  <Card 
                    key={post.id} 
                    className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-border"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-muted flex items-center justify-center">
                      <div className="text-6xl text-primary/30 font-bold">
                        {post.id}
                      </div>
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
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
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
