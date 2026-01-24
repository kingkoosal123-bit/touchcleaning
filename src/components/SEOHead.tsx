import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  page?: string;
  ogImage?: string;
  noIndex?: boolean;
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
  blog: {
    title: "Cleaning Tips & News - Touch Cleaning Australia Blog",
    description: "Expert cleaning tips, industry news, and helpful guides from Touch Cleaning Australia. Learn how to keep your space spotless.",
    keywords: "cleaning tips, cleaning blog, professional cleaning advice, Sydney cleaning news",
  },
  team: {
    title: "Our Team - Touch Cleaning Australia",
    description: "Meet the dedicated professionals behind Touch Cleaning Australia. Our experienced team delivers exceptional cleaning services.",
    keywords: "cleaning team, professional cleaners, Touch Cleaning staff, Sydney cleaning experts",
  },
};

export const SEOHead = ({ title, description, keywords, page, ogImage, noIndex }: SEOHeadProps) => {
  const location = useLocation();

  useEffect(() => {
    // Load custom SEO settings from localStorage
    const saved = localStorage.getItem("seo-settings");
    let customSEO = null;
    
    if (saved && page) {
      try {
        const settings = JSON.parse(saved);
        customSEO = settings.find((s: any) => s.page === page);
      } catch {
        // Ignore parse errors
      }
    }

    // Use custom settings, props, or defaults
    const finalTitle = title || customSEO?.title || (page && defaultSEO[page as keyof typeof defaultSEO]?.title) || "Touch Cleaning Australia";
    const finalDescription = description || customSEO?.description || (page && defaultSEO[page as keyof typeof defaultSEO]?.description) || "Professional cleaning services in Sydney, NSW";
    const finalKeywords = keywords || customSEO?.keywords || (page && defaultSEO[page as keyof typeof defaultSEO]?.keywords) || "cleaning services, Sydney cleaners";
    const finalOgImage = ogImage || "https://touchcleaning.com.au/og-image.png";
    const canonicalUrl = `https://touchcleaning.com.au${location.pathname}`;

    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(isProperty ? "property" : "name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Standard meta tags
    updateMetaTag("description", finalDescription);
    updateMetaTag("keywords", finalKeywords);
    
    // Robots
    if (noIndex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    // Open Graph tags for social sharing
    updateMetaTag("og:title", finalTitle, true);
    updateMetaTag("og:description", finalDescription, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:url", canonicalUrl, true);
    updateMetaTag("og:image", finalOgImage, true);
    updateMetaTag("og:site_name", "Touch Cleaning Australia", true);
    updateMetaTag("og:locale", "en_AU", true);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", finalTitle);
    updateMetaTag("twitter:description", finalDescription);
    updateMetaTag("twitter:image", finalOgImage);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Track page view for analytics (if gtag available)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_path: location.pathname,
        page_title: finalTitle,
      });
    }
  }, [title, description, keywords, page, ogImage, noIndex, location.pathname]);

  return null;
};
