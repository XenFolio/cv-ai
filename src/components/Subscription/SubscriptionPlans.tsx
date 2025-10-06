import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { stripePromise, createCheckoutSession, getSubscriptionPlans, formatPrice, getIntervalText, SubscriptionPlan } from '@/lib/stripe';
import { Check, Star, ArrowRight, CheckCircle, Crown } from 'lucide-react';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import { SubscriptionPlansSkeleton } from './SubscriptionPlansSkeleton';

export function SubscriptionPlans() {
  const { user } = useAuthStore();
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skeletonLoading, setSkeletonLoading] = useState<boolean>(true);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Simuler le chargement des plans
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonLoading(false);
    }, 2000); // 2 secondes de chargement

    return () => clearTimeout(timer);
  }, []);

  // Get current subscription to show active plan
  const { data: currentSubscription } = useQuery({
    queryKey: ['current-subscription', user?.id],
    queryFn: async () => {
      if (!user || !supabase) return null;

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return subscription;
    },
    enabled: !!user && isSupabaseConfigured,
  });

  const { data: plans, error: plansError } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans,
    retry: 1,
  });

  // Plans par défaut au cas où l'API ne fonctionne pas
  const defaultPlans: SubscriptionPlan[] = [
    {
      id: '1',
      stripe_price_id: 'price_free',
      name: 'Free',
      description: 'Parfait pour découvrir notre plateforme',
      price: 0,
      currency: 'eur',
      interval: 'month',
      features: [
        '3 templates CV',
        'Export PDF basique',
        '1 optimisation IA par mois',
        'Support par email'
      ]
    },
    {
      id: '2',
      stripe_price_id: 'price_pro_monthly',
      name: 'Pro',
      description: 'Pour les chercheurs d\'emploi qui veulent se démarquer',
      price: 1999,
      currency: 'eur',
      interval: 'month',
      features: [
        'Templates CV illimités',
        'Export PDF premium',
        'Optimisations IA illimitées',
        'Templates de lettre de motivation',
        'Préparation aux entretiens'
      ],
      is_popular: true
    },
    {
      id: '3',
      stripe_price_id: 'price_pro_yearly',
      name: 'Pro Annual',
      description: 'Meilleure valeur pour les chercheurs d\'emploi sérieux',
      price: 19900,
      currency: 'eur',
      interval: 'year',
      features: [
        'Tout dans Pro',
        'Économisez 17% annuellement',
        'Accès anticipé aux nouvelles fonctionnalités',
        'Session de coaching 1-1'
      ]
    }
  ];

  const displayPlans: SubscriptionPlan[] = Array.isArray(plans) ? plans : defaultPlans;

  // Check if a plan is currently active
  const isPlanActive = (plan: SubscriptionPlan) => {
    if (!currentSubscription) return plan.price === 0; // Free is default active
    return currentSubscription.stripe_price_id === plan.stripe_price_id &&
           (currentSubscription.status === 'active' || currentSubscription.status === 'free');
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      setError('Vous devez être connecté pour souscrire à un abonnement');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Handle Free plan - no Stripe needed
      if (priceId === 'price_free' || priceId === 'free') {
        await handleFreeSubscription();
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe n\'est pas initialisé');
      }

      // Ensure Supabase is configured before attempting any queries
      if (!isSupabaseConfigured) {
        throw new Error('Supabase n\'est pas configuré');
      }

      // Get current user's profile to check if they have a Stripe customer ID
      const { data: profile } = await supabase!
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      const session = await createCheckoutSession({
        priceId,
        userId: user.id,
        customerId: profile?.stripe_customer_id || undefined,
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing?subscription=canceled`,
      });

      await stripe.redirectToCheckout({
        sessionId: session.id,
      });
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Une erreur est survenue lors de la création de votre session de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeSubscription = async () => {
    if (!user || !supabase) return;

    try {
      // Create or update subscription entry for Free plan
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingSubscription) {
        // Update existing subscription to Free
        await supabase
          .from('subscriptions')
          .update({
            status: 'free',
            stripe_price_id: 'price_free',
            cancel_at_period_end: false,
            current_period_start: new Date().toISOString(),
            current_period_end: null,
          })
          .eq('user_id', user.id);
      } else {
        // Create new Free subscription
        await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            status: 'free',
            stripe_price_id: 'price_free',
            current_period_start: new Date().toISOString(),
          });
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'free',
        })
        .eq('id', user.id);

      setSuccess('Vous êtes maintenant sur le plan Free !');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard?subscription=free';
      }, 1500);

    } catch (err) {
      console.error('Error setting up free subscription:', err);
      setError('Une erreur est survenue lors de l\'activation du plan Free');
    }
  };

  if (skeletonLoading) {
    return <SubscriptionPlansSkeleton />;
  }

  // Afficher un message si les plans ne chargent pas depuis l'API
  if (plansError && !plans) {
    console.log('Utilisation des plans par défaut - erreur API:', plansError);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <BreadcrumbNavigation
            items={[
              {
                label: 'Accueil',
                icon: NavigationIcons.Home,
                onClick: () => setActiveTab('dashboard')
              },
              {
                label: 'Premium',
                onClick: () => setActiveTab('tarifs')
              },
              { label: 'Choisissez votre formule', current: true }
            ]}
            showHome={false}
            className="justify-start"
          />
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl animate-scaleIn flex-shrink-0">
            <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Commencez gratuit, passez à Pro quand vous êtes prêt
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {displayPlans?.map((plan: SubscriptionPlan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl border-2 p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col h-full ${
              isPlanActive(plan)
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-500 ring-opacity-20'
                : plan.is_popular
                  ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg ring-2 ring-violet-500 ring-opacity-20'
                  : 'border-gray-200 bg-white hover:border-violet-300 hover:shadow-lg'
            }`}
          >
            {isPlanActive(plan) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ACTIF
                </span>
              </div>
            )}
            {plan.is_popular && !isPlanActive(plan) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg animate-pulse">
                  <Star className="w-3 h-3 mr-1" />
                  POPULAIRE
                </span>
              </div>
            )}

            <div className="flex-grow">
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  isPlanActive(plan)
                    ? 'text-green-700'
                    : plan.is_popular
                      ? 'text-violet-700'
                      : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{plan.description}</p>
                <div className="relative">
                  <span className={`text-4xl font-bold ${
                    isPlanActive(plan)
                      ? 'text-green-700'
                      : plan.is_popular
                        ? 'text-violet-700'
                        : 'text-gray-900'
                  }`}>
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-600 ml-1 text-sm">
                    {getIntervalText(plan.interval)}
                  </span>
                  {plan.price === 0 && (
                    <span className="absolute -top-2 -right-4 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      gratuit
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      isPlanActive(plan)
                        ? 'bg-green-500'
                        : plan.is_popular
                          ? 'bg-violet-500'
                          : 'bg-gray-300'
                    }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4">
              <button
                onClick={() => handleSubscribe(plan.stripe_price_id)}
                disabled={isLoading || isPlanActive(plan)}
                className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] ${
                  isPlanActive(plan)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg cursor-default'
                    : plan.is_popular
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg'
                } disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Chargement...
                  </span>
                ) : isPlanActive(plan) ? (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ABONNEMENT ACTIF
                  </span>
                ) : plan.price === 0 ? (
                  <span className="flex items-center justify-center">
                    COMMENCER GRATUITEMENT
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    S'ABONNER
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">
          Vous pouvez annuler votre abonnement à tout moment.{' '}
          <a href="/terms" className="text-violet-600 hover:text-violet-700">
            Conditions d'utilisation
          </a>
        </p>
      </div>
    </div>
  );
}
