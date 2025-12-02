-- Create storage bucket for task photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create task_photos table
CREATE TABLE public.task_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;

-- Admins can view all photos
CREATE POLICY "Admins can view all task photos"
ON public.task_photos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Staff can view photos they uploaded
CREATE POLICY "Staff can view own task photos"
ON public.task_photos
FOR SELECT
USING (auth.uid() = staff_id);

-- Staff can upload photos for their assigned tasks
CREATE POLICY "Staff can upload task photos"
ON public.task_photos
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role) AND 
  auth.uid() = staff_id AND
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id AND staff_id = auth.uid()
  )
);

-- Staff can delete their own photos
CREATE POLICY "Staff can delete own task photos"
ON public.task_photos
FOR DELETE
USING (auth.uid() = staff_id);

-- Storage policies for task-photos bucket
CREATE POLICY "Staff can upload task photos to storage"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'task-photos' AND 
  has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY "Anyone authenticated can view task photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'task-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Staff can delete own task photos from storage"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'task-photos' AND 
  has_role(auth.uid(), 'staff'::app_role) AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add task_status enum for more granular tracking
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('assigned', 'accepted', 'working', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add columns to bookings for staff task tracking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS task_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS task_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS staff_hours_worked NUMERIC,
ADD COLUMN IF NOT EXISTS service_location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS service_location_lng NUMERIC;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_task_photos_booking_id ON public.task_photos(booking_id);
CREATE INDEX IF NOT EXISTS idx_task_photos_staff_id ON public.task_photos(staff_id);