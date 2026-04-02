/**
 * Calculates the Pearson correlation coefficient between two numeric arrays.
 * 
 * 1.0 = perfect positive correlation
 * -1.0 = perfect negative correlation (moving in exact opposite directions)
 * 0.0 = no correlation
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n <= 1) return 0;

  // Use only matching lengths
  const X = x.slice(0, n);
  const Y = y.slice(0, n);

  const sumX = X.reduce((a, b) => a + b, 0);
  const sumY = Y.reduce((a, b) => a + b, 0);
  const sumXY = X.reduce((a, _, i) => a + X[i] * Y[i], 0);
  const sumXsq = X.reduce((a, b) => a + b * b, 0);
  const sumYsq = Y.reduce((a, b) => a + b * b, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXsq - sumX * sumX) * (n * sumYsq - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/** 
 * Returns a CSS color string based on correlation strength 
 */
export function getCorrelationColor(cor: number): string {
  // Map -1 to 1 into a color range
  // Positive (1.0) -> Deep Blue / Bullish (high move together)
  // Negative (-1.0) -> Deep Red / Bearish (high move opposite)
  // Zero (0.0) -> Grey / Neutral
  
  if (cor > 0) {
    const opacity = Math.abs(cor);
    return `rgba(59, 130, 246, ${opacity})`; // #3b82f6
  } else if (cor < 0) {
    const opacity = Math.abs(cor);
    return `rgba(239, 68, 68, ${opacity})`; // #ef4444
  }
  return 'rgba(255, 255, 255, 0.05)';
}
