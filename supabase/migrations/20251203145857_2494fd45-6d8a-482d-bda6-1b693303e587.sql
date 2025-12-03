-- =============================================
-- CUSTOMER DATABASE TABLES
-- =============================================

-- Customer details table (extends profiles for customers)
CREATE TABLE public.customer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms')),
  preferred_time_slot TEXT CHECK (preferred_time_slot IN ('morning', 'afternoon', 'evening', 'flexible')),
  property_count INTEGER DEFAULT 1,
  billing_address TEXT,
  special_instructions TEXT,
  allergies_sensitivities TEXT,
  pets_info TEXT,
  access_instructions TEXT,
  loyalty_points INTEGER DEFAULT 0,
  customer_tier TEXT DEFAULT 'standard' CHECK (customer_tier IN ('standard', 'silver', 'gold', 'platinum')),
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.customer_details(id),
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  average_rating_given NUMERIC(3,2),
  last_booking_date DATE,
  first_booking_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer communication/notes log
CREATE TABLE public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customer_details(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('general', 'complaint', 'feedback', 'request', 'follow_up')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STAFF DATABASE TABLES
-- =============================================

-- Staff details table (extends profiles for staff)
CREATE TABLE public.staff_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  bank_account_name TEXT,
  bank_bsb TEXT,
  bank_account_number TEXT,
  tax_file_number TEXT,
  superannuation_fund TEXT,
  superannuation_member_number TEXT,
  hourly_rate NUMERIC(8,2) DEFAULT 30.00,
  employment_type TEXT DEFAULT 'casual' CHECK (employment_type IN ('full_time', 'part_time', 'casual', 'contractor')),
  hire_date DATE DEFAULT CURRENT_DATE,
  termination_date DATE,
  is_active BOOLEAN DEFAULT true,
  max_weekly_hours INTEGER DEFAULT 38,
  preferred_areas TEXT[],
  transport_type TEXT CHECK (transport_type IN ('car', 'public_transport', 'bicycle', 'walk')),
  has_drivers_license BOOLEAN DEFAULT false,
  license_expiry DATE,
  police_check_date DATE,
  police_check_expiry DATE,
  wwcc_number TEXT,
  wwcc_expiry DATE,
  uniform_size TEXT,
  total_tasks_completed INTEGER DEFAULT 0,
  total_hours_worked NUMERIC(10,2) DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 5.00,
  rating_count INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  late_arrival_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff skills and certifications
CREATE TABLE public.staff_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_details(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level TEXT DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  certification_name TEXT,
  certification_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff availability schedule
CREATE TABLE public.staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_details(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, day_of_week)
);

-- Staff time off / leave requests
CREATE TABLE public.staff_leave (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_details(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'personal', 'unpaid', 'public_holiday')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff payroll records
CREATE TABLE public.staff_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_details(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  hours_worked NUMERIC(8,2) NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(8,2) NOT NULL,
  gross_pay NUMERIC(10,2) NOT NULL,
  tax_withheld NUMERIC(10,2) DEFAULT 0,
  superannuation NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  net_pay NUMERIC(10,2) NOT NULL,
  bonus NUMERIC(10,2) DEFAULT 0,
  bonus_reason TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  payment_date DATE,
  payment_reference TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff performance reviews
CREATE TABLE public.staff_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_details(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ADMIN DATABASE TABLES
-- =============================================

-- Admin details table (extends profiles for admins)
CREATE TABLE public.admin_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_level TEXT DEFAULT 'standard' CHECK (admin_level IN ('standard', 'senior', 'super')),
  department TEXT,
  can_manage_staff BOOLEAN DEFAULT true,
  can_manage_customers BOOLEAN DEFAULT true,
  can_manage_bookings BOOLEAN DEFAULT true,
  can_manage_payments BOOLEAN DEFAULT true,
  can_manage_admins BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,
  can_edit_settings BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin activity logs
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL NEW TABLES
-- =============================================

ALTER TABLE public.customer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_leave ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - CUSTOMER TABLES
-- =============================================

-- Customer details policies
CREATE POLICY "Customers can view own details" ON public.customer_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own details" ON public.customer_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all customer details" ON public.customer_details
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all customer details" ON public.customer_details
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Customer notes policies (admin only)
CREATE POLICY "Admins can manage customer notes" ON public.customer_notes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - STAFF TABLES
-- =============================================

-- Staff details policies
CREATE POLICY "Staff can view own details" ON public.staff_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can update limited own details" ON public.staff_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all staff details" ON public.staff_details
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all staff details" ON public.staff_details
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff skills policies
CREATE POLICY "Staff can view own skills" ON public.staff_skills
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_details WHERE id = staff_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage staff skills" ON public.staff_skills
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff availability policies
CREATE POLICY "Staff can view own availability" ON public.staff_availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_details WHERE id = staff_id AND user_id = auth.uid())
  );

CREATE POLICY "Staff can manage own availability" ON public.staff_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.staff_details WHERE id = staff_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all staff availability" ON public.staff_availability
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all staff availability" ON public.staff_availability
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff leave policies
CREATE POLICY "Staff can view own leave" ON public.staff_leave
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_details WHERE id = staff_id AND user_id = auth.uid())
  );

