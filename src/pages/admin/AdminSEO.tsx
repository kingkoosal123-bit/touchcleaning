import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FileText, Globe, Search, Share2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

const defaultPages: Record<string, PageSEO> = {
  home: {
    title: "Touch Cleaning Australia - Professional Cleaning Services",
    description: "Professional cleaning services for residential and commercial properties in Australia. Book your cleaning service today!",
    keywords: "cleaning services, professional cleaning, house cleaning, office cleaning, Australia",
    ogImage: "",
  },
  services: {
    title: "Our Services - Touch Cleaning Australia",
    description: "Explore our wide range of cleaning services including residential, commercial, deep cleaning, and more.",
    keywords: "cleaning services, residential cleaning, commercial cleaning, deep cleaning",
    ogImage: "",
  },
  about: {
    title: "About Us - Touch Cleaning Australia",
    description: "Learn about Touch Cleaning Australia, our mission, values, and commitment to quality cleaning services.",
    keywords: "about touch cleaning, cleaning company, professional cleaners",
    ogImage: "",
  },
  contact: {
    title: "Contact Us - Touch Cleaning Australia",
    description: "Get in touch with Touch Cleaning Australia. We're here to help with all your cleaning needs.",
    keywords: "contact cleaning service, book cleaning, cleaning quote",
    ogImage: "",
  },
  locations: {
    title: "Our Locations - Touch Cleaning Australia",
    description: "Find Touch Cleaning services near you. We serve multiple locations across Australia.",
    keywords: "cleaning locations, cleaning near me, local cleaning service",
    ogImage: "",
  },
};

const AdminSEO = () => {
  const [pages, setPages] = useState(defaultPages);
  const [globalSettings, setGlobalSettings] = useState({
    siteName: "Touch Cleaning Australia",
    siteUrl: "https://touchcleaning.com.au",
    googleAnalyticsId: "",
    facebookPixelId: "",
  });
  const { toast } = useToast();

  const handlePageUpdate = (page: string, field: keyof PageSEO, value: string) => {
    setPages((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to database
    localStorage.setItem("seo_settings", JSON.stringify({ pages, globalSettings }));
    toast({
      title: "Settings Saved",
      description: "SEO settings have been saved successfully.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">Manage meta tags, descriptions, and SEO settings for your website</p>
        </div>

        {/* Global Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Settings
            </CardTitle>
            <CardDescription>Configure site-wide SEO settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={globalSettings.siteName}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input
                  value={globalSettings.siteUrl}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, siteUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  value={globalSettings.googleAnalyticsId}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <Input
                  value={globalSettings.facebookPixelId}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, facebookPixelId: e.target.value })}
                  placeholder="XXXXXXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page-specific Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Page SEO Settings
            </CardTitle>
            <CardDescription>Configure meta tags for each page</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(pages).map(([page, seo]) => (
                <AccordionItem key={page} value={page}>
                  <AccordionTrigger className="capitalize">{page} Page</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Meta Title</Label>
                      <Input
                        value={seo.title}
                        onChange={(e) => handlePageUpdate(page, "title", e.target.value)}
                        placeholder="Page title (50-60 characters recommended)"
                      />
                      <p className="text-xs text-muted-foreground">{seo.title.length}/60 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea
                        value={seo.description}
                        onChange={(e) => handlePageUpdate(page, "description", e.target.value)}
                        placeholder="Page description (150-160 characters recommended)"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">{seo.description.length}/160 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input
                        value={seo.keywords}
                        onChange={(e) => handlePageUpdate(page, "keywords", e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image URL</Label>
                      <Input
                        value={seo.ogImage}
                        onChange={(e) => handlePageUpdate(page, "ogImage", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* SEO Tips */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep meta titles under 60 characters</li>
              <li>• Meta descriptions should be 150-160 characters</li>
              <li>• Include primary keywords naturally in titles and descriptions</li>
              <li>• Use unique titles and descriptions for each page</li>
              <li>• OG images should be at least 1200x630 pixels</li>
              <li>• Update content regularly for better rankings</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSEO;