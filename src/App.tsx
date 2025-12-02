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
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import CreateStaff from "./pages/admin/CreateStaff";
import CreateAdmin from "./pages/admin/CreateAdmin";
import AdminSEO from "./pages/admin/AdminSEO";
import StaffDashboard from "./pages/staff/StaffDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

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
            <Route path="/auth/admin" element={<AdminAuth />} />
            <Route path="/book" element={<ProtectedRoute><BookNow /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/staff/dashboard" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/create-staff" element={<CreateStaff />} />
            <Route path="/admin/users/create-admin" element={<CreateAdmin />} />
            <Route path="/admin/seo" element={<AdminSEO />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;