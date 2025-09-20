# Guide de Migration - Champs d'Abonnement

## Vue d'ensemble

Cette migration ajoute les champs d'abonnement nécessaires à la table `profiles` pour gérer les différents types d'abonnements utilisateur (Free, Pro mensuel, Pro annuel).

## Fichier de migration

📁 `supabase/migrations/20250919180000_add_subscription_fields_to_profiles.sql`

## Modifications apportées

### 1. Nouvelles colonnes ajoutées

| Colonne | Type | Défaut | Description |
|---------|------|---------|-------------|
| `subscription_type` | enum | `'free'` | Type d'abonnement (free, pro_monthly, pro_yearly) |
| `subscription_status` | enum | `'free'` | Statut d'abonnement (free, active, inactive, canceled) |
| `stripe_customer_id` | text | `NULL` | ID client Stripe pour les paiements |

### 2. Types enum créés

```sql
-- Types d'abonnement possibles
CREATE TYPE subscription_type_enum AS ENUM ('free', 'pro_monthly', 'pro_yearly');

-- Statuts d'abonnement possibles  
CREATE TYPE subscription_status_enum AS ENUM ('free', 'active', 'inactive', 'canceled');
```

### 3. Index de performance

- `profiles_subscription_type_idx` : Index sur le type d'abonnement
- `profiles_subscription_status_idx` : Index sur le statut
- `profiles_stripe_customer_idx` : Index sur l'ID Stripe (partiel)
- `profiles_subscription_composite_idx` : Index composé pour les requêtes communes

### 4. Fonctions helper SQL

#### `get_user_subscription_info(user_uuid)`
Retourne toutes les informations d'abonnement d'un utilisateur.

#### `has_active_subscription(user_uuid)` 
Vérifie si un utilisateur a un abonnement actif.

#### `is_free_user(user_uuid)`
Vérifie si un utilisateur est sur le plan gratuit.

## Application de la migration

### Option 1: Via Supabase CLI (Recommandé)

```bash
# Si vous utilisez Supabase localement
supabase db push

# Ou pour appliquer une migration spécifique
supabase migration up
```

### Option 2: Via Dashboard Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **Database** → **SQL Editor**  
3. Copiez le contenu du fichier `20250919180000_add_subscription_fields_to_profiles.sql`
4. Exécutez le script

### Option 3: Manuellement via psql

```bash
# Si vous avez accès direct à PostgreSQL
psql -h your-db-host -U your-username -d your-database -f supabase/migrations/20250919180000_add_subscription_fields_to_profiles.sql
```

## Vérification de la migration

Après application, vérifiez que :

1. **Les colonnes existent** :
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_type', 'subscription_status', 'stripe_customer_id');
```

2. **Les profils existants ont les valeurs par défaut** :
```sql
SELECT COUNT(*) as free_users
FROM profiles 
WHERE subscription_type = 'free' AND subscription_status = 'free';
```

3. **Les fonctions helper fonctionnent** :
```sql
-- Test avec un UUID d'utilisateur existant
SELECT * FROM get_user_subscription_info('your-user-uuid');
SELECT has_active_subscription('your-user-uuid');
SELECT is_free_user('your-user-uuid');
```

## Impact sur l'application

### Côté TypeScript

L'interface `UserProfile` a été mise à jour :

```typescript
export interface UserProfile {
  // ... autres champs
  subscription_type?: 'free' | 'pro_monthly' | 'pro_yearly';
  subscription_status?: 'free' | 'active' | 'inactive' | 'canceled';
  stripe_customer_id?: string;
}
```

### Côté Hook useProfile

Nouvelles fonctions disponibles :

```typescript
const { 
  getSubscriptionType,      // Retourne le type d'abonnement
  getSubscriptionStatus,    // Retourne le statut
  hasActiveSubscription,    // Boolean: abonnement actif ?
  isFreeUser,              // Boolean: utilisateur gratuit ?
  isProUser,               // Boolean: utilisateur Pro ?
  getSubscriptionDisplayName // Nom affiché du plan
} = useProfile();
```

## Rollback (si nécessaire)

En cas de problème, vous pouvez annuler la migration :

```sql
-- Supprimer les colonnes (ATTENTION: perte de données)
ALTER TABLE profiles 
DROP COLUMN IF EXISTS subscription_type,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS stripe_customer_id;

-- Supprimer les types enum
DROP TYPE IF EXISTS subscription_type_enum;
DROP TYPE IF EXISTS subscription_status_enum;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS get_user_subscription_info(uuid);
DROP FUNCTION IF EXISTS has_active_subscription(uuid);
DROP FUNCTION IF EXISTS is_free_user(uuid);
```

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de la migration
2. Assurez-vous d'avoir les permissions suffisantes
3. Vérifiez que la table `profiles` existe
4. Contactez l'équipe de développement avec les détails de l'erreur

## Notes importantes

⚠️ **Sauvegarde recommandée** : Effectuez une sauvegarde de votre base de données avant d'appliquer la migration.

✅ **Migration sûre** : Cette migration utilise `ADD COLUMN IF NOT EXISTS` pour éviter les conflits.

🔄 **Rétrocompatibilité** : Les profils existants seront automatiquement mis à jour avec les valeurs par défaut.
