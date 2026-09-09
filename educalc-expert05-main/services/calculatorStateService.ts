const STORAGE_KEY_PREFIX = 'calculatorInputs_';

const getKey = (calculatorName: string): string => {
  return `${STORAGE_KEY_PREFIX}${calculatorName.replace(/\s/g, '')}`;
};

export const saveCalculatorState = (calculatorName: string, state: any): void => {
  if (!state || Object.keys(state).length === 0) {
    return; // Don't save empty or null state
  }
  try {
    const stateJson = JSON.stringify(state);
    localStorage.setItem(getKey(calculatorName), stateJson);
  } catch (error) {
    console.error(`Failed to save state for ${calculatorName} to localStorage:`, error);
  }
};

export const loadCalculatorState = (calculatorName: string): any | null => {
  try {
    const storedState = localStorage.getItem(getKey(calculatorName));
    return storedState ? JSON.parse(storedState) : null;
  } catch (error) {
    console.error(`Failed to load state for ${calculatorName} from localStorage:`, error);
    return null;
  }
};
