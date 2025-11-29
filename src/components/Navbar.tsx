import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/touch-cleaning-logo.svg";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Locations", path: "/locations" },
    { name: "Our Team", path: "/team" },
    { name: "Gallery", path: "/gallery" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Touch Cleaning Australia" className="h-12 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Button asChild variant="default" size="lg">
                  <Link to="/book">Book Now</Link>
                </Button>
                <Button variant="outline" size="lg" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" size="lg">
                  <Link to="/book">Book Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
              {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Button asChild variant="default" className="w-full" size="lg">
                  <Link to="/book" onClick={() => setIsOpen(false)}>Book Now</Link>
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" className="w-full" size="lg">
                  <Link to="/book" onClick={() => setIsOpen(false)}>Book Now</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
