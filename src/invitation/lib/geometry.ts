export type Pt = [number, number];

/** Evenly spaced points (with tangent angle in degrees) along a cubic bezier. */
export function alongCubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number, from = 0.08, to = 0.95) {
  const out: { x: number; y: number; a: number; t: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = from + ((to - from) * i) / Math.max(1, n - 1);
    const mt = 1 - t;
    const x = mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0];
    const y = mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1];
    const dx = 3 * mt ** 2 * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t ** 2 * (p3[0] - p2[0]);
    const dy = 3 * mt ** 2 * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t ** 2 * (p3[1] - p2[1]);
    out.push({ x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI, t });
  }
  return out;
}

export const cubicPath = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) =>
  `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;
