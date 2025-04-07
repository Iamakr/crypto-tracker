'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Cryptocurrency, getTopCryptocurrencies } from './services/api';
import CryptoCard from './components/ui/CryptoCard';
import SearchBar from './components/ui/SearchBar';
import CurrencySelector from './components/ui/CurrencySelector';
import RecentlyViewed from './components/ui/RecentlyViewed';
import { useAppContext } from './context/AppContext';

export default function Home() {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency } = useAppContext();
  const [retryCount, setRetryCount] = useState(0);
  const isFetchingRef = useRef(false);

  const fetchCryptos = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping duplicate request');
      return;
    }
    
    isFetchingRef.current = true;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching top cryptocurrencies in ${currency}...`);
      const data = await getTopCryptocurrencies(currency);
      setCryptos(data);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Error fetching cryptocurrencies:', err);
      const errorMessage = err.response?.status === 429 
        ? 'Rate limit hit with the cryptocurrency API. Please try again in a minute.'
        : 'Failed to load cryptocurrencies. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [currency]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchCryptos();
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        await fetchCryptos();
      } catch (error) {
        if (isMounted && retryCount < 3) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000);
          console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/3)...`);
          timeoutId = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadData();
          }, delay);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currency, fetchCryptos, retryCount]);

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
        <div className="flex flex-col items-center justify-between mb-8 md:flex-row">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold leading-tight text-white">
              Token<span className="text-primary-500">Folio</span>
            </h1>
            <p className="mt-1 text-gray-400">Track and explore top cryptocurrencies</p>
          </div>
          <div className="flex flex-col items-center w-full space-y-4 md:w-auto md:flex-row md:space-y-0 md:space-x-4">
            {cryptos.length > 0 && (
              <div className="w-full md:w-auto relative">
                <SearchBar cryptos={cryptos} />
              </div>
            )}
            <div className="relative">
              <CurrencySelector />
            </div>
          </div>
        </div>

        <RecentlyViewed />

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Top 50 Cryptocurrencies</h2>
          
          {error && (
            <div className="p-6 mb-6 text-center text-white bg-error bg-opacity-20 rounded-lg">
              <p className="mb-4">{error}</p>
              <button 
                onClick={handleRetry} 
                className="px-4 py-2 font-medium text-white transition-colors bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 9 }).map((_, index) => <CryptoSkeleton key={index} />)
              : cryptos.map((crypto) => <CryptoCard key={crypto.id} crypto={crypto} />)}
          </div>
          
          {!isLoading && !error && cryptos.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400">No cryptocurrencies found. Please try changing your filters or try again later.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 