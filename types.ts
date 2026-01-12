export interface PixelState {
  id: number;
  val: number; // 0 or 1
  isVisible: boolean; // true for visible pixels, false for hidden units
}

export interface BoltzmannState {
  pixels: number[]; // 0 or 1 array for all units (visible + hidden)
  weights: number[][]; // Adjacency matrix
  biases: number[];
}

export interface LandscapePoint {
  x: number; // 0 (Dog/Noise) to 1 (Cat)
  y: number; // Energy height
}
