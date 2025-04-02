'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Cryptocurrency } from '../services/api';

// Define the context shape
interface AppContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  recentlyViewed: Cryptocurrency[];
  addToRecentlyViewed: (crypto: Cryptocurrency) => void;
  removeFromRecentlyViewed: (id: string) => void;
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  currency: 'usd',
  setCurrency: () => {},
  recentlyViewed: [],
  addToRecentlyViewed: () => {},
  removeFromRecentlyViewed: () => {},
});

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<string>('usd');
  const [recentlyViewed, setRecentlyViewed] = useState<Cryptocurrency[]>([]);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    if (savedRecentlyViewed) {
      try {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      } catch (error) {
        console.error('Error parsing recently viewed:', error);
      }
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Add cryptocurrency to recently viewed (max 10)
  const addToRecentlyViewed = (crypto: Cryptocurrency) => {
    setRecentlyViewed((prev) => {
      // If already exists, move to front
      const filtered = prev.filter((item) => item.id !== crypto.id);
      const updated = [crypto, ...filtered].slice(0, 10);
      return updated;
    });
  };

  // Remove cryptocurrency from recently viewed
  const removeFromRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => prev.filter((item) => item.id !== id));
  };

  const value = {
    currency,
    setCurrency,
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 