CREATE POLICY "Staff can request leave" ON public.staff_leave
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.staff_details WHERE id = staff_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all leave" ON public.staff_leave
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff payroll policies (admin only)
CREATE POLICY "Staff can view own payroll" ON public.staff_payroll
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_details WHERE id = staff_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage payroll" ON public.staff_payroll
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff reviews policies
CREATE POLICY "Staff can view own reviews" ON public.staff_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_details WHERE id = staff_id AND user_id = auth.uid())
  );

CREATE POLICY "Customers can create reviews" ON public.staff_reviews
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'customer'));

CREATE POLICY "Admins can manage reviews" ON public.staff_reviews
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - ADMIN TABLES
-- =============================================

-- Admin details policies
CREATE POLICY "Admins can view own details" ON public.admin_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all admin details" ON public.admin_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_details ad 
      WHERE ad.user_id = auth.uid() AND ad.admin_level = 'super'
    )
  );

-- Admin activity logs policies
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activity logs" ON public.admin_activity_logs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_customer_details_updated_at
  BEFORE UPDATE ON public.customer_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_notes_updated_at
  BEFORE UPDATE ON public.customer_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_details_updated_at
  BEFORE UPDATE ON public.staff_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_availability_updated_at
  BEFORE UPDATE ON public.staff_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_leave_updated_at
  BEFORE UPDATE ON public.staff_leave
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_payroll_updated_at
  BEFORE UPDATE ON public.staff_payroll
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_details_updated_at
  BEFORE UPDATE ON public.admin_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCTION TO AUTO-CREATE ROLE-SPECIFIC DETAILS
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_role_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create customer details when customer role assigned
  IF NEW.role = 'customer' THEN
    INSERT INTO public.customer_details (user_id, referral_code)
    VALUES (NEW.user_id, UPPER(SUBSTRING(MD5(NEW.user_id::text) FROM 1 FOR 8)))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Create staff details when staff role assigned
  IF NEW.role = 'staff' THEN
    INSERT INTO public.staff_details (user_id, employee_id)
    VALUES (NEW.user_id, 'EMP-' || UPPER(SUBSTRING(MD5(NEW.user_id::text) FROM 1 FOR 6)))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Create admin details when admin role assigned
  IF NEW.role = 'admin' THEN
    INSERT INTO public.admin_details (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create role-specific details
CREATE TRIGGER on_user_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_role_details();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_customer_details_user_id ON public.customer_details(user_id);
CREATE INDEX idx_customer_details_tier ON public.customer_details(customer_tier);
CREATE INDEX idx_customer_notes_customer_id ON public.customer_notes(customer_id);
CREATE INDEX idx_staff_details_user_id ON public.staff_details(user_id);
CREATE INDEX idx_staff_details_is_active ON public.staff_details(is_active);
CREATE INDEX idx_staff_skills_staff_id ON public.staff_skills(staff_id);
CREATE INDEX idx_staff_availability_staff_id ON public.staff_availability(staff_id);
CREATE INDEX idx_staff_leave_staff_id ON public.staff_leave(staff_id);
CREATE INDEX idx_staff_leave_status ON public.staff_leave(status);
CREATE INDEX idx_staff_payroll_staff_id ON public.staff_payroll(staff_id);
CREATE INDEX idx_staff_payroll_period ON public.staff_payroll(pay_period_start, pay_period_end);
CREATE INDEX idx_staff_reviews_staff_id ON public.staff_reviews(staff_id);
CREATE INDEX idx_admin_details_user_id ON public.admin_details(user_id);
CREATE INDEX idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);