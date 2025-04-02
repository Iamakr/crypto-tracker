'use client';

import { useState, useEffect } from 'react';
import { Cryptocurrency, getTopCryptocurrencies } from './services/api';
import CryptoCard from './components/ui/CryptoCard';
import SearchBar from './components/ui/SearchBar';
import CurrencySelector from './components/ui/CurrencySelector';
import RecentlyViewed from './components/ui/RecentlyViewed';
import { useAppContext } from './context/AppContext';

/**
 * Home Page Component
 * 
 * Displays the top 50 cryptocurrencies and provides search, filtering,
 * and recently viewed functionality.
 */
export default function Home() {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency } = useAppContext();

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCryptos() {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getTopCryptocurrencies(currency);
        if (isMounted) {
          setCryptos(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching cryptocurrencies:', err);
          setError('Failed to load cryptocurrencies. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCryptos();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [currency]);

  /**
   * Loading skeleton component for cryptocurrency cards
   */
  const CryptoSkeleton = () => (
    <div className="flex flex-col overflow-hidden bg-background-light rounded-lg shadow-lg animate-pulse">
      <div className="flex items-center p-4 border-b border-background">
        <div className="w-10 h-10 mr-3 bg-gray-700 rounded-full"></div>
        <div className="flex-grow">
          <div className="w-24 h-4 mb-2 bg-gray-700 rounded"></div>
          <div className="w-12 h-3 bg-gray-700 rounded"></div>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-20 h-4 mb-1 bg-gray-700 rounded"></div>
          <div className="w-16 h-3 bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <div className="w-16 h-3 mb-2 bg-gray-700 rounded"></div>
          <div className="w-24 h-4 bg-gray-700 rounded"></div>
        </div>
        <div>
          <div className="w-20 h-3 mb-2 bg-gray-700 rounded"></div>
          <div className="w-24 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen px-4 py-8 text-white bg-background sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with title and controls */}
        <div className="flex flex-col items-center justify-between mb-8 md:flex-row">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold leading-tight text-white">
              Token<span className="text-primary-500">Folio</span>
            </h1>
            <p className="mt-1 text-gray-400">Track and explore top cryptocurrencies</p>
          </div>
          <div className="flex flex-col items-center w-full space-y-4 md:w-auto md:flex-row md:space-y-0 md:space-x-4">
            <SearchBar />
            <CurrencySelector />
          </div>
        </div>

        {/* Recently viewed section */}
        <RecentlyViewed />

        {/* Main cryptocurrency listing */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Top 50 Cryptocurrencies</h2>
          
          {/* Error message display */}
          {error && (
            <div className="p-4 text-center text-white bg-error bg-opacity-20 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          {/* Cryptocurrency grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 9 }).map((_, index) => <CryptoSkeleton key={index} />)
              : cryptos.map((crypto) => <CryptoCard key={crypto.id} crypto={crypto} />)}
          </div>
        </div>
      </div>
    </main>
  );
} 