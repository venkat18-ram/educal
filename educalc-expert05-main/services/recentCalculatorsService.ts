import { Calculator } from '../types';

const STORAGE_KEY = 'recentCalculators';
const MAX_RECENTS = 4;

export const getRecentCalculators = (): Calculator[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to retrieve recent calculators:", error);
    return [];
  }
};

export const addRecentCalculator = (calculator: Calculator): void => {
  try {
    const recents = getRecentCalculators();
    // Remove if it already exists to move it to the front
    const filtered = recents.filter(c => c.name !== calculator.name);
    const updated = [calculator, ...filtered];
    
    if (updated.length > MAX_RECENTS) {
      updated.splice(MAX_RECENTS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save recent calculator:", error);
  }
};
