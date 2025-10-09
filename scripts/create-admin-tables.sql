-- =====================================================
-- CRÉATION SYSTÈME ADMIN SIMPLIFIÉ - CV-AI
-- =====================================================
-- Script pour créer les tables admin de base

-- 1. Vérifier et créer les colonnes manquantes dans profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Créer la table admin_logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    target_type text,
    target_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- 3. Créer la table admin_stats
CREATE TABLE IF NOT EXISTS public.admin_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type text NOT NULL,
    stat_value bigint NOT NULL,
    metadata jsonb,
    recorded_at timestamptz DEFAULT now()
);

-- 4. Créer les vues admin
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE created_at >= current_date - interval '7 days') as new_users_week,
    COUNT(*) FILTER (WHERE last_login >= current_date - interval '7 days') as active_last_week
FROM public.profiles;

CREATE OR REPLACE VIEW public.admin_users_with_content AS
SELECT
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.is_active,
    p.created_at,
    p.updated_at,
    p.last_login,
    0 as cv_count, -- Valeur par défaut
    0 as letter_count, -- Valeur par défaut
    p.created_at as last_document_created
FROM public.profiles p;

-- 5. Créer les indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);

-- 6. Créer la fonction is_admin simplifiée
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin' AND is_active = true
    );
$$;

-- 7. Activer RLS sur les nouvelles tables
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_stats ENABLE ROW LEVEL SECURITY;

-- 8. Créer les policies RLS
-- Policies pour admin_logs
CREATE POLICY IF NOT EXISTS "Admins can view all logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
    );

CREATE POLICY IF NOT EXISTS "Admins can insert logs" ON public.admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
    );

-- Policies pour admin_stats
CREATE POLICY IF NOT EXISTS "Anyone can view stats" ON public.admin_stats
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins can insert stats" ON public.admin_stats
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
    );

-- 9. Mettre à jour les policies existantes pour profiles si nécessaire
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Créer nouvelles policies pour profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles, users view own" ON public.profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true) OR
        auth.uid() = id
    );

CREATE POLICY IF NOT EXISTS "Admins can insert any profile, users insert own" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true) OR
        auth.uid() = id
    );

CREATE POLICY IF NOT EXISTS "Admins can update any profile, users update own" ON public.profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true) OR
        auth.uid() = id
    );

CREATE POLICY IF NOT EXISTS "Admins can delete any profile" ON public.profiles
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
    );

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'SYSTÈME ADMIN CRÉÉ AVEC SUCCÈS';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '✅ Table profiles étendue';
    RAISE NOTICE '✅ Tables admin_logs et admin_stats créées';
    RAISE NOTICE '✅ Vues admin créées';
    RAISE NOTICE '✅ Fonction is_admin() créée';
    RAISE NOTICE '✅ Policies RLS configurées';
    RAISE NOTICE '';
    RAISE NOTICE 'PROCHAINE ÉTAPE: Créer l utilisateur admin';
    RAISE NOTICE '=================================================';
END $$;