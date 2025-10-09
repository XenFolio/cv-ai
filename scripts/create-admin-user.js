#!/usr/bin/env node

// =====================================================
// CRÉATION UTILISATEUR ADMIN AVEC CLIENT SUPABASE
// =====================================================
// Usage: node scripts/create-admin-user.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erreur: Variables d\'environnement manquantes');
    console.error('Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env');
    console.error('Exemple de contenu .env:');
    console.error('VITE_SUPABASE_URL=https://votre-projet.supabase.co');
    console.error('VITE_SUPABASE_ANON_KEY=votre_clé_anon');
    process.exit(1);
}

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Configuration admin
const ADMIN_CONFIG = {
    email: 'admin@cv-ai.com',
    password: 'AdminCV-AI2025SecurePassword!', // Changez ce mot de passe
    first_name: 'Administrateur',
    last_name: 'CV-AI'
};

async function createAdminUser() {
    try {
        console.log('🚀 Début de la création de l\'utilisateur admin...');
        console.log('📧 Email:', ADMIN_CONFIG.email);
        console.log('');

        // 1. Créer l'utilisateur dans auth.users
        console.log('1️⃣ Création de l\'utilisateur dans auth.users...');

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: ADMIN_CONFIG.email,
            password: ADMIN_CONFIG.password,
            email_confirm: true,
            user_metadata: {
                first_name: ADMIN_CONFIG.first_name,
                last_name: ADMIN_CONFIG.last_name,
                role: 'admin'
            }
        });

        if (authError && !authError.message.includes('already registered')) {
            throw authError;
        }

        const userId = authData.user?.id;

        if (!userId) {
            // Si l'utilisateur existe déjà, récupérer son ID
            console.log('ℹ️ L\'utilisateur existe déjà, récupération de l\'ID...');

            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers.users.find(u => u.email === ADMIN_CONFIG.email);

            if (!existingUser) {
                throw new Error('Utilisateur non trouvé');
            }

            console.log('✅ Utilisateur existant trouvé:', existingUser.id);
        } else {
            console.log('✅ Utilisateur créé avec succès:', userId);
        }

        // 2. Créer/mettre à jour le profil dans public.profiles
        console.log('2️⃣ Mise à jour du profil dans public.profiles...');

        const finalUserId = userId || authData.user?.id || (await supabase.auth.admin.listUsers()).users.find(u => u.email === ADMIN_CONFIG.email)?.id;

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: finalUserId,
                email: ADMIN_CONFIG.email,
                first_name: ADMIN_CONFIG.first_name,
                last_name: ADMIN_CONFIG.last_name,
                role: 'admin',
                is_active: true,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (profileError) {
            // Si la table n'existe pas encore, essayer de créer la table
            if (profileError.message.includes('does not exist')) {
                console.log('⚠️ Table profiles n\'existe pas, exécution de la migration...');
                await executeMigration();

                // Réessayer l'upsert
                const { data: retryData, error: retryError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: finalUserId,
                        email: ADMIN_CONFIG.email,
                        first_name: ADMIN_CONFIG.first_name,
                        last_name: ADMIN_CONFIG.last_name,
                        role: 'admin',
                        is_active: true,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (retryError) throw retryError;

                console.log('✅ Profil créé avec succès après migration:', retryData);
            } else {
                throw profileError;
            }
        } else {
            console.log('✅ Profil mis à jour avec succès:', profileData);
        }

        // 3. Vérifier que l'admin est bien créé
        console.log('3️⃣ Vérification du compte admin...');

        const { data: adminCheck } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'admin')
            .eq('email', ADMIN_CONFIG.email)
            .single();

        if (adminCheck) {
            console.log('✅ Admin vérifié avec succès!');
            console.log('');
            console.log('📋 Détails du compte admin:');
            console.log('   ID:', adminCheck.id);
            console.log('   Email:', adminCheck.email);
            console.log('   Nom:', adminCheck.first_name, adminCheck.last_name);
            console.log('   Rôle:', adminCheck.role);
            console.log('   Actif:', adminCheck.is_active);
            console.log('   Créé le:', adminCheck.created_at);
            console.log('');
            console.log('🔑 Mot de passe:', ADMIN_CONFIG.password);
            console.log('⚠️ Changez ce mot de passe immédiatement après la première connexion!');
            console.log('');
            console.log('🎉 Compte administrateur créé avec succès!');
            console.log('📧 Email: admin@cv-ai.com');
            console.log('🔑 Mot de passe: ' + ADMIN_CONFIG.password);
        } else {
            throw new Error('Impossible de vérifier la création du compte admin');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error.message);

        if (error.message.includes('duplicate')) {
            console.log('');
            console.log('💡 L\'utilisateur admin existe déjà.');
            console.log('   Essayez de vous connecter avec les identifiants existants');
            console.log('   ou exécutez: UPDATE public.profiles SET role = \'admin\' WHERE email = \'admin@cv-ai.com\';');
        }

        process.exit(1);
    }
}

async function executeMigration() {
    console.log('🔧 Exécution de la migration admin...');

    try {
        // Instructions manuelles pour la migration
        console.log('ℹ️ Migration manuelle requise:');
        console.log('   1. Allez dans le dashboard Supabase > SQL Editor');
        console.log('   2. Copiez le contenu de supabase/migrations/20251009_admin_system.sql');
        console.log('   3. Exécutez le script');
        console.log('   4. Relancez ce script avec npm run create-admin');

        throw new Error('Migration manuelle requise - Veuillez suivre les instructions ci-dessus');
    } catch (error) {
        console.log('ℹ️ Impossible d\'exécuter la migration automatiquement');
        console.log('📝 Veuillez exécuter manuellement: supabase/migrations/20251009_admin_system.sql');
        throw error;
    }
}

// Fonction pour tester la connexion admin
async function testAdminAccess() {
    try {
        console.log('🧪 Test de l\'accès admin...');

        // Se connecter avec le compte admin
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: ADMIN_CONFIG.email,
            password: ADMIN_CONFIG.password
        });

        if (signInError) {
            throw signInError;
        }

        console.log('✅ Connexion admin réussie');

        // Tester la fonction is_admin
        const { data: adminTest, error: adminTestError } = await supabase
            .rpc('is_admin');

        if (adminTestError) {
            console.log('⚠️ Fonction is_admin() non disponible, mais le compte est configuré');
        } else {
            console.log('✅ Test fonction is_admin():', adminTest);
        }

        // Tester l'accès à tous les profils
        const { data: profilesTest, error: profilesError } = await supabase
            .from('profiles')
            .select('email, role, is_active')
            .limit(5);

        if (profilesError) {
            console.log('⚠️ Erreur accès profiles:', profilesError.message);
        } else {
            console.log('✅ Accès à tous les profils réussi, nombre de profils:', profilesTest.length);
        }

    } catch (error) {
        console.log('⚠️ Erreur lors du test admin:', error.message);
    }
}

// Main execution
async function main() {
    console.log('================================================');
    console.log('🚀 CRÉATION COMPTE ADMINISTRATEUR CV-AI');
    console.log('================================================');
    console.log('');

    await createAdminUser();

    console.log('');
    await testAdminAccess();

    console.log('');
    console.log('================================================');
    console.log('✅ TERMINE - Compte admin prêt à l\'emploi!');
    console.log('================================================');
    console.log('');
    console.log('📝 Prochaines étapes:');
    console.log('   1. Changez le mot de passe admin');
    console.log('   2. Implémentez le dashboard admin React');
    console.log('   3. Utilisez la fonction is_admin() dans vos composants');
    console.log('');
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { createAdminUser, testAdminAccess };