import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface PageViewData {
  path: string;
  title: string;
  referrer: string;
  timestamp: number;
}

interface SessionData {
  sessionId: string;
  startTime: number;
  pageViews: PageViewData[];
  interactions: number;
  scrollDepth: number;
}

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getStoredSession = (): SessionData | null => {
  try {
    const stored = sessionStorage.getItem("tc_analytics_session");
    if (stored) {
      const session = JSON.parse(stored);
      // Session expires after 30 minutes of inactivity
      if (Date.now() - session.startTime < 30 * 60 * 1000) {
        return session;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
};

const storeSession = (session: SessionData) => {
  try {
    sessionStorage.setItem("tc_analytics_session", JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
};

// Lightweight analytics that stores data locally and sends to GA if configured
export const useAnalyticsTracker = () => {
  const location = useLocation();
  const sessionRef = useRef<SessionData | null>(null);
  const scrollDepthRef = useRef(0);
  const interactionCountRef = useRef(0);
  const lastPathRef = useRef<string>("");

  // Initialize or restore session
  useEffect(() => {
    const existingSession = getStoredSession();
    if (existingSession) {
      sessionRef.current = existingSession;
      scrollDepthRef.current = existingSession.scrollDepth;
      interactionCountRef.current = existingSession.interactions;
    } else {
      sessionRef.current = {
        sessionId: generateSessionId(),
        startTime: Date.now(),
        pageViews: [],
        interactions: 0,
        scrollDepth: 0,
      };
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (location.pathname === lastPathRef.current) return;
    lastPathRef.current = location.pathname;

    const pageView: PageViewData = {
      path: location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    };

    if (sessionRef.current) {
      sessionRef.current.pageViews.push(pageView);
      storeSession(sessionRef.current);
    }

    // Send to Google Analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentDepth = Math.round((window.scrollY / scrollHeight) * 100);
        if (currentDepth > scrollDepthRef.current) {
          scrollDepthRef.current = currentDepth;
          if (sessionRef.current) {
            sessionRef.current.scrollDepth = currentDepth;
            storeSession(sessionRef.current);
          }
        }
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, []);

  // Track interactions
  useEffect(() => {
    const handleInteraction = () => {
      interactionCountRef.current++;
      if (sessionRef.current) {
        sessionRef.current.interactions = interactionCountRef.current;
        // Debounce storage updates
        if (interactionCountRef.current % 5 === 0) {
          storeSession(sessionRef.current);
        }
      }
    };

    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction, { passive: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Track custom events
  const trackEvent = useCallback((eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, eventData);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics Event:", eventName, eventData);
    }
  }, []);

  // Track conversions (e.g., booking completed)
  const trackConversion = useCallback((conversionType: string, value?: number) => {
    trackEvent("conversion", {
      conversion_type: conversionType,
      value: value,
      currency: "AUD",
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackConversion,
    getSession: () => sessionRef.current,
  };
};

export default useAnalyticsTracker;
