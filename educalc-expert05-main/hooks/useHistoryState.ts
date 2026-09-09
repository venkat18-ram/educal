import { useState, useCallback } from 'react';

/**
 * A custom hook to manage state with undo/redo functionality.
 * @param initialState The initial state value.
 * @returns An object with the current state, and functions to update it, undo, redo, and reset.
 */
export const useHistoryState = <T>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];

  const setState = useCallback((newState: T | ((prevState: T) => T)) => {
    const resolvedState = typeof newState === 'function' ? (newState as (prevState: T) => T)(state) : newState;
    
    // If the new state is the same as the current state, do nothing.
    if (JSON.stringify(resolvedState) === JSON.stringify(state)) {
      return;
    }

    // When a new state is set, clear any "redo" history.
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(resolvedState);

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [currentIndex, history, state]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);
  
  const resetState = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { state, setState, undo, redo, canUndo, canRedo, resetState };
};
