import { Calculator } from '../types';

const STORAGE_KEY = 'favoriteCalculators';

/**
 * Retrieves the list of favorite calculators from localStorage.
 */
export const getFavorites = (): Calculator[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to retrieve favorite calculators:", error);
    return [];
  }
};

/**
 * Checks if a calculator is marked as a favorite.
 * @param calculatorName - The name of the calculator to check.
 * @returns True if the calculator is a favorite, false otherwise.
 */
export const isFavorite = (calculatorName: string): boolean => {
    const favorites = getFavorites();
    return favorites.some(c => c.name === calculatorName);
};

/**
 * Toggles a calculator's favorite status.
 * Adds it to favorites if it's not there, removes it if it is.
 * @param calculator - The calculator object to toggle.
 * @returns The updated array of favorite calculators.
 */
export const toggleFavorite = (calculator: Calculator): Calculator[] => {
    const favorites = getFavorites();
    const calculatorIndex = favorites.findIndex(c => c.name === calculator.name);

    let updatedFavorites;

    if (calculatorIndex > -1) {
        // Remove from favorites
        favorites.splice(calculatorIndex, 1);
        updatedFavorites = favorites;
    } else {
        // Add to favorites
        updatedFavorites = [calculator, ...favorites];
    }
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
        console.error("Failed to save favorite calculators:", error);
    }
    return updatedFavorites;
};
