import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Lock, Crown, ArrowRight } from 'lucide-react';

interface SubscriptionGuardProps {
  feature: keyof import('@/hooks/useSubscription').UsageLimits;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function SubscriptionGuard({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}: SubscriptionGuardProps) {
  const { canUseFeature } = useSubscription();

  if (!canUseFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Fonctionnalité Premium
                </h3>
                <p className="text-sm text-gray-600">
                  Cette fonctionnalité nécessite un abonnement Pro
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <a
                href="/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Passer à Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Fonctionnalité Premium</p>
          </div>
        </div>
        <div className="opacity-50">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface UsageLimitGuardProps {
  feature: keyof import('@/hooks/useSubscription').UsageLimits;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function UsageLimitGuard({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}: UsageLimitGuardProps) {
  const { usageLimits } = useSubscription();

  // For simplicity, we'll assume unlimited usage for active subscriptions
  // In a real app, you'd check the actual usage against limits
  const canUse = usageLimits[feature] === true || usageLimits[feature] === Infinity;

  if (!canUse) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Limite mensuelle atteinte
                </h3>
                <p className="text-sm text-gray-600">
                  Vous avez atteint votre limite d'utilisation pour ce mois
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <a
                href="/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              >
                Passer à Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Limite atteinte</p>
          </div>
        </div>
        <div className="opacity-50">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
