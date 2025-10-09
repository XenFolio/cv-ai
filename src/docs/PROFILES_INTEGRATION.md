# Intégration des Profils avec Supabase
**Version 4.3 - Mise à jour Octobre 2025**

## Vue d'ensemble

Cette documentation décrit l'intégration complète des profils utilisateur avec Supabase dans l'application CV-ATS-AI. L'intégration comprend :

- Table `profiles` dans Supabase avec RLS (Row Level Security)
- Hooks personnalisés pour la gestion des profils
- Composants réutilisables avec validation
- Authentification intégrée avec Supabase Auth

## Architecture

### Base de données

La table `profiles` est créée avec la migration `20250908122600_create_profiles.sql` et comprend :

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  postal_code text,
  city text,
  country text DEFAULT 'France',
  date_of_birth date,
  nationality text DEFAULT 'Française',
  linkedin text,
  website text,
  profession text,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Sécurité

- **RLS activé** : Seuls les utilisateurs authentifiés peuvent accéder à leurs propres données
- **Politiques** : Lecture, écriture et mise à jour limitées à l'utilisateur propriétaire
- **Trigger automatique** : Création automatique du profil lors de l'inscription

### Hooks

#### `useSupabase`
Hook principal pour les interactions avec Supabase :
- `loadProfile(userId?)` : Charge le profil utilisateur
- `saveProfile(profileData)` : Sauvegarde/met à jour le profil
- `createProfile(profileData)` : Crée un nouveau profil
- `deleteProfile()` : Supprime le profil

#### `useProfile`
Hook spécialisé pour la gestion des profils avec validation :
- Validation automatique des données
- Fonctions utilitaires (initiales, nom complet, etc.)
- Gestion des erreurs et du statut de sauvegarde
- Calcul du pourcentage de completion

### Composants

#### `ProfileForm`
Composant de formulaire réutilisable avec :
- Validation en temps réel
- Indicateur de progression
- Gestion des erreurs
- Interface utilisateur moderne

#### `SupabaseAuthProvider`
Provider d'authentification intégré avec :
- Gestion des sessions Supabase
- Synchronisation automatique des profils
- Fallback en mode mock si Supabase n'est pas configuré

#### `ProfileTest`
Composant de test pour vérifier l'intégration :
- Tests automatisés de toutes les fonctionnalités
- Vérification de la configuration
- Affichage des résultats détaillés

## Utilisation

### Configuration

1. **Variables d'environnement** :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Migration de la base de données** :
```bash
supabase db push
```

### Intégration dans l'application

```tsx
import { SupabaseAuthProvider } from './components/Auth/SupabaseAuthProvider';
import { useProfile } from './hooks/useProfile';
import { ProfileForm } from './components/Profile/ProfileForm';

// Wrapper de l'application
function App() {
  return (
    <SupabaseAuthProvider>
      <YourAppContent />
    </SupabaseAuthProvider>
  );
}

// Utilisation du hook
function ProfilePage() {
  const {
    profile,
    saveProfile,
    getFullName,
    isProfileComplete,
    validationErrors
  } = useProfile();

  return (
    <div>
      <h1>Profil de {getFullName()}</h1>
      <ProfileForm onSave={(profile) => console.log('Saved:', profile)} />
    </div>
  );
}
```

### Validation des données

Le système de validation inclut :

- **Champs obligatoires** : prénom, nom, email
- **Formats** : email, téléphone, code postal, URLs
- **Cohérence** : date de naissance, âge réaliste
- **Sécurité** : URLs avec protocole HTTPS

```tsx
const { validateProfile } = useProfile();

const validation = validateProfile({
  first_name: 'Jean',
  last_name: 'Dupont',
  email: 'jean.dupont@email.com'
});

if (!validation.isValid) {
  console.log('Erreurs:', validation.errors);
}
```

## Fonctionnalités

### Gestion automatique des profils

- **Création automatique** : Profil créé lors de l'inscription
- **Synchronisation** : Mise à jour automatique lors des changements d'auth
- **Fallback** : Mode dégradé si Supabase n'est pas disponible

### Utilitaires

```tsx
const {
  getInitials,           // "JD" pour Jean Dupont
  getFullName,          // "Jean Dupont"
  isProfileComplete,    // true/false
  getCompletionPercentage, // 0-100%
  getFormattedAddress   // "123 Rue, 75001 Paris, France"
} = useProfile();
```

### Gestion des erreurs

- **Validation côté client** : Feedback immédiat
- **Gestion des erreurs réseau** : Retry automatique
- **Messages d'erreur localisés** : En français
- **Fallback gracieux** : Mode hors ligne

## Tests

### Tests automatisés

Le composant `ProfileTest` vérifie :
- Configuration Supabase
- Chargement des profils
- Fonctions utilitaires
- Validation des données
- Gestion des erreurs

### Tests manuels

1. **Inscription** : Vérifier la création automatique du profil
2. **Connexion** : Vérifier le chargement du profil
3. **Modification** : Tester la sauvegarde et validation
4. **Déconnexion** : Vérifier la suppression des données locales

## Sécurité

### Bonnes pratiques implémentées

- **RLS** : Isolation des données par utilisateur
- **Validation** : Côté client et serveur
- **Sanitisation** : Nettoyage des données avant insertion
- **HTTPS** : URLs sécurisées uniquement
- **Tokens** : Gestion automatique par Supabase Auth

### Considérations

- Les données sensibles ne sont jamais stockées en local
- Les erreurs ne révèlent pas d'informations système
- Les requêtes sont limitées par les politiques RLS
- L'authentification expire automatiquement

## Dépannage

### Problèmes courants

1. **Supabase non configuré** :
   - Vérifier les variables d'environnement
   - Contrôler la connexion réseau

2. **Erreurs de validation** :
   - Consulter `validationErrors` dans le hook
   - Vérifier les formats requis

3. **Profil non chargé** :
   - Vérifier l'authentification
   - Contrôler les politiques RLS

4. **Sauvegarde échouée** :
   - Vérifier les permissions
   - Contrôler la validation des données

### Debug

```tsx
// Activer les logs détaillés
const { error, profileLoading } = useProfile();
console.log('Erreur:', error);
console.log('Chargement:', profileLoading);

// Tester la configuration
const { isConfigured, hasKeys } = useSupabaseConfig();
console.log('Configuré:', isConfigured, 'Clés:', hasKeys);
```

## Migration depuis l'ancien système

Si vous migrez depuis un système existant :

1. **Sauvegarde** : Exporter les données existantes
2. **Migration** : Utiliser les scripts de migration Supabase
3. **Test** : Vérifier avec le composant `ProfileTest`
4. **Déploiement** : Mise à jour progressive

## Performance

### Optimisations implémentées

- **Cache local** : Profil mis en cache après chargement
- **Requêtes optimisées** : Sélection des champs nécessaires uniquement
- **Debouncing** : Validation différée lors de la saisie
- **Lazy loading** : Chargement à la demande

### Métriques

- Temps de chargement initial : < 500ms
- Temps de sauvegarde : < 200ms
- Taille du bundle : +15KB (gzippé)

## Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Utiliser le composant `ProfileTest` pour diagnostiquer
3. Vérifier les logs de la console
4. Contacter l'équipe de développement