-- =====================================================
-- CRÉATION SYSTÈME ADMINISTRATEUR - CV-AI BACKOFFICE
-- =====================================================
-- Version: 4.3
-- Date: 2025-10-09
-- Description: Création du rôle administrateur et des permissions

-- =====================================================
-- 1. EXTENSION DE LA TABLE PROFILES POUR LE RÔLE ADMIN
-- =====================================================

-- Ajout du champ role à la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Ajout du champ is_active pour la gestion des comptes
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Ajout du champ created_by pour suivre qui a créé l'utilisateur
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Ajout du champ last_login pour suivre l'activité
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- =====================================================
-- 2. CRÉATION DU PREMIER ADMINISTRATEUR
-- =====================================================

-- Insertion du premier admin (remplacez 'admin@cv-ai.com' par l'email souhaité)
-- NOTE: Cet utilisateur doit déjà exister dans auth.users
-- Si l'utilisateur n'existe pas, créez-le d'abord via l'auth Supabase

DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Récupérer l'ID utilisateur depuis auth.users
    -- Email admin@cv-ai.com
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@cv-ai.com' LIMIT 1;

    -- Si l'utilisateur existe, le mettre à jour comme admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'admin@cv-ai.com',
            'Administrateur',
            'CV-AI',
            'admin',
            true,
            now(),
            now()
        )
        ON CONFLICT (id)
        DO UPDATE SET
            role = 'admin',
            is_active = true,
            updated_at = now(),
            first_name = 'Administrateur',
            last_name = 'CV-AI';

        RAISE NOTICE 'Administrateur créé/mis à jour avec succès: %', admin_user_id;
    ELSE
        RAISE WARNING 'Utilisateur admin@cv-ai.com non trouvé dans auth.users. Créez dabord le compte via auth.';
    END IF;
END $$;

-- =====================================================
-- 3. CRÉATION DES TABLES DE LOG ADMIN
-- =====================================================

-- Table pour tracer les actions admin
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    target_type text, -- 'user', 'profile', 'cv', 'subscription', etc.
    target_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Table pour les statistiques admin
CREATE TABLE IF NOT EXISTS public.admin_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type text NOT NULL, -- 'users_count', 'cvs_created', 'subscriptions_active', etc.
    stat_value bigint NOT NULL,
    metadata jsonb,
    recorded_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. MISE À JOUR DES POLICIES RLS POUR L'ADMIN
-- =====================================================

-- Drop des policies existantes sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Nouvelles policies avec support admin

-- Policy de lecture: admins voient tout, utilisateurs voient leur profil
CREATE POLICY "Admins can view all profiles, users view own" ON public.profiles
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.uid() = id
    );

-- Policy d'insertion: admins peuvent insérer, utilisateurs leur propre profil
CREATE POLICY "Admins can insert any profile, users insert own" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.uid() = id
    );

-- Policy de mise à jour: admins peuvent tout mettre à jour, utilisateurs leur profil
CREATE POLICY "Admins can update any profile, users update own" ON public.profiles
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.uid() = id
    );

-- Policy de suppression: seulement les admins peuvent supprimer
CREATE POLICY "Admins can delete any profile" ON public.profiles
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- =====================================================
-- 5. POLICIES POUR LES TABLES ADMIN
-- =====================================================

-- Policies pour admin_logs (seulement les admins peuvent voir/insérer)
CREATE POLICY "Admins can view all logs" ON public.admin_logs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert logs" ON public.admin_logs
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies pour admin_stats (lecture pour tous, écriture pour admins)
CREATE POLICY "Anyone can view stats" ON public.admin_stats
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert stats" ON public.admin_stats
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 6. FONCTIONS UTILITAIRES ADMIN
-- =====================================================

-- Fonction pour vérifier si un utilisateur est admin
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

