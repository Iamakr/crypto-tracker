'use client';

import { useAppContext } from '../../context/AppContext';
import { AVAILABLE_CURRENCIES } from '../../services/api';
import { useState } from 'react';

export default function CurrencySelector() {
  const { currency, setCurrency } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selected: string) => {
    setCurrency(selected);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-24 px-3 py-2 text-sm font-medium text-white bg-background-light rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className="uppercase">{currency}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-24 mt-2 origin-top-right bg-background-light rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {AVAILABLE_CURRENCIES.map((curr) => (
              <button
                key={curr}
                onClick={() => handleSelect(curr)}
                className={`block w-full px-4 py-2 text-sm text-left ${
                  currency === curr ? 'text-primary-400' : 'text-white'
                } hover:bg-background`}
              >
                <span className="uppercase">{curr}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 