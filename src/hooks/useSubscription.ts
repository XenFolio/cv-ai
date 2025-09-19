import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export interface Subscription {
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

export interface UsageLimits {
  cvTemplates: number;
  aiOptimizations: number;
  pdfExports: number;
  prioritySupport: boolean;
  advancedFeatures: boolean;
}

export function useSubscription() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

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

      if (subError && subError.code !== 'PGRST116') {
        // PGRST116 means no rows returned
        throw subError;
      }

      return subData as Subscription | null;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      return profileData;
    },
    enabled: !!user,
  });

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isCanceled = subscription?.cancel_at_period_end;
  const isFree = !subscription || subscription.status === 'free';

  const getUsageLimits = (): UsageLimits => {
    if (isActive) {
      return {
        cvTemplates: Infinity,
        aiOptimizations: Infinity,
        pdfExports: Infinity,
        prioritySupport: true,
        advancedFeatures: true,
      };
    }

    return {
      cvTemplates: 3,
      aiOptimizations: 1,
      pdfExports: 5,
      prioritySupport: false,
      advancedFeatures: false,
    };
  };

  const canUseFeature = (feature: keyof UsageLimits): boolean => {
    const limits = getUsageLimits();
    return limits[feature] === true || limits[feature] === Infinity;
  };

  const hasReachedLimit = async (feature: keyof UsageLimits): Promise<boolean> => {
    const limits = getUsageLimits();

    if (limits[feature] === true || limits[feature] === Infinity) {
      return false;
    }

    // Get current usage for the month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) throw error;

    let count = 0;
    switch (feature) {
      case 'cvTemplates':
        count = activities?.filter(a => a.action === 'template_created').length || 0;
        break;
      case 'aiOptimizations':
        count = activities?.filter(a => a.action === 'ai_optimization').length || 0;
        break;
      case 'pdfExports':
        count = activities?.filter(a => a.action === 'pdf_export').length || 0;
        break;
    }

    return count >= limits[feature];
  };

  const getRemainingUsage = async (feature: keyof UsageLimits): Promise<number> => {
    const limits = getUsageLimits();

    if (limits[feature] === true || limits[feature] === Infinity) {
      return Infinity;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) throw error;

    let count = 0;
    switch (feature) {
      case 'cvTemplates':
        count = activities?.filter(a => a.action === 'template_created').length || 0;
        break;
      case 'aiOptimizations':
        count = activities?.filter(a => a.action === 'ai_optimization').length || 0;
        break;
      case 'pdfExports':
        count = activities?.filter(a => a.action === 'pdf_export').length || 0;
        break;
    }

    return Math.max(0, limits[feature] - count);
  };

  const refreshSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  return {
    subscription,
    profile,
    isActive,
    isCanceled,
    isFree,
    subscriptionLoading,
    usageLimits: getUsageLimits(),
    canUseFeature,
    hasReachedLimit,
    getRemainingUsage,
    refreshSubscription,
  };
}