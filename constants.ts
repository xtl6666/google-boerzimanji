
// 8x8 Grid (64 pixels) - Enlarged for better visibility
export const GRID_SIZE = 8;
export const NUM_VISIBLE = 64;
export const NUM_HIDDEN = 16;
export const TOTAL_UNITS = NUM_VISIBLE + NUM_HIDDEN;

// Colors
export const COLOR_DAY_BG = "bg-sky-50";
export const COLOR_NIGHT_BG = "bg-slate-900";

// Patterns (1 = On, 0 = Off)
// 8x8 Cat Face
export const PATTERN_CAT = [
  1, 0, 0, 0, 0, 0, 0, 1, // Ears tip
  1, 1, 0, 0, 0, 0, 1, 1, // Ears base
  1, 1, 1, 1, 1, 1, 1, 1, // Forehead
  1, 1, 0, 1, 1, 0, 1, 1, // Eyes
  1, 1, 1, 0, 0, 1, 1, 1, // Nose bridge
  1, 0, 1, 1, 1, 1, 0, 1, // Cheeks / Whiskers
  0, 1, 1, 1, 1, 1, 1, 0, // Chin
  0, 0, 1, 1, 1, 1, 0, 0  // Bottom
];

// 8x8 Dog Face (Floppy ears)
export const PATTERN_DOG = [
  0, 0, 1, 1, 1, 1, 0, 0, // Top head
  0, 1, 1, 1, 1, 1, 1, 0, // Head
  1, 1, 0, 0, 0, 0, 1, 1, // Floppy ears start
  1, 1, 0, 1, 1, 0, 1, 1, // Eyes
  1, 1, 1, 1, 1, 1, 1, 1, // Snout start
  0, 1, 1, 0, 0, 1, 1, 0, // Nose
  0, 1, 1, 1, 1, 1, 1, 0, // Mouth
  0, 0, 1, 1, 1, 1, 0, 0  // Chin
];
