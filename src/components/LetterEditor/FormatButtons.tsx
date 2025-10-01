import React from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface FormatButtonsProps {
  onFormatCommand: (command: string) => void;
}

interface FormatButton {
  command: string;
  icon: React.ReactNode;
  title: string;
}

const FORMAT_COMMANDS: FormatButton[] = [
  {
    command: 'bold',
    icon: <Bold className="w-4 h-4" />,
    title: 'Gras (Ctrl+B)',
  },
  {
    command: 'italic',
    icon: <Italic className="w-4 h-4" />,
    title: 'Italique (Ctrl+I)',
  },
  {
    command: 'underline',
    icon: <Underline className="w-4 h-4" />,
    title: 'Souligné (Ctrl+U)',
  },
];

export const FormatButtons: React.FC<FormatButtonsProps> = ({
  onFormatCommand,
}) => {
  return (
    <div className="flex items-center">
      {FORMAT_COMMANDS.map(({ command, icon, title }) => (
        <button
          key={command}
          onClick={() => onFormatCommand(command)}
          className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
          title={title}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};