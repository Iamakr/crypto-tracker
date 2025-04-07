'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Cryptocurrency } from '../../services/api';

interface SearchBarProps {
  cryptos: Cryptocurrency[];
}

export default function SearchBar({ cryptos }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Cryptocurrency[]>([]);
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

  // Local filtering of cryptocurrencies - no API calls
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    

    const timer = setTimeout(() => {
      // Filter locally from the provided cryptocurrencies list
      const filteredResults = cryptos
        .filter(crypto => {
          const searchLower = query.toLowerCase();
          return (
            crypto.name.toLowerCase().includes(searchLower) ||
            crypto.symbol.toLowerCase().includes(searchLower)
          );
        })
        .slice(0, 10);
      
      setResults(filteredResults);
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [query, cryptos]);

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
          className="w-full px-4 py-2 pl-10 text-black bg-white dark:text-white dark:bg-gray-800 placeholder-gray-400 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          style={{ color: 'currentColor' }} /* Ensures text is visible */
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

      {showResults && (query.trim() !== '' || isLoading) && (
        <div className="absolute z-4000 w-full mt-1 overflow-hidden bg-black bg-opacity-95 backdrop-blur-sm rounded-md shadow-xl border border-gray-700 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="w-5 h-5 border-2 border-t-primary-500 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-300">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li key={result.id} className="border-b border-gray-700 bg-gray-900 last:border-none">
                  <Link href={`/crypto/${result.id}`} onClick={() => setShowResults(false)}>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800">
                      <div className="flex items-center">
                        <span className="w-8 text-sm text-center text-gray-400">
                          {result.market_cap_rank || '-'}
                        </span>
                        <span className="ml-3 font-medium text-white">{result.name}</span>
                        <span className="ml-2 text-sm uppercase text-gray-400">{result.symbol}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-300">
              No matching cryptocurrencies found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 