import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ColorAnalysis } from './components/ColorAnalysis';
import { analyzeImageColors, checkDesignRule } from './utils/colorAnalysis';
import type { ColorPercentage } from './utils/colorAnalysis';
import { Paintbrush } from 'lucide-react';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorPercentage[]>([]);
  const [totalColors, setTotalColors] = useState<number>(0);
  const [followsRule, setFollowsRule] = useState(false);

  const handleImageSelect = useCallback(async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);

    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { colors: analyzedColors, totalColors } = analyzeImageColors(imageData);
      setColors(analyzedColors);
      setTotalColors(totalColors);
      setFollowsRule(checkDesignRule(analyzedColors));

      // Clean up
      URL.revokeObjectURL(imageUrl);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Paintbrush className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Analizador de Colores
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sube una imagen para analizar su distribución de colores y verificar si cumple
            con la regla de diseño 60-30-10 (±5% de margen)
          </p>
        </header>

        <div className="flex flex-col items-center gap-8">
          <ImageUploader onImageSelect={handleImageSelect} />

          {image && (
            <div className="w-full max-w-xl">
              <img
                src={image}
                alt="Imagen subida"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {colors.length > 0 && (
            <ColorAnalysis 
              colors={colors} 
              followsRule={followsRule} 
              totalColors={totalColors}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;