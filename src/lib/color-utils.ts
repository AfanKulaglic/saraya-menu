/** Detect whether a hex color is "dark" (luminance < 128) */
export function isDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

/** Return a subtle muted text color appropriate for a given background */
export function mutedText(bgHex: string): string {
  return isDark(bgHex) ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";
}

/** Return a subtle border color appropriate for a given background */
export function subtleBorder(bgHex: string): string {
  return isDark(bgHex) ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
}

/** Return a subtle surface color for chips/pills on a given background */
export function subtleSurface(bgHex: string): string {
  return isDark(bgHex) ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
}

/** Return a hover surface color appropriate for a given background */
export function hoverSurface(bgHex: string): string {
  return isDark(bgHex) ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)";
}

/** Lighten/darken a hex color by a factor -1..1 */
export function adjustBrightness(hex: string, factor: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const adjust = (v: number) =>
    Math.min(255, Math.max(0, Math.round(v + (factor > 0 ? (255 - v) : v) * factor)));
  return `#${adjust(r).toString(16).padStart(2, "0")}${adjust(g).toString(16).padStart(2, "0")}${adjust(b).toString(16).padStart(2, "0")}`;
}

/** Return a contrasting text color (white or dark) for a given background */
export function contrastText(bgHex: string): string {
  return isDark(bgHex) ? "#FFFFFF" : "#1E1E1E";
}
