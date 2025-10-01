import React from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  onColorChange: (color: string) => void;
  showColorPicker: boolean;
  onToggleColorPicker: () => void;
}

const COLORS = [
  // Niveaux de gris : du plus sombre au plus clair
  '#1A1A1A', '#404040', '#6B6B6B', '#969696', '#C1C1C1', '#DCDCDC', '#ECECEC', '#FFFFFF',
  // Complémentaires : couleurs supplémentaires utiles
  '#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB', '#EAEDED', '#F8F9F9',
  // Rouges : du plus sombre au plus clair
  '#8B0000', '#A52A2A', '#B22222', '#DC143C', '#E74C3C', '#F08080', '#F1948A', '#FFA07A',
  // Orange->Jaune : du orange foncé au jaune clair
  '#ed6a12', '#df6311', '#D2691E', '#FF8C00', '#FFA500', '#FFD700', '#FFEB3B', '#FFFACD',
  // Marrons : du plus sombre au plus clair

  '#654321', '#704214', '#8B4513', '#A0522D', '#BC8F8F', '#DEB887', '#F5DEB3', '#FFE4B5',


  // Verts : du plus sombre au plus clair
  '#013220', '#006400', '#228B22', '#2E8B57', '#27AE60', '#52BE80', '#90EE90', '#98FB98',

  // Bleus : du plus sombre au plus clair
  '#191970', '#000080', '#00008B', '#4169E1', '#3498DB', '#5DADE2', '#87CEEB', '#B0E0E6',


  // Violets : du plus sombre au plus clair
  '#4B0082', '#6A0DAD', '#8B008B', '#9B59B6', '#BA55D3', '#DA70D6', '#DDA0DD', '#EE82EE',


  
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
  showColorPicker,
  onToggleColorPicker,
}) => {
  const [selectedColor, setSelectedColor] = React.useState('#000000');

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  return (
    <div className="relative color-picker">
      {/* Bouton principal */}
      <button
        onClick={onToggleColorPicker}
        className="text-sm flex items-center gap-1 px-2 py-1 text-gray-500 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
        title="Couleur du texte"
      >
        <Palette className="w-4 h-4" />
        <div
          className="w-4 h-4 border border-gray-300 rounded"
          style={{ backgroundColor: selectedColor }}
        />
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {showColorPicker && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1 w-52">

          {/* Couleur personnalisée */}
          <div className="mb-2">
            <div className="flex gap-1">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) handleColorSelect(val);
                }}
                className="h-6 text-xs flex-1 px-1 border border-gray-300 rounded"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Palette de couleurs */}
          <div
            className="grid grid-cols-8 gap-1 p-1"
          >
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                aria-label={`Choisir ${color}`}
                className={`relative aspect-square w-full rounded-sm transition-transform hover:scale-105 border ${selectedColor === color ? "border-blue-500" : "border-gray-200"
                  }`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 m-auto w-3 h-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
