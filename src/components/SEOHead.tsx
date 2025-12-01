import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  page?: string;
}

const defaultSEO = {
  home: {
    title: "Touch Cleaning Australia - Professional Cleaning Services in Sydney, NSW",
    description: "Leading professional cleaning services in Sydney. Commercial, residential, and specialized cleaning solutions. 500+ satisfied clients. Get a free quote today!",
    keywords: "cleaning services Sydney, professional cleaners NSW, commercial cleaning, residential cleaning, Touch Cleaning Australia",
  },
  services: {
    title: "Our Cleaning Services - Touch Cleaning Australia",
    description: "Comprehensive cleaning services including commercial, residential, deep cleaning, carpet cleaning, and specialized solutions across Sydney, NSW.",
    keywords: "cleaning services, commercial cleaning, residential cleaning, deep cleaning, carpet cleaning, window cleaning Sydney",
  },
  about: {
    title: "About Touch Cleaning - Professional Cleaners Since 2008",
    description: "Learn about Touch Cleaning Australia, your trusted cleaning partner with 500+ satisfied clients including government projects and multinational companies.",
    keywords: "about touch cleaning, professional cleaners, cleaning company Sydney, experienced cleaning services",
  },
  contact: {
    title: "Contact Touch Cleaning - Get Your Free Quote Today",
    description: "Contact Touch Cleaning Australia for professional cleaning services. Available 24/7. Serving Sydney and surrounding areas. Free quotes available.",
    keywords: "contact cleaning service, free cleaning quote, Sydney cleaners contact, professional cleaning inquiry",
  },
  gallery: {
    title: "Our Work Gallery - Touch Cleaning Australia",
    description: "View our portfolio of professional cleaning projects. Before and after photos of commercial and residential cleaning services in Sydney.",
    keywords: "cleaning gallery, before after cleaning, professional cleaning photos, Sydney cleaning portfolio",
  },
  locations: {
    title: "Service Areas - Touch Cleaning Sydney & NSW",
    description: "Professional cleaning services across Sydney and New South Wales. Find out if we serve your area and get a free quote today.",
    keywords: "cleaning services Sydney areas, NSW cleaning service locations, local cleaners Sydney",
  },
};

export const SEOHead = ({ title, description, keywords, page }: SEOHeadProps) => {
  useEffect(() => {
    // Load custom SEO settings from localStorage
    const saved = localStorage.getItem("seo-settings");
    let customSEO = null;
    
    if (saved && page) {
      const settings = JSON.parse(saved);
      customSEO = settings.find((s: any) => s.page === page);
    }

    // Use custom settings, props, or defaults
    const finalTitle = title || customSEO?.title || (page && defaultSEO[page as keyof typeof defaultSEO]?.title) || "Touch Cleaning Australia";
    const finalDescription = description || customSEO?.description || (page && defaultSEO[page as keyof typeof defaultSEO]?.description) || "Professional cleaning services in Sydney, NSW";
    const finalKeywords = keywords || customSEO?.keywords || (page && defaultSEO[page as keyof typeof defaultSEO]?.keywords) || "cleaning services, Sydney cleaners";

    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMetaTag("description", finalDescription);
    updateMetaTag("keywords", finalKeywords);

    // Open Graph tags for social sharing
    updateMetaTag("og:title", finalTitle);
    updateMetaTag("og:description", finalDescription);
    updateMetaTag("og:type", "website");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", finalTitle);
    updateMetaTag("twitter:description", finalDescription);
  }, [title, description, keywords, page]);

  return null;
};