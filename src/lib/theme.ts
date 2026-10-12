/** Retorna branco ou quase-preto, o que tiver melhor contraste com a cor. */
export function readableTextColor(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return "#ffffff";
  const n = parseInt(match[1], 16);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
  // Contraste com branco vs. com #111827
  const withWhite = 1.05 / (luminance + 0.05);
  const withDark = (luminance + 0.05) / (0.0137 + 0.05);
  return withWhite >= withDark ? "#ffffff" : "#111827";
}

export function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}
