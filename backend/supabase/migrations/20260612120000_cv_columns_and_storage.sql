-- ============================================
-- CV alanları + "cvs" storage bucket
-- --------------------------------------------
-- Frontend (frontend/app/settings/cv.tsx) ve edge functions
-- (analyze-fit, ai-suggestions) aşağıdaki kolonları ve "cvs" bucket'ını
-- kullanıyor; ancak hiçbir migration bunları oluşturmuyordu. Bu migration
-- eksikleri tamamlar. Tekrar çalıştırılabilir (idempotent) yazılmıştır.
-- ============================================

-- 1. profiles tablosuna CV kolonları
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cv_text TEXT,
  ADD COLUMN IF NOT EXISTS cv_file_path TEXT,
  ADD COLUMN IF NOT EXISTS cv_file_name TEXT;

-- 2. Özel (private) "cvs" storage bucket'ı
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS — kullanıcı yalnız kendi klasörüne erişir.
--    Dosya yolu "<uid>/cv.pdf" biçimindedir (bkz. settings/cv.tsx),
--    yani klasörün ilk parçası kullanıcının uid'i olmalı.
DROP POLICY IF EXISTS "Users can read own CV files" ON storage.objects;
CREATE POLICY "Users can read own CV files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can upload own CV files" ON storage.objects;
CREATE POLICY "Users can upload own CV files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own CV files" ON storage.objects;
CREATE POLICY "Users can update own CV files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own CV files" ON storage.objects;
CREATE POLICY "Users can delete own CV files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
