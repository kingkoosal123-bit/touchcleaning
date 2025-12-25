import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/touch-cleaning-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src={logo} alt="Touch Cleaning Australia" className="h-12 w-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Clean place, happier face
            </p>
            <p className="text-sm text-muted-foreground">
              Serving 500+ clients including multinational companies and government projects across Sydney, NSW.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Locations
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Team
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Sydney, NSW, Australia</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href="https://wa.link/7e8clb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    +61 452 419 700
                  </a>
                </li>
              <li className="flex items-start space-x-3">
                <Mail size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">info@touchcleaning.com.au</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.facebook.com/touchcleaningsolutions" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              {/* <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} /> */}
              {/* </a> */}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Touch Cleaning Australia. All rights reserved. 
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
