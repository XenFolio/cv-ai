import React from 'react';

// Composant d'icône professionnel avec options de personnalisation
interface ProfessionalIconProps {
  icon: React.ComponentType<{ className?: string; size?: string | number; color?: string }>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  variant?: 'solid' | 'outline' | 'gradient';
  className?: string;
  animated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10'
};

const gradientClasses = {
  primary: 'bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent',
  secondary: 'bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent',
  success: 'bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent',
  warning: 'bg-gradient-to-br from-yellow-500 to-orange-500 bg-clip-text text-transparent',
  error: 'bg-gradient-to-br from-red-500 to-rose-500 bg-clip-text text-transparent'
};

export const ProfessionalIcon: React.FC<ProfessionalIconProps> = ({
  icon: Icon,
  size = 'md',
  color,
  variant = 'solid',
  className = '',
  animated = false,
  clickable = false,
  onClick
}) => {
  const sizeClass = sizeClasses[size];
  let baseClasses = `${sizeClass} inline-flex items-center justify-center`;

  if (variant === 'gradient' && !color) {
    baseClasses += ` ${gradientClasses.primary}`;
  }

  if (animated) {
    baseClasses += ' transition-all duration-200 hover:scale-110';
  }

  if (clickable) {
    baseClasses += ' cursor-pointer hover:opacity-80 active:scale-95';
  }

  if (onClick) {
    baseClasses += ' cursor-pointer';
  }

  const finalClasses = `${baseClasses} ${className}`.trim();

  const iconProps: {
    className: string;
    size: undefined;
    style?: { color: string };
  } = {
    className: finalClasses,
    size: undefined // Using CSS classes instead
  };

  if (color && variant !== 'gradient') {
    iconProps.style = { color };
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="p-0 bg-transparent border-0 inline-flex items-center justify-center"
        aria-label={Icon.name || 'Icon'}
      >
        <Icon {...iconProps} />
      </button>
    );
  }

  return <Icon {...iconProps} />;
};

export default ProfessionalIcon;
