'use client';

import { useAppContext } from '../../context/AppContext';
import { AVAILABLE_CURRENCIES } from '../../services/api';
import { useState, useEffect, useRef } from 'react';

export default function CurrencySelector() {
  const { currency, setCurrency } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSelection, setActiveSelection] = useState(currency);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selected: string) => {
    if (selected === currency) {
      setIsOpen(false);
      return;
    }
    
    setActiveSelection(selected);
    
    console.log(`Changing currency from ${currency} to ${selected}`);
    
    setCurrency(selected);
    
    setIsOpen(false);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-50 flex items-center justify-between w-24 px-3 py-2 text-sm font-medium text-white 
          transition-colors duration-200 ${isOpen ? 'bg-primary-700' : 'bg-background-light hover:bg-background'}
          rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="uppercase font-medium">{currency}</span>
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
        <div 
          className="absolute right-0 z-50 w-24 mt-2 origin-top-right bg-background-light rounded-md shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {AVAILABLE_CURRENCIES.map((curr) => (
              <button
                key={curr}
                onClick={() => handleSelect(curr)}
                className={`block w-full px-4 py-2 text-sm text-left 
                  ${currency === curr ? 'text-primary-400 bg-background' : 'text-white'} 
                  hover:bg-background hover:text-primary-400
                  ${curr === activeSelection && curr !== currency ? 'bg-primary-900' : ''}`}
                role="menuitem"
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