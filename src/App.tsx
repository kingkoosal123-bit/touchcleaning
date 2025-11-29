import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import BookNow from "./pages/BookNow";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Locations from "./pages/Locations";
import Team from "./pages/Team";
import Auth from "./pages/Auth";
import Dashboard from "./pages/dashboard/Dashboard";
import UsersManagement from "./pages/dashboard/UsersManagement";
import BookingsManagement from "./pages/dashboard/BookingsManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/team" element={<Team />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/book" element={<ProtectedRoute><BookNow /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><BookingsManagement /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
