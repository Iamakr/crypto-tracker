'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Cryptocurrency, AVAILABLE_CURRENCIES, getTopCryptocurrencies } from '../services/api';

// Define the context shape
interface AppContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  recentlyViewed: Cryptocurrency[];
  addToRecentlyViewed: (crypto: Cryptocurrency) => void;
  removeFromRecentlyViewed: (id: string) => void;
  isUpdatingPrices: boolean;
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  currency: 'usd',
  setCurrency: () => {},
  recentlyViewed: [],
  addToRecentlyViewed: () => {},
  removeFromRecentlyViewed: () => {},
  isUpdatingPrices: false,
});

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<string>('usd');
  const [recentlyViewed, setRecentlyViewed] = useState<Cryptocurrency[]>([]);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('currency');
      
      if (savedCurrency && AVAILABLE_CURRENCIES.includes(savedCurrency)) {
        setCurrencyState(savedCurrency);
      }
      
      const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
      if (savedRecentlyViewed) {
        const parsed = JSON.parse(savedRecentlyViewed);
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('currency', currency);
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Error saving recently viewed to localStorage:', error);
    }
  }, [recentlyViewed]);

  // Update prices when currency changes
  const updateRecentlyViewedPrices = useCallback(async () => {
    if (recentlyViewed.length === 0) return;
    
    setIsUpdatingPrices(true);
    try {
      const allCryptos = await getTopCryptocurrencies(currency, 250);
      
      const cryptoMap = new Map<string, Cryptocurrency>();
      allCryptos.forEach(crypto => {
        cryptoMap.set(crypto.id, crypto);
      });
      
      setRecentlyViewed(prev => {
        return prev.map(item => {
          const updatedCrypto = cryptoMap.get(item.id);
          if (updatedCrypto) {
            return {
              ...item,
              current_price: updatedCrypto.current_price,
              market_cap: updatedCrypto.market_cap,
              total_volume: updatedCrypto.total_volume,
              price_change_percentage_24h: updatedCrypto.price_change_percentage_24h,
            };
          }
          return item;
        });
      });
    } catch (error) {
      console.error('Error updating recently viewed prices:', error);
    } finally {
      setIsUpdatingPrices(false);
    }
  }, [currency, recentlyViewed.length]);

  useEffect(() => {
    updateRecentlyViewedPrices();
  }, [currency, updateRecentlyViewedPrices]);

  const setCurrency = (newCurrency: string) => {
    if (AVAILABLE_CURRENCIES.includes(newCurrency)) {
      setCurrencyState(newCurrency);
    } else {
      console.warn(`Invalid currency: ${newCurrency}. Using default.`);
      setCurrencyState('usd');
    }
  };

  const addToRecentlyViewed = (crypto: Cryptocurrency) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== crypto.id);
      const updated = [crypto, ...filtered].slice(0, 10);
      return updated;
    });
  };

  const removeFromRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => prev.filter((item) => item.id !== id));
  };

  const value = {
    currency,
    setCurrency,
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    isUpdatingPrices,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 