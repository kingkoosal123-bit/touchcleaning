-- CMS Services table
CREATE TABLE public.cms_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  icon TEXT DEFAULT 'Sparkles',
  image_url TEXT,
  features TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Team Members table
CREATE TABLE public.cms_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  expertise TEXT[] DEFAULT '{}',
  is_leadership BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Locations table
CREATE TABLE public.cms_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name TEXT NOT NULL,
  description TEXT,
  suburbs TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Gallery table
CREATE TABLE public.cms_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Blog Posts table
CREATE TABLE public.cms_blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  author_id UUID,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  read_time TEXT DEFAULT '5 min read',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Contact Enquiries table
CREATE TABLE public.cms_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Site Settings table (key-value store for site-wide settings)
CREATE TABLE public.cms_site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cms_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for CMS content (frontend needs to read)
CREATE POLICY "Public can view active services" ON public.cms_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active team members" ON public.cms_team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active locations" ON public.cms_locations FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active gallery" ON public.cms_gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published blog posts" ON public.cms_blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view site settings" ON public.cms_site_settings FOR SELECT USING (true);

-- Public can submit enquiries
CREATE POLICY "Public can create enquiries" ON public.cms_enquiries FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admins can manage services" ON public.cms_services FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage team members" ON public.cms_team_members FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage locations" ON public.cms_locations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage gallery" ON public.cms_gallery FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage blog posts" ON public.cms_blog_posts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage enquiries" ON public.cms_enquiries FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage site settings" ON public.cms_site_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_cms_services_updated_at BEFORE UPDATE ON public.cms_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_team_members_updated_at BEFORE UPDATE ON public.cms_team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_locations_updated_at BEFORE UPDATE ON public.cms_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_gallery_updated_at BEFORE UPDATE ON public.cms_gallery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_blog_posts_updated_at BEFORE UPDATE ON public.cms_blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_enquiries_updated_at BEFORE UPDATE ON public.cms_enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_site_settings_updated_at BEFORE UPDATE ON public.cms_site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.cms_site_settings (setting_key, setting_value, category) VALUES
('company_info', '{"name": "Touch Cleaning", "tagline": "Clean Place, Happier Face", "phone": "+61 XXX XXX XXX", "email": "info@touchcleaning.com.au", "address": "Sydney, NSW, Australia"}', 'general'),
('business_hours', '{"monday_friday": "7:00 AM - 7:00 PM", "saturday": "8:00 AM - 5:00 PM", "sunday": "9:00 AM - 3:00 PM", "emergency": true}', 'general'),
('stats', '{"clients": "500+", "experience": "15+", "satisfaction": "100%", "support": "24/7"}', 'homepage'),
('why_choose_us', '["Experienced and trained professionals", "Eco-friendly cleaning products", "Flexible scheduling options", "Competitive pricing", "Insured and bonded services", "Quality guaranteed results"]', 'homepage'),
('social_links', '{"facebook": "", "instagram": "", "linkedin": "", "twitter": ""}', 'general');

-- Insert default services
INSERT INTO public.cms_services (title, slug, description, short_description, icon, features, is_featured, display_order) VALUES
('Commercial Cleaning', 'commercial', 'Professional cleaning services for offices, retail spaces, and commercial properties. We understand the importance of maintaining a clean and professional environment for your business.', 'Professional cleaning solutions for offices, retail spaces, and commercial properties.', 'Building2', '{"Office cleaning", "Retail space maintenance", "Industrial cleaning", "Post-construction cleanup"}', true, 1),
('Residential Cleaning', 'residential', 'Comprehensive home cleaning solutions tailored to your lifestyle. From regular maintenance to deep cleaning, we have got your home covered.', 'Quality home cleaning services tailored to your lifestyle and schedule.', 'Home', '{"Regular house cleaning", "Deep cleaning services", "Move in/out cleaning", "Spring cleaning"}', true, 2),
('Deep Cleaning', 'deep_clean', 'Intensive cleaning services that go beyond surface-level maintenance. Perfect for seasonal refreshes or special occasions.', 'Deep cleaning, carpet cleaning, window cleaning, and more specialized solutions.', 'Sparkles', '{"Kitchen deep clean", "Bathroom sanitization", "Appliance cleaning", "Detailed dusting"}', false, 3),
('Carpet & Upholstery', 'carpet_clean', 'Professional carpet and upholstery cleaning using advanced equipment and eco-friendly solutions to restore freshness.', 'Professional carpet and upholstery cleaning services.', 'Wind', '{"Carpet steam cleaning", "Stain removal", "Upholstery cleaning", "Odor elimination"}', false, 4),
('Window Cleaning', 'window_clean', 'Crystal-clear window cleaning services for both residential and commercial properties, ensuring streak-free shine.', 'Crystal-clear window cleaning for all properties.', 'Droplets', '{"Interior window cleaning", "Exterior window cleaning", "High-rise window access", "Screen cleaning"}', false, 5),
('End of Lease', 'end_of_lease', 'Thorough end of lease cleaning to ensure you get your bond back. We cover every detail required by property managers.', 'Get your bond back with our end of lease cleaning.', 'Briefcase', '{"Full property cleaning", "Carpet steam cleaning", "Oven & appliance cleaning", "Window & blind cleaning"}', false, 6);

-- Insert default locations
INSERT INTO public.cms_locations (area_name, description, suburbs, display_order) VALUES
('Sydney CBD', 'Complete commercial and residential cleaning services in the heart of Sydney.', '{"Circular Quay", "Barangaroo", "Darling Harbour", "The Rocks", "Martin Place"}', 1),
('Eastern Suburbs', 'Premium cleaning solutions for homes and businesses in Sydney''s Eastern Suburbs.', '{"Bondi", "Double Bay", "Paddington", "Randwick", "Coogee"}', 2),
('North Shore', 'Trusted cleaning services across all North Shore locations.', '{"Chatswood", "Mosman", "Neutral Bay", "North Sydney", "Hornsby"}', 3),
('Inner West', 'Professional cleaning for Inner West homes and commercial properties.', '{"Newtown", "Leichhardt", "Balmain", "Marrickville", "Ashfield"}', 4),
('Western Suburbs', 'Comprehensive cleaning services throughout Western Sydney.', '{"Parramatta", "Penrith", "Blacktown", "Liverpool", "Campbelltown"}', 5),
('Southern Suburbs', 'Quality cleaning solutions for Southern Sydney residents and businesses.', '{"Sutherland", "Cronulla", "Hurstville", "Kogarah", "Miranda"}', 6);

-- Insert default team members
INSERT INTO public.cms_team_members (name, role, bio, expertise, is_leadership, display_order) VALUES
('Sarah Mitchell', 'Founder & CEO', 'With over 15 years in the cleaning industry, Sarah founded Touch Cleaning with a vision to deliver exceptional service across Sydney.', '{"Business Strategy", "Client Relations", "Quality Management"}', true, 1),
('James Chen', 'Operations Director', 'James oversees all operational aspects, ensuring every project meets our high standards of excellence.', '{"Operations", "Team Leadership", "Process Optimization"}', true, 2),
('Emma Thompson', 'Head of Commercial Services', 'Leading our commercial division, Emma has secured contracts with major corporations and government agencies.', '{"Commercial Cleaning", "Contract Management", "B2B Relations"}', true, 3);