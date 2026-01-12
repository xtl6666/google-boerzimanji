
import { TOTAL_UNITS, NUM_VISIBLE, PATTERN_CAT } from '../constants';

// Initialize random weights
export const initNetwork = (): { weights: number[][], biases: number[], state: number[] } => {
  const weights: number[][] = Array(TOTAL_UNITS).fill(0).map(() => Array(TOTAL_UNITS).fill(0));
  const biases: number[] = Array(TOTAL_UNITS).fill(0);
  // Randomize initial state
  const state: number[] = Array(TOTAL_UNITS).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);

  // Initialize weights with variance
  for (let i = 0; i < TOTAL_UNITS; i++) {
    for (let j = i + 1; j < TOTAL_UNITS; j++) {
      const w = (Math.random() - 0.5) * 0.1; 
      weights[i][j] = w;
      weights[j][i] = w;
    }
    biases[i] = (Math.random() - 0.5) * 1.0; 
  }

  // --- CRITICAL TEACHING MECHANIC ---
  // Create a deep "Trap" (False Memory) in the middle (indices 3 and 4).
  // This ensures that when the user switches to Night Mode, balls WILL fall here.
  // This forces the user to use "Fill" to remove this hallucination.
  // Bias = 6.0 is very deep (user digs add ~1.0 per click).
  biases[3] = 6.0;
  biases[4] = 6.0;

  return { weights, biases, state };
};

// Calculate global energy
export const calculateEnergy = (state: number[], weights: number[][], biases: number[]): number => {
  let energy = 0;
  for (let i = 0; i < TOTAL_UNITS; i++) {
    if (state[i] === 1) {
      energy -= biases[i];
      for (let j = i + 1; j < TOTAL_UNITS; j++) {
        if (state[j] === 1) {
          energy -= weights[i][j];
        }
      }
    }
  }
  return energy;
};

// Stochastic update
export const updateUnit = (
  index: number,
  state: number[],
  weights: number[][],
  biases: number[],
  temp: number
): number => {
  let input = biases[index];
  for (let j = 0; j < TOTAL_UNITS; j++) {
    if (j !== index && state[j] === 1) {
      input += weights[index][j];
    }
  }

  const p_on = 1 / (1 + Math.exp(-input / temp));
  return Math.random() < p_on ? 1 : 0;
};

// Hebbian Learning
export const learn = (
  state: number[],
  weights: number[][],
  biases: number[],
  rate: number,
  direction: 1 | -1
): { weights: number[][], biases: number[] } => {
  const newWeights = weights.map(row => [...row]);
  const newBiases = [...biases];
  
  // High learning rate for visual demonstration
  const biasRate = rate * 5.0; 
  const weightRate = rate * 0.1;

  for (let i = 0; i < TOTAL_UNITS; i++) {
    if (state[i] === 1) {
      // Update bias
      newBiases[i] += biasRate * direction; 
      
      // Update weights
      for (let j = i + 1; j < TOTAL_UNITS; j++) {
        if (state[j] === 1) {
          const delta = weightRate * direction; 
          newWeights[i][j] += delta;
          newWeights[j][i] += delta;
        }
      }
    }
  }
  
  // Clamp values
  const clamp = (x: number) => Math.max(-25, Math.min(25, x));
  
  return {
    weights: newWeights.map(row => row.map(clamp)),
    biases: newBiases.map(clamp)
  };
};

export const getCatSimilarity = (visibleState: number[]): number => {
  let matches = 0;
  for(let i=0; i<NUM_VISIBLE; i++) {
    if (visibleState[i] === PATTERN_CAT[i]) matches++;
  }
  return matches / NUM_VISIBLE;
};
