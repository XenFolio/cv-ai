// Stripe configuration and utility functions

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
