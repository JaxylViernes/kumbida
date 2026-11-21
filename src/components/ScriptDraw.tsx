/**
 * Script heading that writes itself: the letter outlines are traced
 * stroke by stroke, then the ink floods in.
 */
export function ScriptDraw({
  text,
  className = '',
  size = 46,
  delay = 0,
  gold = false,
}: {
  text: string;
  className?: string;
  size?: number;
  delay?: number;
  gold?: boolean;
}) {
  return (
    <svg viewBox="0 0 300 74" className={`overflow-visible ${className}`} role="img" aria-label={text}>
      <text
        x="150"
        y="52"
        textAnchor="middle"
        fontFamily="'Pinyon Script', cursive"
        fontSize={size}
        className="ink-draw"
        style={{
          animationDelay: `${delay}s, ${delay + 1.5}s`,
          ...(gold ? { color: '#b08c4c' } : null),
        }}
      >
        {text}
      </text>
    </svg>
  );
}
