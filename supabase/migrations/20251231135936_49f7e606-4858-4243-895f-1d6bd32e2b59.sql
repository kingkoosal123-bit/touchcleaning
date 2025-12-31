-- First, create staff_details for any existing staff users that don't have them
INSERT INTO public.staff_details (user_id, employee_id)
SELECT ur.user_id, 'EMP-' || UPPER(SUBSTRING(MD5(ur.user_id::text) FROM 1 FOR 6))
FROM public.user_roles ur
WHERE ur.role = 'staff'
  AND NOT EXISTS (
    SELECT 1 FROM public.staff_details sd WHERE sd.user_id = ur.user_id
  );

-- Add booking_type column to bookings table for day/weekly/monthly/contract options
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_type text DEFAULT 'day';

-- Add services array column for multiple services selection
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS selected_services text[] DEFAULT '{}'::text[];

-- Add end_date for recurring bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS end_date date;