import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-cleaning.jpg";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const stats = [
  { number: "500+", label: "Satisfied Clients" },
  { number: "15+", label: "Years Experience" },
  { number: "100%", label: "Satisfaction Rate" },
  { number: "24/7", label: "Support Available" },
];

const InteractiveHero = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const bubbleIdRef = useRef(0);
  const sparkleIdRef = useRef(0);
  const lastBubbleTime = useRef(0);

  const createBubble = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastBubbleTime.current < 50) return; // Throttle bubble creation
    lastBubbleTime.current = now;

    const colors = [
      "hsl(var(--primary) / 0.6)",
      "hsl(var(--secondary) / 0.5)",
      "hsl(199 91% 70% / 0.5)",
      "hsl(32 95% 68% / 0.4)",
    ];

    const newBubble: Bubble = {
      id: bubbleIdRef.current++,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      size: Math.random() * 30 + 10,
      opacity: Math.random() * 0.5 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setBubbles((prev) => [...prev.slice(-15), newBubble]); // Keep max 15 bubbles

    // Create sparkle occasionally
    if (Math.random() > 0.7) {
      const newSparkle: Sparkle = {
        id: sparkleIdRef.current++,
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        size: Math.random() * 15 + 8,
        rotation: Math.random() * 360,
      };
      setSparkles((prev) => [...prev.slice(-8), newSparkle]);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
      createBubble(x, y);
    },
    [createBubble]
  );

  // Clean up old bubbles and sparkles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => prev.filter((_, i) => i > prev.length - 12));
      setSparkles((prev) => prev.filter((_, i) => i > prev.length - 6));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative pt-40 pb-20 px-4 overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional cleaning service"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-accent/20" />
      </div>

      {/* Interactive bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full animate-[float-up_3s_ease-out_forwards]"
            style={{
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 30% 30%, white, ${bubble.color})`,
              opacity: bubble.opacity,
              boxShadow: `0 0 10px ${bubble.color}, inset 0 0 10px rgba(255,255,255,0.3)`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Sparkles */}
        {sparkles.map((sparkle) => (
          <svg
            key={sparkle.id}
            className="absolute animate-[sparkle_1.5s_ease-out_forwards]"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: sparkle.size,
              height: sparkle.size,
              transform: `translate(-50%, -50%) rotate(${sparkle.rotation}deg)`,
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
              fill="hsl(var(--primary))"
              opacity="0.8"
            />
          </svg>
        ))}

        {/* Custom cursor - cleaning wand effect */}
        <div
          className="absolute pointer-events-none z-50 transition-transform duration-75"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 bg-primary/20 rounded-full blur-xl animate-pulse" />
            {/* Cursor icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              className="drop-shadow-lg"
              style={{ transform: "translate(-8px, -8px)" }}
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                fill="hsl(var(--primary) / 0.3)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              <circle cx="12" cy="12" r="3" fill="hsl(var(--primary))" />
              {/* Cleaning rays */}
              <line
                x1="12"
                y1="2"
                x2="12"
                y2="6"
                stroke="hsl(var(--secondary))"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="22"
                stroke="hsl(var(--secondary))"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="2"
                y1="12"
                x2="6"
                y2="12"
                stroke="hsl(var(--secondary))"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="18"
                y1="12"
                x2="22"
                y2="12"
                stroke="hsl(var(--secondary))"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Clean Place,
            <span className="text-primary block mt-2 relative">
              Happier Face
              <svg
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-3"
                viewBox="0 0 200 12"
              >
                <path
                  d="M0 6 Q 50 0, 100 6 T 200 6"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="animate-[draw-line_1s_ease-out_forwards]"
                />
              </svg>
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional cleaning solutions for homes and businesses across
            Sydney, NSW
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 group">
              <Link to="/book">
                Book Now
                <span className="ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link to="/services">Our Services</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-border bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            >
              <CardContent className="pt-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-bounce" />

      {/* CSS for custom animations */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, calc(-50% - 100px)) scale(0.3);
            opacity: 0;
          }
        }
        
        @keyframes sparkle {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, calc(-50% - 50px)) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes draw-line {
          from {
            stroke-dasharray: 200;
            stroke-dashoffset: 200;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default InteractiveHero;
