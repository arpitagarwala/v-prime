'use client';
import { useState, useEffect } from 'react';

export type LayoutStates = {
  macro: boolean;
  sector: boolean;
  discovery: boolean;
  events: boolean;
  indices: boolean;
  research: boolean;
};

const STORAGE_KEY = '5paisa_prime_layout_v1';

const DEFAULT_STATE: LayoutStates = {
  macro: true,
  sector: true,
  discovery: true,
  events: true,
  indices: true,
  research: true,
};

export function useLayoutStore() {
  const [layout, setLayout] = useState<LayoutStates | null>(null);

  // Initial load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (e) {
        setLayout(DEFAULT_STATE);
      }
    } else {
      setLayout(DEFAULT_STATE);
    }
  }, []);

  // Persist to LocalStorage whenever layout changes
  const toggleModule = (module: keyof LayoutStates) => {
    if (!layout) return;
    const newState = { ...layout, [module]: !layout[module] };
    setLayout(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  return {
    layout: layout || DEFAULT_STATE,
    toggleModule,
    isReady: !!layout
  };
}
