import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Tag, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PageSEO {
  page: string;
  title: string;
  description: string;
  keywords: string;
}

const defaultPages: PageSEO[] = [
  {
    page: "home",
    title: "Touch Cleaning Australia - Professional Cleaning Services in Sydney, NSW",
    description: "Leading professional cleaning services in Sydney. Commercial, residential, and specialized cleaning solutions. 500+ satisfied clients. Get a free quote today!",
    keywords: "cleaning services Sydney, professional cleaners NSW, commercial cleaning, residential cleaning, Touch Cleaning Australia",
  },
  {
    page: "services",
    title: "Our Cleaning Services - Touch Cleaning Australia",
    description: "Comprehensive cleaning services including commercial, residential, deep cleaning, carpet cleaning, and specialized solutions across Sydney, NSW.",
    keywords: "cleaning services, commercial cleaning, residential cleaning, deep cleaning, carpet cleaning, window cleaning Sydney",
  },
  {
    page: "about",
    title: "About Touch Cleaning - Professional Cleaners Since 2008",
    description: "Learn about Touch Cleaning Australia, your trusted cleaning partner with 500+ satisfied clients including government projects and multinational companies.",
    keywords: "about touch cleaning, professional cleaners, cleaning company Sydney, experienced cleaning services",
  },
  {
    page: "contact",
    title: "Contact Touch Cleaning - Get Your Free Quote Today",
    description: "Contact Touch Cleaning Australia for professional cleaning services. Available 24/7. Serving Sydney and surrounding areas. Free quotes available.",
    keywords: "contact cleaning service, free cleaning quote, Sydney cleaners contact, professional cleaning inquiry",
  },
];

export const SEOSettings = () => {
  const [pages, setPages] = useState<PageSEO[]>(defaultPages);
  const [activeTab, setActiveTab] = useState("home");
  const { toast } = useToast();

  useEffect(() => {
    // Load saved SEO settings from localStorage
    const saved = localStorage.getItem("seo-settings");
    if (saved) {
      setPages(JSON.parse(saved));
    }
  }, []);

  const handleSave = (page: string) => {
    localStorage.setItem("seo-settings", JSON.stringify(pages));
    toast({
      title: "SEO Settings Saved",
      description: `Meta tags for ${page} page have been updated successfully.`,
    });
  };

  const handleChange = (page: string, field: keyof PageSEO, value: string) => {
    setPages(pages.map(p => 
      p.page === page ? { ...p, [field]: value } : p
    ));
  };

  const currentPage = pages.find(p => p.page === activeTab) || pages[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage meta tags, descriptions, and keywords for better search engine visibility
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5 text-primary" />
            Search Engine Optimization
          </CardTitle>
          <CardDescription>
            Optimize your website's visibility on search engines by customizing meta tags for each page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {pages.map((page) => (
              <TabsContent key={page.page} value={page.page} className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${page.page}`} className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Page Title
                    </Label>
                    <Input
                      id={`title-${page.page}`}
                      value={page.title}
                      onChange={(e) => handleChange(page.page, "title", e.target.value)}
                      placeholder="Enter page title (50-60 characters recommended)"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {page.title.length}/60 characters - Appears in search results and browser tabs
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${page.page}`} className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      Meta Description
                    </Label>
                    <Textarea
                      id={`description-${page.page}`}
                      value={page.description}
                      onChange={(e) => handleChange(page.page, "description", e.target.value)}
                      placeholder="Enter meta description (150-160 characters recommended)"
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {page.description.length}/160 characters - Displayed in search engine results
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`keywords-${page.page}`} className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      Keywords
                    </Label>
                    <Textarea
                      id={`keywords-${page.page}`}
                      value={page.keywords}
                      onChange={(e) => handleChange(page.page, "keywords", e.target.value)}
                      placeholder="Enter comma-separated keywords"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate keywords with commas - helps search engines understand your content
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSave(page.page)} className="w-full sm:w-auto">
                      Save SEO Settings
                    </Button>
                  </div>
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-lg text-primary font-medium">{page.title}</div>
                    <div className="text-sm text-muted-foreground">{page.description}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {page.keywords.split(",").map((kw, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Title Tags:</strong> Keep under 60 characters, include primary keyword</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Meta Descriptions:</strong> 150-160 characters, compelling call-to-action</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Keywords:</strong> Focus on relevant, specific terms your customers search for</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Location:</strong> Include location-based keywords (e.g., "Sydney", "NSW")</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Unique Content:</strong> Each page should have unique meta tags</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};