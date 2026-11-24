export function smoothPath(points: { x: number; y: number }[]) {
  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M${point.x} ${point.y}`;
    }
    const previous = points[index - 1];
    const beforePrevious = points[index - 2] ?? previous;
    const next = points[index + 1] ?? point;
    const c1x = previous.x + (point.x - beforePrevious.x) / 6;
    const c1y = previous.y + (point.y - beforePrevious.y) / 6;
    const c2x = point.x - (next.x - previous.x) / 6;
    const c2y = point.y - (next.y - previous.y) / 6;
    return `${path} C${c1x} ${c1y} ${c2x} ${c2y} ${point.x} ${point.y}`;
  }, "");
}

export const tickCount = 4;
const niceSteps = [1, 1.5, 2, 2.5, 3, 4, 5, 10];
export const axisFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
});

// Rounds the axis step to a readable multiple of a power of ten so the labels
// stay readable for any consumption range.
export function niceStep(rawStep: number) {
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const nice = niceSteps.find((step) => residual <= step) ?? 10;
  return nice * magnitude;
}

export function axisTicks(maxData: number) {
  const step = niceStep(Math.max(maxData, 1) / tickCount);
  return {
    maxValue: step * tickCount,
    ticks: Array.from(
      { length: tickCount + 1 },
      (_, index) => (tickCount - index) * step,
    ),
  };
}
