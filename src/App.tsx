import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffProtectedRoute } from "@/components/staff/StaffProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import BookNow from "./pages/BookNow";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import Locations from "./pages/Locations";
import Team from "./pages/Team";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminManagers from "./pages/admin/AdminManagers";
import AdminStaff from "./pages/admin/AdminStaff";
import CreateStaff from "./pages/admin/CreateStaff";
import CreateAdmin from "./pages/admin/CreateAdmin";
import CreateBooking from "./pages/admin/CreateBooking";
import AdminPayroll from "./pages/admin/AdminPayroll";
import AdminBookingPayroll from "./pages/admin/AdminBookingPayroll";
import AdminSEO from "./pages/admin/AdminSEO";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AdminCMSServices from "./pages/admin/cms/AdminCMSServices";
import AdminCMSTeam from "./pages/admin/cms/AdminCMSTeam";
import AdminCMSLocations from "./pages/admin/cms/AdminCMSLocations";
import AdminCMSGallery from "./pages/admin/cms/AdminCMSGallery";
import AdminCMSBlog from "./pages/admin/cms/AdminCMSBlog";
import AdminCMSEnquiries from "./pages/admin/cms/AdminCMSEnquiries";
import AdminCMSSettings from "./pages/admin/cms/AdminCMSSettings";
// Staff Pages
import StaffJobsPage from "./pages/staff/StaffJobsPage";
import StaffCompletedPage from "./pages/staff/StaffCompletedPage";
import StaffSchedulePage from "./pages/staff/StaffSchedulePage";
import StaffEarningsPage from "./pages/staff/StaffEarningsPage";
import StaffProfilePage from "./pages/staff/StaffProfilePage";

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
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/team" element={<Team />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/admin" element={<AdminAuth />} />
            <Route path="/book" element={<ProtectedRoute><BookNow /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            
            {/* Staff Portal Routes */}
            <Route path="/staff" element={<StaffProtectedRoute><StaffJobsPage /></StaffProtectedRoute>} />
            <Route path="/staff/completed" element={<StaffProtectedRoute><StaffCompletedPage /></StaffProtectedRoute>} />
            <Route path="/staff/schedule" element={<StaffProtectedRoute><StaffSchedulePage /></StaffProtectedRoute>} />
            <Route path="/staff/earnings" element={<StaffProtectedRoute><StaffEarningsPage /></StaffProtectedRoute>} />
            <Route path="/staff/profile" element={<StaffProtectedRoute><StaffProfilePage /></StaffProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/bookings/create" element={<CreateBooking />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/managers" element={<AdminManagers />} />
            <Route path="/admin/managers/create" element={<CreateAdmin />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/staff/create" element={<CreateStaff />} />
            <Route path="/admin/payroll" element={<AdminPayroll />} />
            <Route path="/admin/booking-payroll" element={<AdminBookingPayroll />} />
            <Route path="/admin/seo" element={<AdminSEO />} />
            <Route path="/admin/cms/services" element={<AdminCMSServices />} />
            <Route path="/admin/cms/team" element={<AdminCMSTeam />} />
            <Route path="/admin/cms/locations" element={<AdminCMSLocations />} />
            <Route path="/admin/cms/gallery" element={<AdminCMSGallery />} />
            <Route path="/admin/cms/blog" element={<AdminCMSBlog />} />
            <Route path="/admin/cms/enquiries" element={<AdminCMSEnquiries />} />
            <Route path="/admin/cms/settings" element={<AdminCMSSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;