# 🔧 Guide de Résolution des Problèmes

## 🚨 Erreur : "Utilisateur non connecté"

### Symptômes
- Message d'erreur : "Vous devez être connecté pour sauvegarder votre profil"
- Impossible de sauvegarder les paramètres du profil
- L'application fonctionne mais les données ne se sauvegardent pas

### Causes possibles
1. **Pas d'authentification** : L'utilisateur n'est pas connecté via Supabase Auth
2. **Migrations non appliquées** : La table `profiles` n'existe pas dans la base de données
3. **Configuration Supabase incorrecte** : Problème avec les clés API

### Solutions

#### ✅ Solution 1 : Se connecter d'abord
1. Cliquez sur le bouton **"Se connecter"** en haut à droite de l'application
2. Créez un compte ou connectez-vous avec un compte existant
3. Une fois connecté, essayez de sauvegarder à nouveau

#### ✅ Solution 2 : Appliquer les migrations
Si vous voyez l'erreur "La table des profils n'existe pas" :

1. Suivez le guide [`APPLY_MIGRATIONS_GUIDE.md`](APPLY_MIGRATIONS_GUIDE.md)
2. Connectez-vous au [dashboard Supabase](https://supabase.com/dashboard)
3. Appliquez le script SQL de création de la table `profiles`

#### ✅ Solution 3 : Vérifier la configuration
1. Vérifiez que le fichier [`.env`](.env) contient vos vraies clés Supabase
2. Redémarrez l'application après modification du `.env`
3. Vérifiez dans la console du navigateur s'il y a des erreurs de connexion

## 🔍 Diagnostic des Problèmes

### Vérifier l'état de l'authentification
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Recherchez des messages comme :
   - `"Utilisateur connecté: [ID]"` ✅ (Bon)
   - `"Aucun utilisateur connecté"` ❌ (Problème)
   - `"Erreur d'authentification"` ❌ (Problème)

### Vérifier l'état de la base de données
1. Dans la console, recherchez :
   - `"Profil sauvegardé avec succès"` ✅ (Bon)
   - `"La table des profils n'existe pas"` ❌ (Migrations manquantes)
   - `"Erreur Supabase: 42P01"` ❌ (Table manquante)

## 📋 Checklist de Résolution

### Avant de sauvegarder un profil :
- [ ] L'utilisateur est connecté (bouton "Se connecter" → "Se déconnecter")
- [ ] Les migrations sont appliquées (table `profiles` existe)
- [ ] Les clés Supabase sont correctes dans `.env`
- [ ] L'application a été redémarrée après modification du `.env`

### Si le problème persiste :
- [ ] Vérifiez les logs dans la console du navigateur
- [ ] Vérifiez que votre projet Supabase est actif
- [ ] Testez la connexion avec un autre navigateur
- [ ] Videz le cache du navigateur

## 🛠️ Actions de Dépannage

### Réinitialiser l'authentification
```javascript
// Dans la console du navigateur
localStorage.clear();
sessionStorage.clear();
// Puis rechargez la page
```

### Tester la connexion Supabase
1. Allez dans **Paramètres** → **Tests d'Intégration**
2. Utilisez les tests automatiques pour vérifier :
   - Connexion à Supabase
   - Authentification
   - Opérations sur les profils

### Vérifier les permissions
1. Dans le dashboard Supabase, allez dans **Authentication** → **Policies**
2. Vérifiez que les politiques RLS sont activées pour la table `profiles`
3. Les politiques doivent permettre aux utilisateurs authentifiés de :
   - Lire leur propre profil
   - Créer leur propre profil
   - Modifier leur propre profil

## 📞 Support Avancé

### Logs utiles à fournir
Si vous contactez le support, incluez :
1. Messages d'erreur complets de la console
2. Votre ID de projet Supabase (visible dans l'URL du dashboard)
3. Version du navigateur utilisé
4. Étapes exactes pour reproduire le problème

### Ressources supplémentaires
- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide de migration Supabase](https://supabase.com/docs/guides/cli/local-development)

---

**💡 Conseil** : La plupart des problèmes sont résolus en s'assurant que l'utilisateur est connecté ET que les migrations sont appliquées. Commencez toujours par ces deux vérifications !