import React from 'react';
import {
  Search,
  Eye,
  Star,
  Calendar,
  Trash2,
  Download,
  BarChart3,
  FileText
} from "lucide-react";

export const DocumentsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-4 w-80 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-violet-300 to-pink-300 rounded-2xl animate-pulse flex-shrink-0" />
        </div>
      </div>

      {/* Statistiques skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white/70 rounded-2xl p-4 border border-gray-200/30 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="h-8 w-12 bg-gray-300 rounded animate-pulse mx-auto mb-1" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      {/* Search and Filters skeleton */}
      <div className="bg-white/70 rounded-2xl p-6 border border-gray-200/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded animate-pulse" />
            <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="flex flex-wrap justify-center gap-6">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="w-80 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-5">
              {/* Header skeleton */}
              <div className="flex items-start justify-between mb-4">
                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Infos skeleton */}
              <div className="text-sm text-gray-600 mb-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-gray-300 rounded-full animate-pulse" />
                </div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Score skeleton */}
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse" />
              </div>

              {/* Métadonnées skeleton */}
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse mr-1" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Actions skeleton */}
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gradient-to-r from-violet-300 to-pink-300 rounded-lg animate-pulse" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};