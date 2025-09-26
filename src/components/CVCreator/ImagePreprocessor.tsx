import React, { useState, useRef } from 'react';
import { RotateCcw, RotateCw, Crop, Sun, Moon, Download, Upload } from 'lucide-react';
import Button from '../UI/Button';

interface ImagePreprocessorProps {
  imageBlob: Blob;
  onProcess: (processedBlob: Blob) => void;
  onCancel: () => void;
}

export const ImagePreprocessor: React.FC<ImagePreprocessorProps> = ({
  imageBlob,
  onProcess,
  onCancel
}) => {
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const applyFilters = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    ctx?.save();

    // Apply rotation
    ctx?.translate(canvas.width / 2, canvas.height / 2);
    ctx?.rotate((rotation * Math.PI) / 180);
    ctx?.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply filters
    ctx!.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx?.drawImage(image, 0, 0);

    ctx?.restore();

    return canvas;
  };

  const handleProcess = () => {
    const canvas = applyFilters();
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) onProcess(blob);
      }, 'image/jpeg', 0.9);
    }
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setIsCropping(false);
  };

  const imageUrl = URL.createObjectURL(imageBlob);

  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Prétraitement de l'image</h3>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>

      {/* Image Preview */}
      <div className="relative">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="CV preview"
          className="w-full max-h-96 object-contain"
          onLoad={() => applyFilters()}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Rotation */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Rotation</label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRotation(r => r - 90)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {rotation}°
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRotation(r => r + 90)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Brightness */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Luminosité: {brightness}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Contraste: {contrast}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset}>
          Réinitialiser
        </Button>
        <div className="flex-1" />
        <Button onClick={handleProcess}>
          <Upload className="w-4 h-4 mr-2" />
          Traiter l'image
        </Button>
      </div>
    </div>
  );
};