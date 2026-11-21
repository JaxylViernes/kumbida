/** @type {import('tailwindcss').Config} */
// Colors read CSS variables that are set from src/config/invitation.ts (theme.colors),
// so the palette is edited in one place.
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: c('ivory'),
        champagne: c('champagne'),
        sage: c('sage'),
        rose: c('rose'),
        gold: c('gold'),
        olive: c('olive'),
        ink: c('ink'),
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Pinyon Script"', 'cursive'],
        hand: ['Caveat', 'cursive'],
        caps: ['Jost', 'system-ui', 'sans-serif'],
      },
      // Fluid sizes scale with the card (container query units) so the card
      // reads the same on every phone. Minimums keep text legible.
      fontSize: {
        caps: ['clamp(9.5px, min(2.7cqw, 1.75cqh), 12.5px)', { letterSpacing: '0.26em', lineHeight: '1.6' }],
        small: ['clamp(12.5px, min(3.6cqw, 2.3cqh), 15.5px)', { lineHeight: '1.5' }],
        body: ['clamp(14px, min(4.2cqw, 2.75cqh), 18.5px)', { lineHeight: '1.5' }],
        lead: ['clamp(16px, min(5.2cqw, 3.4cqh), 23px)', { lineHeight: '1.3' }],
        title: ['clamp(20px, min(7cqw, 4.6cqh), 32px)', { lineHeight: '1.15' }],
        numeral: ['clamp(26px, min(9.5cqw, 6.2cqh), 42px)', { lineHeight: '1' }],
        script: ['clamp(30px, min(11cqw, 7cqh), 50px)', { lineHeight: '1.1' }],
        names: ['clamp(38px, min(15.5cqw, 9.6cqh), 70px)', { lineHeight: '1.05' }],
      },
    },
  },
  plugins: [],
};
