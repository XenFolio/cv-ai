# 🚀 Guide de Configuration Supabase

## Étape 1 : Créer un compte et un projet Supabase

### 1.1 Créer un compte
1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Choisissez une méthode de connexion :
   - **Continue with GitHub** (recommandé)
   - **Continue with SSO**
   - Ou créez un compte avec email/mot de passe

### 1.2 Créer un nouveau projet
1. Une fois connecté, cliquez sur "New project"
2. Sélectionnez votre organisation (ou créez-en une)
3. Configurez votre projet :
   - **Name** : `cv-ats-ai`
   - **Database Password** : Générez un mot de passe fort (NOTEZ-LE !)
   - **Region** : Choisissez "West EU (Ireland)" ou la région la plus proche
   - **Pricing Plan** : Sélectionnez "Free" (gratuit)
4. Cliquez sur "Create new project"

⏱️ **Attendez 1-2 minutes** que le projet soit créé.

## Étape 2 : Récupérer les clés de connexion

### 2.1 Accéder aux paramètres API
1. Dans votre projet, allez dans **Settings** (⚙️) dans la barre latérale
2. Cliquez sur **API** dans le menu des paramètres

### 2.2 Copier les clés importantes
Vous verrez plusieurs informations. Copiez ces deux valeurs :

1. **Project URL** (URL du projet)
   - Format : `https://xxxxxxxxxx.supabase.co`
   - Exemple : `https://abcdefghij.supabase.co`

2. **anon public** (Clé publique anonyme)
   - Longue chaîne de caractères commençant par `eyJ...`
   - Exemple : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9...`

## Étape 3 : Configurer votre application

### 3.1 Mettre à jour le fichier .env
Une fois que vous avez vos clés, remplacez le contenu du fichier `.env` par :

```env
# Configuration Supabase - Projet en ligne
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_ANON_KEY_ICI
```

### 3.2 Appliquer les migrations
Après avoir configuré les clés, exécutez cette commande pour appliquer vos migrations :

```bash
npx supabase db push
```

## Étape 4 : Tester la connexion

### 4.1 Démarrer votre application
```bash
npm run dev
```

### 4.2 Vérifier la connexion
- Ouvrez votre application dans le navigateur
- Vérifiez que les erreurs de connexion Supabase ont disparu
- Testez les fonctionnalités qui utilisent la base de données

## 🔧 Dépannage

### Problème : "Invalid API key"
- Vérifiez que vous avez copié la bonne clé `anon public`
- Assurez-vous qu'il n'y a pas d'espaces avant/après la clé

### Problème : "Project not found"
- Vérifiez que l'URL du projet est correcte
- Assurez-vous que le projet est bien créé et actif

### Problème : "Database connection failed"
- Attendez quelques minutes après la création du projet
- Vérifiez que le projet est complètement initialisé dans le dashboard Supabase

## 📋 Checklist finale

- [ ] Compte Supabase créé
- [ ] Projet `cv-ats-ai` créé
- [ ] URL du projet copiée
- [ ] Clé `anon public` copiée
- [ ] Fichier `.env` mis à jour
- [ ] Migrations appliquées avec `npx supabase db push`
- [ ] Application testée et fonctionnelle

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les étapes ont été suivies
2. Consultez la [documentation officielle Supabase](https://supabase.com/docs)
3. Redémarrez votre serveur de développement après avoir modifié le `.env`

---

**Une fois que vous avez vos clés, copiez-les et je vous aiderai à finaliser la configuration !**