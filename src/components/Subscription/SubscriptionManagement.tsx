import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { createPortalSession, cancelSubscription, reactivateSubscription, formatPrice, getIntervalText } from '@/lib/stripe';
import { Calendar, CreditCard, RefreshCw, X, Check, ExternalLink } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  subscription_plans?: {
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  stripe_invoice_id?: string;
}

export function SubscriptionManagement() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user || !supabase) return null;

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            price,
            currency,
            interval,
            features
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (subError) throw subError;
      return subData as Subscription;
    },
    enabled: !!user && isSupabaseConfigured,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      if (!user || !supabase) return [];

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;
      return paymentsData as Payment[];
    },
    enabled: !!user && isSupabaseConfigured,
  });

  const handleManageBilling = async () => {
    if (!user || !subscription || !supabase) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get customer ID from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.stripe_customer_id) {
        throw new Error('Customer ID not found');
      }

      const session = await createPortalSession({
        customerId: profile.stripe_customer_id,
        returnUrl: `${window.location.origin}/dashboard/billing`,
      });

      window.location.href = session.url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      setError('Une erreur est survenue lors de l\'accès au portail de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setIsLoading(true);
    setError(null);

    try {
      await cancelSubscription(subscription.stripe_subscription_id);
      setSuccess('Votre abonnement sera annulé à la fin de la période de facturation');
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Une erreur est survenue lors de l\'annulation de votre abonnement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    setIsLoading(true);
    setError(null);

    try {
      await reactivateSubscription(subscription.stripe_subscription_id);
      setSuccess('Votre abonnement a été réactivé avec succès');
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError('Une erreur est survenue lors de la réactivation de votre abonnement');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <X className="w-4 h-4 mr-1" />
          Annulé fin de période
        </span>
      );
    }

    switch (status) {
      case 'active':
      case 'trialing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Check className="w-4 h-4 mr-1" />
            Actif
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <X className="w-4 h-4 mr-1" />
            En retard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (subscriptionLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!subscription || subscription.status === 'free') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Vous n'avez pas d'abonnement actif
        </h3>
        <p className="text-gray-600 mb-6">
          Souscrivez à un abonnement pour débloquer toutes les fonctionnalités
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Voir les formules
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Abonnement actuel</h3>
            <p className="text-sm text-gray-600">Gérez votre abonnement et vos facturations</p>
          </div>
          {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              {subscription.subscription_plans?.name}
            </h4>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(subscription.subscription_plans?.price || 0)}
              <span className="text-sm font-normal text-gray-600 ml-1">
                {getIntervalText(subscription.subscription_plans?.interval || 'month')}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Prochain renouvellement :{' '}
              {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="w-4 h-4 mr-2" />
              ID : {subscription.stripe_subscription_id.slice(-8)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleManageBilling}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Gérer le paiement
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>

          {subscription.cancel_at_period_end ? (
            <button
              onClick={handleReactivateSubscription}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réactiver l'abonnement
            </button>
          ) : (
            <button
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler l'abonnement
            </button>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Historique des paiements</h3>

        {payments && payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {formatPrice(payment.amount)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {payment.description || 'Paiement'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(payment.status, false)}
                  {payment.stripe_invoice_id && (
                    <a
                      href={`https://dashboard.stripe.com/invoices/${payment.stripe_invoice_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:text-violet-700 text-sm"
                    >
                      Voir la facture
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Aucun paiement trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}