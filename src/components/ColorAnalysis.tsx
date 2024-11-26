import React from 'react';
import { CheckCircle, XCircle, InfoIcon } from 'lucide-react';
import type { ColorPercentage } from '../utils/colorAnalysis';

interface ColorAnalysisProps {
  colors: ColorPercentage[];
  followsRule: boolean;
  totalColors: number;
}

export const ColorAnalysis: React.FC<ColorAnalysisProps> = ({ colors, followsRule, totalColors }) => {
  const getTargetPercentage = (index: number) => {
    return index === 0 ? 60 : index === 1 ? 30 : 10;
  };

  const getVarianceText = (actual: number, index: number) => {
    const target = getTargetPercentage(index);
    const variance = (actual - target).toFixed(1);
    const sign = variance > 0 ? '+' : '';
    return `${sign}${variance}%`;
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Regla 60-30-10</h3>
            <p className="text-sm text-gray-500">Margen de tolerancia: ±5%</p>
          </div>
          {followsRule ? (
            <div className="flex items-center text-green-500">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span>Cumple con la regla</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <XCircle className="w-6 h-6 mr-2" />
              <span>No cumple con la regla</span>
            </div>
          )}
        </div>
        
        {totalColors > 3 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Se detectaron {totalColors} colores distintos en la imagen. 
              Los colores similares han sido agrupados (tolerancia: 15%) y
              se analizan los 3 grupos más predominantes para evaluar la regla 60-30-10.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {colors.map((color, index) => {
          const targetPercentage = getTargetPercentage(index);
          const variance = getVarianceText(color.percentage, index);
          const isWithinMargin = Math.abs(color.percentage - targetPercentage) <= 5;

          return (
            <div
              key={color.color}
              className="bg-white p-4 rounded-lg shadow flex items-center gap-4"
            >
              <div
                className="w-16 h-16 rounded-lg shadow-inner"
                style={{ backgroundColor: color.color }}
              />
              <div className="flex-1">
                <h4 className="font-medium">
                  {index === 0
                    ? 'Color Principal (60%)'
                    : index === 1
                    ? 'Color Secundario (30%)'
                    : 'Color Acento (10%)'}
                </h4>
                <p className="text-gray-600">{color.color}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isWithinMargin ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${color.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">
                    {color.percentage.toFixed(1)}%
                  </span>
                  <span className={isWithinMargin ? 'text-blue-600' : 'text-amber-500'}>
                    {variance} del objetivo
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};