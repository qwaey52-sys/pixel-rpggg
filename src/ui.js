export const FONT = '"Pixelify Sans", monospace';

export function style(size, color = '#ffffff', extra = {}) {
  return { fontFamily: FONT, fontSize: `${size}px`, color, ...extra };
}
