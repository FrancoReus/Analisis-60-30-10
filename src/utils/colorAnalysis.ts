import { Color } from 'color.js';

export interface ColorPercentage {
  color: string;
  percentage: number;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const parseRGB = (rgb: string): RGBColor => {
  const match = rgb.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!match) throw new Error('Invalid RGB string');
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
};

const colorDistance = (color1: RGBColor, color2: RGBColor): number => {
  const rDiff = color1.r - color2.r;
  const gDiff = color1.g - color2.g;
  const bDiff = color1.b - color2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

const quantizeColor = (r: number, g: number, b: number, levels: number = 32): string => {
  const factor = 256 / levels;
  r = Math.floor(r / factor) * factor;
  g = Math.floor(g / factor) * factor;
  b = Math.floor(b / factor) * factor;
  return `rgb(${r},${g},${b})`;
};

const groupSimilarColors = (colors: Map<string, number>): Map<string, number> => {
  const grouped = new Map<string, number>();
  const processed = new Set<string>();
  const tolerance = 30; // Lower tolerance for more distinct color groups

  for (const [color1, count1] of colors.entries()) {
    if (processed.has(color1)) continue;
    
    let totalCount = count1;
    let weightedR = parseRGB(color1).r * count1;
    let weightedG = parseRGB(color1).g * count1;
    let weightedB = parseRGB(color1).b * count1;
    processed.add(color1);

    for (const [color2, count2] of colors.entries()) {
      if (processed.has(color2)) continue;
      
      const distance = colorDistance(parseRGB(color1), parseRGB(color2));
      if (distance <= tolerance) {
        const rgb2 = parseRGB(color2);
        weightedR += rgb2.r * count2;
        weightedG += rgb2.g * count2;
        weightedB += rgb2.b * count2;
        totalCount += count2;
        processed.add(color2);
      }
    }

    const averageColor = quantizeColor(
      Math.round(weightedR / totalCount),
      Math.round(weightedG / totalCount),
      Math.round(weightedB / totalCount)
    );
    grouped.set(averageColor, totalCount);
  }

  return grouped;
};

export const analyzeImageColors = (imageData: ImageData): { 
  colors: ColorPercentage[],
  totalColors: number 
} => {
  const pixels = imageData.data;
  const colorMap = new Map<string, number>();
  const totalPixels = pixels.length / 4;

  // Sample pixels for better performance
  const skipFactor = Math.max(1, Math.floor(Math.sqrt(totalPixels) / 100));

  for (let i = 0; i < pixels.length; i += 4 * skipFactor) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a < 128) continue; // Skip transparent and semi-transparent pixels

    const rgb = quantizeColor(r, g, b, 16); // Reduced quantization levels for better grouping
    colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
  }

  // Store total unique colors before grouping
  const totalColors = colorMap.size;

  // Group similar colors and get the top 3
  const groupedColors = groupSimilarColors(colorMap);
  const sortedColors = Array.from(groupedColors.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([color, count]) => ({
      color,
      percentage: (count / (totalPixels / skipFactor)) * 100
    }));

  // Normalize percentages to sum to 100%
  const totalPercentage = sortedColors.reduce((sum, { percentage }) => sum + percentage, 0);
  sortedColors.forEach(color => {
    color.percentage = (color.percentage / totalPercentage) * 100;
  });

  return {
    colors: sortedColors,
    totalColors
  };
};

export const checkDesignRule = (colors: ColorPercentage[]): boolean => {
  if (colors.length !== 3) return false;
  
  const [primary, secondary, accent] = colors;
  const margin = 5; // 5% margin for all colors
  
  const targetPrimary = 60;
  const targetSecondary = 30;
  const targetAccent = 10;
  
  const isPrimaryInRange = Math.abs(primary.percentage - targetPrimary) <= margin;
  const isSecondaryInRange = Math.abs(secondary.percentage - targetSecondary) <= margin;
  const isAccentInRange = Math.abs(accent.percentage - targetAccent) <= margin;
  
  return isPrimaryInRange && isSecondaryInRange && isAccentInRange;
};