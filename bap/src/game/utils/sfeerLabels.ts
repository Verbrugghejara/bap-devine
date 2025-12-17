
export const SFEER_LABELS = [
  { index: 0, naam: 'TROPOSFEER', img: 'troposfeer-label', colors: { a: 0xFEF2C6, b: 0xFFDAA9, c: 0xEFA348, d: 0xA42348, e: 0x481328 } },
  { index: 1, naam: 'STRATOSFEER', img: 'stratosfeer-label', colors: { a: 0xFF8558, b: 0xF9693C, c: 0xD11C3F, d: 0x950C36, e: 0x500107 } },
  { index: 2, naam: 'MESOSFEER', img: 'mesosfeer-label', colors: { a: 0xC99CFF, b: 0xA46CEB, c: 0x7A3FCF, d: 0x512A9D, e: 0x2E1D63 } },
  { index: 3, naam: 'THERMOSFEER', img: 'thermosfeer-label', colors: { a: 0xE6A7FF, b: 0xC564FF, c: 0x7B6BFF, d: 0x3F4AFF, e: 0x1D2A8F } },
  { index: 4, naam: 'EXOSFEER', img: 'exosfeer-label', colors: { a: 0xA78DF9, b: 0x6C4FB5, c: 0x3B2E7B, d: 0x1E1A52, e: 0x0E0B2A } },
];

// Centrale kleuren voor sfeerlagen (zelfde volgorde als labels), neem telkens kleur 'a'
// export const SFEER_COLORS = SFEER_LABELS.map(s => s.colors.a);
export const SFEER_COLORS = SFEER_LABELS.map(sfeer => ({
    a: `#${sfeer.colors.a.toString(16).padStart(6, '0')}`,
    b: `#${sfeer.colors.b.toString(16).padStart(6, '0')}`,
    c: `#${sfeer.colors.c.toString(16).padStart(6, '0')}`,
    d: `#${sfeer.colors.d.toString(16).padStart(6, '0')}`,
    e: `#${sfeer.colors.e.toString(16).padStart(6, '0')}`
}));