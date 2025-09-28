import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  gradient: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value,
  change, 
  icon: Icon, 
  gradient 
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-200 flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            change.startsWith('+')
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {change}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-0.5">{value}</h3>
        <p className="text-gray-600 text-xs">{title}</p>
      </div>
    </div>
  );
};