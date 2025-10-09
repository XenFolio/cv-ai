-- =====================================================
-- CRÉATION UTILISATEUR ADMIN + SYSTÈME ADMIN
-- =====================================================
-- À exécuter si vous n'avez pas encore créé le compte admin

-- 1. Créez d'abord l'utilisateur dans auth.users
-- (Ceci est une version simplifiée - en production utilisez l'UI Supabase)

-- 2. Puis exécutez le script principal 20251009_admin_system.sql

-- Pour vérifier les utilisateurs existants:
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Pour promouvoir un utilisateur existant en admin:
-- Email admin@cv-ai.com
UPDATE public.profiles
SET role = 'admin', is_active = true, first_name = 'Administrateur', last_name = 'CV-AI', updated_at = now()
WHERE email = 'admin@cv-ai.com';

-- Pour vérifier que l'admin est créé:
SELECT * FROM public.profiles WHERE role = 'admin';