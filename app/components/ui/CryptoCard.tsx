'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Cryptocurrency } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

interface CryptoCardProps {
  crypto: Cryptocurrency;
}

export default function CryptoCard({ crypto }: CryptoCardProps) {
  const { currency } = useAppContext();
  
  // Format currency amount
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  // Format percentage change with color
  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <span 
        className={`
          inline-flex items-center px-2 py-1 rounded-md text-white 
          ${isPositive ? 'bg-success/20' : 'bg-error/20'}
        `}
      >
        {isPositive ? '+' : ''}
        {percentage.toFixed(2)}%
        <svg
          className={`w-3 h-3 ml-1 ${isPositive ? 'rotate-0' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </span>
    );
  };

  return (
    <Link href={`/crypto/${crypto.id}`}>
      <div className="flex flex-col overflow-hidden transition-transform bg-background-light rounded-lg shadow-lg hover:shadow-xl hover:scale-105">
        <div className="flex items-center p-4 border-b border-background">
          <div className="relative flex-shrink-0 w-10 h-10 mr-3">
            <Image
              src={crypto.image}
              alt={crypto.name}
              fill
              sizes="40px"
              className="rounded-full object-contain"
              priority={crypto.market_cap_rank <= 10}
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-white">{crypto.name}</h3>
            <p className="text-sm uppercase text-gray-400">{crypto.symbol}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`font-mono font-medium ${crypto.price_change_percentage_24h >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(crypto.current_price)}
            </span>
            {formatPercentage(crypto.price_change_percentage_24h)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div>
            <p className="text-gray-400">Market Cap</p>
            <p className="font-mono text-white">{formatCurrency(crypto.market_cap)}</p>
          </div>
          <div>
            <p className="text-gray-400">Volume (24h)</p>
            <p className="font-mono text-white">{formatCurrency(crypto.total_volume)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
} 