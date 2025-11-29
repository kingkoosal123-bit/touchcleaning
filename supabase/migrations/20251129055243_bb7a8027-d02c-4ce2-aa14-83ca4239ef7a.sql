-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- Create enum for service types
CREATE TYPE public.service_type AS ENUM ('residential', 'commercial', 'deep_clean', 'carpet_clean', 'window_clean', 'end_of_lease');

-- Create enum for property types
CREATE TYPE public.property_type AS ENUM ('apartment', 'house', 'office', 'retail', 'industrial');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  property_type property_type NOT NULL,
  service_address TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_hours DECIMAL(4,2),
  estimated_cost DECIMAL(10,2),
  actual_hours DECIMAL(4,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for bookings

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = customer_id);

-- Customers can create their own bookings
CREATE POLICY "Customers can create own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own pending bookings
CREATE POLICY "Customers can update own pending bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = customer_id AND status = 'pending');

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings"
ON public.bookings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Staff can view their assigned bookings
CREATE POLICY "Staff can view assigned bookings"
ON public.bookings
FOR SELECT
USING (
  public.has_role(auth.uid(), 'staff') 
  AND auth.uid() = staff_id
);

-- Staff can update their assigned bookings
CREATE POLICY "Staff can update assigned bookings"
ON public.bookings
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'staff') 
  AND auth.uid() = staff_id
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_staff_id ON public.bookings(staff_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_preferred_date ON public.bookings(preferred_date);

-- Create view for booking analytics
CREATE VIEW public.booking_analytics AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  COUNT(*) as total_bookings,
  COALESCE(SUM(actual_cost) FILTER (WHERE status = 'completed'), 0) as total_revenue,
  COALESCE(AVG(actual_cost) FILTER (WHERE status = 'completed'), 0) as avg_booking_value,
  COUNT(DISTINCT customer_id) as total_customers,
  COUNT(DISTINCT staff_id) FILTER (WHERE staff_id IS NOT NULL) as active_staff
FROM public.bookings;

-- Grant access to analytics view
GRANT SELECT ON public.booking_analytics TO authenticated;

-- RLS policy for analytics view (admins only)
ALTER VIEW public.booking_analytics SET (security_invoker = on);