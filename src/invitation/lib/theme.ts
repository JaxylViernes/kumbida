import { invitation } from '../config/invitation';

const toRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Pushes the config palette into CSS variables consumed by Tailwind + CSS. */
export function applyTheme() {
  const root = document.documentElement;
  Object.entries(invitation.theme.colors).forEach(([k, v]) => {
    root.style.setProperty(`--c-${k}`, toRgb(v));
  });
}
