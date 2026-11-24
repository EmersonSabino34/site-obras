// HENPROTRUST logo, redrawn as vector shapes from the original artwork
// (2000 × 1394 grid) so it stays sharp at any size.

export const BRAND_ORANGE = "#EE7F1D";
export const BRAND_NAVY = "#101B2B";

const ROOF = "1017,0 1811,795 1737,795 1017,74 297,795 222,795";
const CHIMNEY = "570,102 660,102 660,357 570,447";
const HOUSE =
  "1017,119 1692,795 1600,795 1539,734 1539,1121 1424,1121 1424,619 1017,212 605,624 605,1121 490,1121 490,738 433,795 341,795";
const LETTER_H =
  "697,733 753,733 753,848 882,848 882,422 947,357 947,1121 882,1121 882,897 753,897 753,1121 697,1121";
const LETTER_T =
  "1041,585 1310,585 1352,637 1215,637 1215,1121 1149,1121 1149,637 1041,637";

/** Shapes of the house symbol (plain elements, so next/og can render them too). */
function markShapes(letters: string) {
  return [
    <polygon key="roof" points={ROOF} fill={BRAND_ORANGE} />,
    <polygon key="chimney" points={CHIMNEY} fill={BRAND_ORANGE} />,
    <polygon key="house" points={HOUSE} fill={BRAND_ORANGE} />,
    <rect key="ground" x="0" y="1121" width="2000" height="56" fill={BRAND_ORANGE} />,
    <polygon key="h" points={LETTER_H} fill={letters} />,
    <polygon key="t" points={LETTER_T} fill={letters} />,
  ];
}

/** Standalone <svg> for image generation (next/og). */
export function markSvg({
  letters = "#FFFFFF",
  width,
  height,
}: {
  letters?: string;
  width?: number;
  height?: number;
} = {}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2000 1177"
      width={width}
      height={height}
    >
      {markShapes(letters)}
    </svg>
  );
}

type Props = {
  className?: string;
  /** Colour of the "HT" letters and wordmark. White for dark backgrounds. */
  letters?: string;
  /** Accessible name. When omitted the graphic is treated as decorative. */
  title?: string;
};

function a11y(title?: string) {
  return title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true } as const);
}

/** House symbol only (no wordmark). */
export function HouseMark({ className, letters = "#FFFFFF", title }: Props) {
  return (
    <svg viewBox="0 0 2000 1177" className={className} focusable="false" {...a11y(title)}>
      {markShapes(letters)}
    </svg>
  );
}

/** Full stacked logo: house symbol, spaced wordmark and underline bars. */
export function FullLogo({ className, letters = "#FFFFFF", title }: Props) {
  return (
    <svg viewBox="0 0 2000 1394" className={className} focusable="false" {...a11y(title)}>
      {markShapes(letters)}
      <text
        x="8"
        y="1313"
        textLength="1984"
        lengthAdjust="spacing"
        fill={letters}
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: 118,
          fontWeight: 400,
        }}
      >
        HENPROTRUST
      </text>
      <rect x="0" y="1380" width="629" height="14" fill={BRAND_ORANGE} />
      <rect x="1370" y="1380" width="630" height="14" fill={BRAND_ORANGE} />
    </svg>
  );
}
