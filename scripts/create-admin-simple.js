#!/usr/bin/env node

// =====================================================
// SCRIPT SIMPLE POUR CRÉER ADMIN VIA DASHBOARD
// =====================================================
// Ce script donne les instructions pour créer l'admin manuellement

console.log('================================================');
console.log('🚀 CRÉATION COMPTE ADMINISTRATEUR CV-AI');
console.log('================================================');
console.log('');

console.log('📋 ÉTAPES À SUIVRE MANUELLEMENT:');
console.log('');

console.log('1️⃣ CRÉER LE COMPTE ADMIN:');
console.log('   • Allez sur: https://supabase.com/dashboard');
console.log('   • Connectez-vous à votre projet');
console.log('   • Allez dans "Authentication" → "Users"');
console.log('   • Cliquez "Add user"');
console.log('   • Email: admin@cv-ai.com');
console.log('   • Mot de passe: AdminCV-AI2025SecurePassword!');
console.log('   • Cochez "Auto-confirm"');
console.log('   • Cliquez "Add user"');
console.log('');

console.log('2️⃣ EXÉCUTER LA MIGRATION:');
console.log('   • Allez dans "SQL Editor"');
console.log('   • Copiez ce script SQL:');
console.log('');

const sqlScript = `
-- =====================================================
-- CRÉATION RÔLE ADMIN POUR admin@cv-ai.com
-- =====================================================

-- Mettre à jour le profil en admin
UPDATE public.profiles
SET role = 'admin',
    is_active = true,
    first_name = 'Administrateur',
    last_name = 'CV-AI',
    updated_at = now()
WHERE email = 'admin@cv-ai.com';

-- Vérifier que l'admin est créé
SELECT * FROM public.profiles WHERE role = 'admin';

-- Si la table n'existe pas, créer les colonnes nécessaires
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Réessayer la mise à jour
UPDATE public.profiles
SET role = 'admin',
    is_active = true,
    first_name = 'Administrateur',
    last_name = 'CV-AI',
    updated_at = now()
WHERE email = 'admin@cv-ai.com';
`;

console.log(sqlScript);
console.log('');

console.log('3️⃣ VÉRIFIER LA CRÉATION:');
console.log('   • Après exécution, vérifiez dans la table "profiles"');
console.log('   • L\'utilisateur admin@cv-ai.com doit avoir role = "admin"');
console.log('');

console.log('4️⃣ SE CONNECTER À L\'APPLICATION:');
console.log('   • Lancez: npm run dev');
console.log('   • Connectez-vous avec admin@cv-ai.com');
console.log('   • Mot de passe: AdminCV-AI2025SecurePassword!');
console.log('   • Accédez à l\'onglet admin');
console.log('');

console.log('================================================');
console.log('✅ PRÊT !');
console.log('================================================');
console.log('');
console.log('📧 Email admin: admin@cv-ai.com');
console.log('🔑 Mot de passe: AdminCV-AI2025SecurePassword!');
console.log('');
console.log('⚠️  Changez le mot de passe après la première connexion !');
console.log('');