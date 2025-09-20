// Stripe configuration and utility functions
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise: Promise<Stripe | null> = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url?: string;
}

export interface SubscriptionPlan {
  id: string;
  stripe_price_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  is_popular?: boolean;
}

// Function to create a Stripe checkout session
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create checkout session: ${error}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Unable to create checkout session. Please try again.');
  }
}

// Function to get subscription plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetch('/api/stripe/subscription-plans', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch plans from API, using defaults');
      // Return default plans if API fails
      return getDefaultPlans();
    }

    const data = await response.json();
    return Array.isArray(data) ? data : getDefaultPlans();
  } catch (error) {
    console.warn('Error fetching subscription plans, using defaults:', error);
    return getDefaultPlans();
  }
}

// Default subscription plans
function getDefaultPlans(): SubscriptionPlan[] {
  return [
    {
      id: '1',
      stripe_price_id: 'price_free',
      name: 'Free',
      description: 'Parfait pour découvrir notre plateforme',
      price: 0,
      currency: 'EUR',
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
      currency: 'EUR',
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
      currency: 'EUR',
      interval: 'year',
      features: [
        'Tout dans Pro',
        'Économisez 17% annuellement',
        'Accès anticipé aux nouvelles fonctionnalités',
        'Session de coaching 1-1'
      ]
    }
  ];
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export interface PortalSession {
  url: string;
}

// Function to create a Stripe customer portal session
export async function createPortalSession(params: CreatePortalSessionParams): Promise<PortalSession> {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
}

// Function to cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const response = await fetch('/api/stripe/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }
}

// Function to reactivate a subscription
export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  const response = await fetch('/api/stripe/reactivate-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to reactivate subscription');
  }
}

// Function to format price (in cents) to display format
export function formatPrice(amountInCents: number, currency: string = 'EUR'): string {
  const amount = amountInCents / 100;
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Function to get interval text in French
export function getIntervalText(interval: string): string {
  switch (interval) {
    case 'day':
      return '/jour';
    case 'week':
      return '/semaine';
    case 'month':
      return '/mois';
    case 'year':
      return '/an';
    default:
      return `/${interval}`;
  }
}
