import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { stripePromise, createCheckoutSession, getSubscriptionPlans, formatPrice, getIntervalText, SubscriptionPlan } from '@/lib/stripe';
import { Check, Star, ArrowRight, CheckCircle } from 'lucide-react';

export function SubscriptionPlans() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
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
        'Support prioritaire',
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

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Afficher un message si les plans ne chargent pas depuis l'API
  if (plansError && !plans) {
    console.log('Utilisation des plans par défaut - erreur API:', plansError);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-400 bg-clip-text text-transparent sm:text-4xl">
          Choisissez votre formule
        </h2>
        <p className="mt-4 text-xl text-gray-600">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {displayPlans?.map((plan: SubscriptionPlan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-8 transition-all duration-300 ${
              isPlanActive(plan)
                ? 'border-green-600 bg-green-50 ring-2 ring-green-600 ring-opacity-30'
                : plan.is_popular
                ? 'border-violet-600 ring-2 ring-violet-600 ring-opacity-50'
                : 'border-gray-200 hover:border-violet-300'
            }`}
          >
            {isPlanActive(plan) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-600 text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Actif
                </span>
              </div>
            )}
            {plan.is_popular && !isPlanActive(plan) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-violet-600 text-white">
                  <Star className="w-4 h-4 mr-1" />
                  Populaire
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-3 text-gray-600">{plan.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
                <span className="text-gray-600 ml-1">
                  {getIntervalText(plan.interval)}
                </span>
              </div>
            </div>

            <ul className="mt-8 space-y-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.stripe_price_id)}
              disabled={isLoading || isPlanActive(plan)}
              className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                isPlanActive(plan)
                  ? 'bg-green-600 text-white cursor-default'
                  : plan.is_popular
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Chargement...
                </span>
              ) : isPlanActive(plan) ? (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Abonnement actif
                </span>
              ) : plan.price === 0 ? (
                'Commencer gratuitement'
              ) : (
                <span className="flex items-center justify-center">
                  S'abonner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </button>
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
