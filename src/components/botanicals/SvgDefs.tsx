import { invitation } from '../../config/invitation';

const { colors } = invitation.theme;

/**
 * Shared gradients for every inline SVG on the page.
 * (Kept at 0×0 instead of display:none — hidden defs stop gradients rendering in some browsers.)
 */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {/* Gold foil with a slow light sweep */}
        <linearGradient id="gold-foil" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor="#9a7638" />
          <stop offset="0.28" stopColor={colors.gold} />
          <stop offset="0.45" stopColor="#f5e6bb" />
          <stop offset="0.6" stopColor={colors.gold} />
          <stop offset="1" stopColor="#a5813f" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-0.6 0; 0.6 0; 0.6 0"
            keyTimes="0; 0.55; 1"
            dur="5s"
            repeatCount="1"
            fill="freeze"
          />
        </linearGradient>
        <linearGradient id="gold-flat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b8954f" />
          <stop offset="0.5" stopColor="#e2c98f" />
          <stop offset="1" stopColor="#a8843f" />
        </linearGradient>

        {/* Petals */}
        <radialGradient id="petal-rose" cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#fbf0ec" />
          <stop offset="0.55" stopColor={colors.rose} />
          <stop offset="1" stopColor="#bf968d" />
        </radialGradient>
        <radialGradient id="petal-cream" cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#fffdf7" />
          <stop offset="0.6" stopColor="#f1e6d2" />
          <stop offset="1" stopColor="#d9c6a4" />
        </radialGradient>
        <radialGradient id="rose-heart" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#a8746c" />
          <stop offset="1" stopColor="#c99d94" />
        </radialGradient>

        {/* Leaves */}
        <linearGradient id="leaf-sage" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7f8668" />
          <stop offset="1" stopColor={colors.sage} />
        </linearGradient>

        {/* Watercolor washes — gradients instead of blur filters (cheap on phones) */}
        <radialGradient id="wash-rose">
          <stop offset="0" stopColor={colors.rose} stopOpacity="0.55" />
          <stop offset="1" stopColor={colors.rose} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wash-sage">
          <stop offset="0" stopColor={colors.sage} stopOpacity="0.5" />
          <stop offset="1" stopColor={colors.sage} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wash-gold">
          <stop offset="0" stopColor={colors.gold} stopOpacity="0.35" />
          <stop offset="1" stopColor={colors.gold} stopOpacity="0" />
        </radialGradient>

        {/* Wax */}
        <radialGradient id="wax" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor={invitation.theme.wax[0]} />
          <stop offset="0.55" stopColor={invitation.theme.wax[1]} />
          <stop offset="1" stopColor={invitation.theme.wax[2]} />
        </radialGradient>
        <radialGradient id="wax-inner" cx="0.6" cy="0.65" r="0.7">
          <stop offset="0" stopColor={invitation.theme.wax[0]} />
          <stop offset="1" stopColor={invitation.theme.wax[1]} />
        </radialGradient>
      </defs>
    </svg>
  );
}
