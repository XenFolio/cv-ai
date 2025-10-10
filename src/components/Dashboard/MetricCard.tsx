import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useAdminTheme } from '../../contexts/useAdminTheme';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  gradient: string;
  isAdmin: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  isAdmin
}) => {
  const { themeClasses } = useAdminTheme();

  // Classes pour les utilisateurs non-admin (garder l'apparence originale)
  const userClasses = {
    card: 'bg-white/70',
    border: 'border-gray-200/30',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600'
  };

  // Classes selon le mode
  const classes = isAdmin ? themeClasses : userClasses;

  return (
    <div className={`${classes.card} backdrop-blur-sm rounded-xl p-4 ${classes.border} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group`}>
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
        <h3 className={`text-xl font-bold ${classes.text} mb-0.5`}>{value}</h3>
        <p className={`${classes.textSecondary} text-xs`}>{title}</p>
      </div>
    </div>
  );
};