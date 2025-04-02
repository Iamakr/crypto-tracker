'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { searchCryptocurrencies } from '../../services/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; symbol: string; market_cap_rank: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchCryptocurrencies(query);
        // Filter to only include top 50 by market cap rank
        const filteredResults = data.coins
          .filter(coin => coin.market_cap_rank && coin.market_cap_rank <= 50)
          .sort((a, b) => (a.market_cap_rank || 999) - (b.market_cap_rank || 999))
          .slice(0, 10);
        setResults(filteredResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleFocus = () => {
    if (query.trim()) {
      setShowResults(true);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(!!e.target.value.trim());
          }}
          onFocus={handleFocus}
          placeholder="Search cryptocurrencies..."
          className="w-full px-4 py-2 pl-10 text-white bg-background-light placeholder-gray-400 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="w-4 h-4 border-2 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 overflow-hidden bg-background-light rounded-md shadow-lg">
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-5 h-5 border-2 border-t-primary-500 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-400">Searching...</span>
            </div>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={result.id} className="border-b border-background last:border-none">
                  <Link href={`/crypto/${result.id}`} onClick={() => setShowResults(false)}>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-background">
                      <div className="flex items-center">
                        <span className="w-6 text-sm text-center text-gray-400">
                          {result.market_cap_rank}
                        </span>
                        <span className="ml-3 font-medium text-white">{result.name}</span>
                        <span className="ml-2 text-sm uppercase text-gray-400">{result.symbol}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 