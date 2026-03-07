import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTextImage(text: string, width = 1200, height = 630): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const upperText = text.toUpperCase();

  // Background - Deep vibrant emerald gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#059669'); // emerald-600
  gradient.addColorStop(0.5, '#10b981'); // emerald-500
  gradient.addColorStop(1, '#047857'); // emerald-700
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Vignette effect
  const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Subtle pattern - diagonal lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 2;
  for (let i = -width; i < width + height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // Text settings
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Dynamic font size - much larger for impact
  // 1200px width allows for quite large text
  let fontSize = upperText.length > 25 ? 70 : upperText.length > 15 ? 90 : 120;
  ctx.font = `900 ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  // Text Shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  // Wrap text into multiple lines
  const words = upperText.split(' ');
  let lines: string[] = [];
  let currentLine = '';
  const maxLineWidth = width * 0.85;

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxLineWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  // Adjust font size if total height is too much
  let totalHeight = lines.length * fontSize * 1.2;
  while (totalHeight > height * 0.8 && fontSize > 30) {
    fontSize -= 5;
    ctx.font = `900 ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    // Re-wrap with new font size
    lines = [];
    currentLine = '';
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    totalHeight = lines.length * fontSize * 1.2;
  }

  // Draw lines centered
  const lineHeight = fontSize * 1.15;
  const startY = (height - (lines.length - 1) * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  return canvas.toDataURL('image/png', 0.9);
}
