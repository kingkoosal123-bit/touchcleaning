-- Create storage bucket for CMS images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms-images', 'cms-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "CMS images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'cms-images');

-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload CMS images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'cms-images' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to update their uploads
CREATE POLICY "Admins can update CMS images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'cms-images' AND auth.role() = 'authenticated');

-- Allow admins to delete images
CREATE POLICY "Admins can delete CMS images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'cms-images' AND auth.role() = 'authenticated');