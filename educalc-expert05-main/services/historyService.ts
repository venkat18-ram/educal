import { HistoryItem, CalculationResult } from '../types';

const STORAGE_KEY_PREFIX = 'calculatorHistory_';
const MAX_HISTORY_ITEMS = 15;

const getKey = (calculatorName: string): string => {
  return `${STORAGE_KEY_PREFIX}${calculatorName.replace(/\s/g, '')}`;
};

export const getHistory = (calculatorName: string): HistoryItem[] => {
  try {
    const storedHistory = localStorage.getItem(getKey(calculatorName));
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (error) {
    console.error("Failed to retrieve history from localStorage:", error);
    return [];
  }
};

export const addHistoryItem = (calculatorName: string, item: { inputs: any; result: CalculationResult }): HistoryItem[] => {
  const newHistoryItem: HistoryItem = {
    ...item,
    id: Date.now(),
  };

  try {
    const currentHistory = getHistory(calculatorName);
    const updatedHistory = [newHistoryItem, ...currentHistory];
    
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
      updatedHistory.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(getKey(calculatorName), JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error("Failed to save history to localStorage:", error);
    return getHistory(calculatorName);
  }
};

export const clearHistory = (calculatorName: string): void => {
  try {
    localStorage.removeItem(getKey(calculatorName));
  } catch (error) {
    console.error("Failed to clear history from localStorage:", error);
  }
};
