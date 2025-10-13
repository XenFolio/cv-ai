import React from 'react';
import { getSectionDisplayName } from '../utils/sections';

interface SectionHeaderProps {
  selectedSection: string | null;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  selectedSection
}) => {
  return (
    <div className="bg-gray-50 rounded-b-lg px-3 border border-gray-200 border-t-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
        <h4 className="text-sm font-semibold text-gray-700">
          {getSectionDisplayName(selectedSection)}
        </h4>
      </div>
    </div>
  );
};