-- Fonction pour logger les actions admin
CREATE OR REPLACE FUNCTION public.log_admin_action(
    action text,
    target_type text DEFAULT NULL,
    target_id uuid DEFAULT NULL,
    details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.admin_logs (
        admin_id,
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        action,
        target_type,
        target_id,
        details,
        inet_client_addr(),
        current_setting('request.headers')::json->>'user-agent'
    );
END;
$$;

-- =====================================================
-- 7. VUES ADMINISTRATIVES
-- =====================================================

-- Vue pour les statistiques utilisateurs
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE created_at >= current_date - interval '7 days') as new_users_week,
    COUNT(*) FILTER (WHERE last_login >= current_date - interval '7 days') as active_last_week
FROM public.profiles;

-- Vue pour les détails utilisateurs avec leurs CVs
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
    COUNT(DISTINCT CASE WHEN c.type = 'cv' THEN c.id END) as cv_count,
    COUNT(DISTINCT CASE WHEN c.type = 'letter' THEN c.id END) as letter_count,
    MAX(c.created_at) as last_document_created
FROM public.profiles p
LEFT JOIN public.cv_documents c ON p.id = c.user_id
GROUP BY p.id, p.email, p.first_name, p.last_name, p.role, p.is_active, p.created_at, p.updated_at, p.last_login;

-- =====================================================
-- 8. TRIGGERS POUR LE LOG AUTOMATIQUE
-- =====================================================

-- Trigger pour logger les modifications de profils par les admins
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF public.is_admin() THEN
        PERFORM public.log_admin_action(
            TG_OP,
            'profile',
            COALESCE(NEW.id, OLD.id),
            jsonb_build_object(
                'old', row_to_json(OLD),
                'new', row_to_json(NEW)
            )
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER profile_admin_log
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

-- =====================================================
-- 9. INDEX DE PERFORMANCE
-- =====================================================

-- Index pour les requêtes admin
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);

-- =====================================================
-- 10. INSTRUCTIONS POST-CRÉATION
-- =====================================================

-- Étapes à suivre après l'exécution de ce script:

/*
1. CRÉER LE COMPTE ADMINISTRATEUR:
   - Allez dans le dashboard Supabase > Authentication
   - Cliquez "Add user"
   - Email: admin@cv-ai.com
   - Mot de passe: sécurisé de votre choix
   - Cochez "Auto-confirm"

2. EXÉCUTER CE SCRIPT:
   - Allez dans SQL Editor
   - Copiez-collez ce script
   - Exécutez

3. VÉRIFIER LA CRÉATION:
   SELECT * FROM public.profiles WHERE role = 'admin';

4. CONFIGURER L'ACCÈS ADMIN:
   - Le tableau administrateur aura accès à toutes les données
   - Utilisez la fonction is_admin() dans votre code React
   - Créez des routes protégées avec vérification du rôle

5. SÉCURITÉ:
   - Changez le mot de passe admin initial
   - Activez l'authentification à deux facteurs
   - Limitez le nombre de super admins
*/

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '===========================================================';
    RAISE NOTICE 'SYSTÈME ADMINISTRATEUR CRÉÉ AVEC SUCCÈS';
    RAISE NOTICE '===========================================================';
    RAISE NOTICE '1. Table profiles étendue avec role, is_active, etc.';
    RAISE NOTICE '2. Tables admin_logs et admin_stats créées';
    RAISE NOTICE '3. Policies RLS mises à jour pour les admins';
    RAISE NOTICE '4. Fonctions utilitaires is_admin() et log_admin_action()';
    RAISE NOTICE '5. Vues administratives créées';
    RAISE NOTICE '6. Index de performance ajoutés';
    RAISE NOTICE '';
    RAISE NOTICE 'PROCHAINES ÉTAPES:';
    RAISE NOTICE '- Créez le compte admin@cv-ai.com dans Auth';
    RAISE NOTICE '- Testez l''accès admin';
    RAISE NOTICE '- Implémentez le dashboard admin dans React';
    RAISE NOTICE '===========================================================';
END $$;