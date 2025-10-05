import React from 'react';
import { Crown } from 'lucide-react';

export const SubscriptionPlansSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Breadcrumb skeleton */}
          <div className="animate-pulse">
            <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
          {/* Icon skeleton */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-2xl animate-pulse flex-shrink-0" />
        </div>
        {/* Description skeleton */}
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((plan) => (
          <div
            key={plan}
            className="relative rounded-3xl border-2 border-gray-200 p-8 flex flex-col h-full animate-pulse"
          >
            {/* Popular badge skeleton */}
            {plan === 2 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="h-6 w-20 bg-gray-300 rounded-full" />
              </div>
            )}

            <div className="flex-grow">
              {/* Plan name and description */}
              <div className="text-center mb-8">
                <div className="h-6 w-24 bg-gray-300 rounded mx-auto mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded mb-4" />
                <div className="h-10 w-16 bg-gray-300 rounded mx-auto mb-2" />
                <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
              </div>

              {/* Features list */}
              <div className="space-y-4">
                {[1, 2, 3, 4].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <div className="w-5 h-5 bg-gray-300 rounded-full mr-3" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Button skeleton */}
            <div className="mt-auto pt-4">
              <div className="w-full h-12 bg-gray-300 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom text skeleton */}
      <div className="mt-12 text-center">
        <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
      </div>
    </div>
  );
};