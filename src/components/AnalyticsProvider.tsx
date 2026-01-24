import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

interface AnalyticsConfig {
  googleAnalyticsId: string;
  facebookPixelId: string;
  enabled: boolean;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);

  useEffect(() => {
    // Load analytics configuration from database
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from("cms_site_settings")
          .select("setting_key, setting_value")
          .in("setting_key", ["google_analytics_id", "facebook_pixel_id", "analytics_enabled"]);

        if (data) {
          const configMap = data.reduce((acc, item) => {
            acc[item.setting_key] = item.setting_value;
            return acc;
          }, {} as Record<string, any>);

          setConfig({
            googleAnalyticsId: configMap.google_analytics_id || "",
            facebookPixelId: configMap.facebook_pixel_id || "",
            enabled: configMap.analytics_enabled !== false,
          });
        }
      } catch (error) {
        console.error("Failed to load analytics config:", error);
      }
    };

    loadConfig();
  }, []);

  // Inject Google Analytics script
  useEffect(() => {
    if (!config?.googleAnalyticsId || !config.enabled) return;

    const gaId = config.googleAnalyticsId;
    
    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
      return;
    }

    // Load gtag.js
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_path: window.location.pathname,
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
    `;
    document.head.appendChild(inlineScript);

    return () => {
      script.remove();
      inlineScript.remove();
    };
  }, [config?.googleAnalyticsId, config?.enabled]);

  // Inject Facebook Pixel
  useEffect(() => {
    if (!config?.facebookPixelId || !config.enabled) return;

    const pixelId = config.facebookPixelId;

    // Check if already loaded
    if (document.querySelector(`script[data-fb-pixel="${pixelId}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-fb-pixel", pixelId);
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [config?.facebookPixelId, config?.enabled]);

  return <>{children}</>;
};

export default AnalyticsProvider;
