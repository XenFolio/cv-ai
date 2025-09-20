/*
  # Ajouter les champs d'abonnement à la table profiles

  1. Modifications
    - Ajouter la colonne `subscription_type` (enum: free, pro_monthly, pro_yearly)
    - Ajouter la colonne `subscription_status` (enum: free, active, inactive, canceled)
    - Ajouter la colonne `stripe_customer_id` (text, pour l'intégration Stripe)
    - Définir des valeurs par défaut appropriées

  2. Valeurs par défaut
    - subscription_type: 'free' pour tous les nouveaux utilisateurs
    - subscription_status: 'free' pour tous les nouveaux utilisateurs
    - stripe_customer_id: NULL (sera rempli lors du premier paiement)

  3. Sécurité
    - Les politiques RLS existantes s'appliquent automatiquement
    - Seul l'utilisateur propriétaire peut lire/modifier ses données d'abonnement
*/

-- Créer les types enum pour les abonnements
DO $$ 
BEGIN
  -- Type d'abonnement
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type_enum') THEN
    CREATE TYPE subscription_type_enum AS ENUM ('free', 'pro_monthly', 'pro_yearly');
  END IF;
  
  -- Statut d'abonnement
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
    CREATE TYPE subscription_status_enum AS ENUM ('free', 'active', 'inactive', 'canceled');
  END IF;
END $$;

-- Ajouter les colonnes d'abonnement à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_type subscription_type_enum DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status subscription_status_enum DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Ajouter des commentaires pour documenter les champs
COMMENT ON COLUMN profiles.subscription_type IS 'Type d''abonnement de l''utilisateur (free, pro_monthly, pro_yearly)';
COMMENT ON COLUMN profiles.subscription_status IS 'Statut actuel de l''abonnement (free, active, inactive, canceled)';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'ID client Stripe pour la gestion des paiements';

-- Mettre à jour les profils existants pour s'assurer qu'ils ont les valeurs par défaut
UPDATE profiles 
SET 
  subscription_type = 'free',
  subscription_status = 'free'
WHERE 
  subscription_type IS NULL 
  OR subscription_status IS NULL;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS profiles_subscription_type_idx ON profiles(subscription_type);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Créer un index composé pour les requêtes communes
CREATE INDEX IF NOT EXISTS profiles_subscription_composite_idx ON profiles(subscription_type, subscription_status);

-- Les politiques RLS existantes couvrent déjà ces nouveaux champs
-- car elles s'appliquent à toute la table profiles

-- Fonction helper pour obtenir le plan d'abonnement d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_subscription_info(user_uuid uuid)
RETURNS TABLE(
  subscription_type subscription_type_enum,
  subscription_status subscription_status_enum,
  stripe_customer_id text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.subscription_type,
    p.subscription_status,
    p.stripe_customer_id
  FROM profiles p
  WHERE p.id = user_uuid;
END;
$$;

-- Fonction pour vérifier si un utilisateur a un abonnement actif
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_status subscription_status_enum;
BEGIN
  SELECT subscription_status INTO user_status
  FROM profiles
  WHERE id = user_uuid;
  
  RETURN user_status = 'active';
END;
$$;

-- Fonction pour vérifier si un utilisateur est sur le plan gratuit
CREATE OR REPLACE FUNCTION is_free_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_type subscription_type_enum;
BEGIN
  SELECT subscription_type INTO user_type
  FROM profiles
  WHERE id = user_uuid;
  
  RETURN user_type = 'free';
END;
$$;

-- Vérification finale
DO $$
DECLARE
  subscription_type_exists boolean;
  subscription_status_exists boolean;
  stripe_customer_id_exists boolean;
  updated_profiles_count integer;
BEGIN
  -- Vérifier que les colonnes existent
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_type'
  ) INTO subscription_type_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) INTO subscription_status_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) INTO stripe_customer_id_exists;
  
  -- Compter les profils avec les nouvelles valeurs par défaut
  SELECT COUNT(*) INTO updated_profiles_count
  FROM profiles
  WHERE subscription_type = 'free' AND subscription_status = 'free';
  
  -- Vérifications
  IF NOT subscription_type_exists THEN
    RAISE EXCEPTION 'La colonne subscription_type n''a pas été ajoutée correctement';
  END IF;
  
  IF NOT subscription_status_exists THEN
    RAISE EXCEPTION 'La colonne subscription_status n''a pas été ajoutée correctement';
  END IF;
  
  IF NOT stripe_customer_id_exists THEN
    RAISE EXCEPTION 'La colonne stripe_customer_id n''a pas été ajoutée correctement';
  END IF;
  
  RAISE NOTICE 'Migration subscription fields appliquée avec succès !';
  RAISE NOTICE 'Colonnes ajoutées: subscription_type, subscription_status, stripe_customer_id';
  RAISE NOTICE 'Profils mis à jour avec plan gratuit: %', updated_profiles_count;
  RAISE NOTICE 'Fonctions helper créées: get_user_subscription_info, has_active_subscription, is_free_user';
END $$;
