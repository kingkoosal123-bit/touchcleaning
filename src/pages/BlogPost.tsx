import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sanitizeHTML } from "@/lib/sanitize";

interface BlogPost {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
  read_time: string | null;
  image_url: string | null;
  slug: string;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("cms_blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (!error && data) {
        setPost(data);
        
        // Fetch related posts
        const { data: related } = await supabase
          .from("cms_blog_posts")
          .select("*")
          .eq("is_published", true)
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(3);
        
        if (related) {
          setRelatedPosts(related);
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-40 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-12 bg-muted rounded w-3/4" />
              <div className="aspect-video bg-muted rounded-xl" />
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-40 pb-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${post.title} | Touch Cleaning Blog`}
        description={post.excerpt || "Read professional cleaning tips from Touch Cleaning Australia"}
        keywords={`${post.category}, cleaning tips, Touch Cleaning blog`}
      />
      <Navbar />

      <article className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
          </Button>

          {/* Header */}
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              {post.read_time && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.read_time}
                </span>
              )}
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Touch Cleaning Team
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {post.image_url ? (
            <div className="aspect-video rounded-xl overflow-hidden mb-12">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl overflow-hidden mb-12 bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center">
              <div className="text-9xl text-primary/30 font-bold">
                {post.title.charAt(0)}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="max-w-none">
            {post.content ? (
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
                className="blog-content"
              />
            ) : (
              <p className="text-muted-foreground text-lg">{post.excerpt}</p>
            )}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-primary text-primary-foreground rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Need Professional Cleaning?</h3>
            <p className="mb-6 opacity-90">
              Get a spotless space with Touch Cleaning's expert services
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link to="/book">Book Now</Link>
            </Button>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                      {relatedPost.image_url ? (
                        <img 
                          src={relatedPost.image_url} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
                          <span className="text-4xl text-primary/30 font-bold">
                            {relatedPost.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
