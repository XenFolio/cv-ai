import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface AlignmentButtonsProps {
  onAlignCommand: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
}

interface AlignmentButton {
  alignment: 'left' | 'center' | 'right' | 'justify';
  icon: React.ReactNode;
  title: string;
}

const ALIGNMENTS: AlignmentButton[] = [
  {
    alignment: 'left',
    icon: <AlignLeft className="w-4 h-4" />,
    title: 'Aligner à gauche',
  },
  {
    alignment: 'center',
    icon: <AlignCenter className="w-4 h-4" />,
    title: 'Centrer',
  },
  {
    alignment: 'right',
    icon: <AlignRight className="w-4 h-4" />,
    title: 'Aligner à droite',
  },
  {
    alignment: 'justify',
    icon: <AlignJustify className="w-4 h-4" />,
    title: 'Justifier',
  },
];

export const AlignmentButtons: React.FC<AlignmentButtonsProps> = ({
  onAlignCommand,
}) => {
  return (
    <div className="flex items-center border-l border-gray-300 pl-2">
      {ALIGNMENTS.map(({ alignment, icon, title }) => (
        <button
          key={alignment}
          onClick={() => onAlignCommand(alignment)}
          className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
          title={title}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};