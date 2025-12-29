-- Fix Admin Booking RLS - Allow admins to insert bookings
CREATE POLICY "Admins can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix cms-images storage security - Drop existing policies and recreate with proper admin checks
DROP POLICY IF EXISTS "Admins can upload CMS images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update CMS images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete CMS images" ON storage.objects;

-- Recreate with proper admin role checks
CREATE POLICY "Admins can upload CMS images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'cms-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update CMS images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete CMS images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::app_role));