import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [error, setError] = useState<string | null>(null);

  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Por favor selecciona una imagen en formato JPG o PNG');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && validateImage(file)) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateImage(file)) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  return (
    <div className="w-full max-w-xl">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`w-full p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <label className="flex flex-col items-center justify-center gap-4 cursor-pointer">
          <Upload className={`w-12 h-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          <div className="text-center">
            <span className="text-lg font-medium text-gray-600 block">
              Arrastra una imagen o haz clic para seleccionar
            </span>
            <span className="text-sm text-gray-500 block mt-1">
              Formatos soportados: JPG, PNG
            </span>
            <span className="text-sm text-gray-500 block">
              Tamaño máximo: 5MB
            </span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleChange}
          />
        </label>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};