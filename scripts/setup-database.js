#!/usr/bin/env node

// =====================================================
// SCRIPT DE CONFIGURATION AUTOMATIQUE DE LA BASE DE DONNÉES
// =====================================================
// Usage: node scripts/setup-database.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erreur: Variables d\'environnement manquantes');
    console.error('Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env');
    process.exit(1);
}

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    try {
        console.log('🚀 Configuration de la base de données...');
        console.log('');

        // 1. Lire le script SQL
        console.log('1️⃣ Lecture du script SQL...');
        const sqlScript = readFileSync('./scripts/create-admin-tables.sql', 'utf8');
        console.log('✅ Script SQL lu avec succès');

        // 2. Exécuter le script via l'API REST (limitation)
        console.log('2️⃣ Test de connexion à la base...');

        // Test simple pour vérifier si nous pouvons nous connecter
        const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (testError) {
            if (testError.message.includes('does not exist')) {
                console.log('⚠️ La table profiles n\'existe pas encore');
                console.log('📝 Instructions manuelles requises:');
                console.log('');
                console.log('ÉTAPES À SUIVRE:');
                console.log('1. Allez sur https://supabase.com/dashboard');
                console.log('2. Connectez-vous à votre projet');
                console.log('3. Allez dans "SQL Editor"');
                console.log('4. Copiez-collez le contenu du fichier:');
                console.log('   scripts/create-admin-tables.sql');
                console.log('5. Exécutez le script');
                console.log('6. Revenez et exécutez: npm run create-admin');
                console.log('');
                return;
            } else {
                throw testError;
            }
        }

        console.log('✅ Connexion à la base réussie');

        // 3. Vérifier si les colonnes admin existent
        console.log('3️⃣ Vérification des colonnes admin...');

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, is_active, first_name, last_name')
            .limit(1);

        if (profileError && profileError.message.includes('column')) {
            console.log('⚠️ Colonnes admin manquantes, exécution manuelle requise');
            console.log('');
            console.log('SQL à exécuter manuellement:');
            console.log('ALTER TABLE public.profiles');
            console.log('ADD COLUMN IF NOT EXISTS role text DEFAULT \'user\';');
            console.log('ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;');
            console.log('ADD COLUMN IF NOT EXISTS first_name text;');
            console.log('ADD COLUMN IF NOT EXISTS last_name text;');
            console.log('');
        } else {
            console.log('✅ Colonnes admin présentes');
        }

        // 4. Créer utilisateur admin de test
        console.log('4️⃣ Création de l\'utilisateur admin...');

        // D'abord essayer de créer un utilisateur simple pour tester
        const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .upsert({
                id: '00000000-0000-0000-0000-000000000000', // UUID temporaire
                email: 'admin@cv-ai.com',
                first_name: 'Administrateur',
                last_name: 'CV-AI',
                role: 'admin',
                is_active: true,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.log('⚠️ Erreur lors de la création de l\'admin:', insertError.message);
            console.log('📝 L\'utilisateur admin doit être créé manuellement');
        } else {
            console.log('✅ Profil admin créé');
        }

        console.log('');
        console.log('🎉 Configuration terminée!');
        console.log('');
        console.log('📋 ÉTATS SUIVANTS:');
        console.log('✅ Base de données accessible');
        console.log('✅ Script SQL prêt');
        console.log('⚠️  Exécution manuelle probablement requise');
        console.log('');

    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error.message);

        if (error.message.includes('Invalid API key')) {
            console.log('');
            console.log('💡 Solution possible:');
            console.log('1. Vérifiez vos clés Supabase dans .env');
            console.log('2. Assurez-vous que le projet Supabase est actif');
            console.log('3. Vérifiez que les clés ont les permissions nécessaires');
        }

        process.exit(1);
    }
}

// Exécuter le script
async function main() {
    console.log('================================================');
    console.log('🔧 CONFIGURATION BASE DE DONNÉES CV-AI');
    console.log('================================================');
    console.log('');

    await setupDatabase();

    console.log('');
    console.log('================================================');
    console.log('✅ TERMINE');
    console.log('================================================');
    console.log('');
    console.log('📝 SI DES ERREURS PERSISTENT:');
    console.log('1. Allez dans le dashboard Supabase');
    console.log('2. Exécutez manuellement: scripts/create-admin-tables.sql');
    console.log('3. Puis exécutez: npm run create-admin');
    console.log('');
}

main().catch(console.error);