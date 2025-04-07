'use client';

import { useAppContext } from '../../context/AppContext';
import Link from 'next/link';
import Image from 'next/image';
import { Cryptocurrency } from '../../services/api';

export default function RecentlyViewed() {
  const { recentlyViewed, currency, isUpdatingPrices } = useAppContext();

  if (recentlyViewed.length === 0) {
    return null;
  }

  // Format currency amount
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };
  
  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${isPositive ? 'bg-success/20' : 'bg-error/20'} text-white`}>
        {isPositive ? '+' : ''}{percentage.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Recently Viewed</h2>
        {isUpdatingPrices && (
          <div className="flex items-center ml-3">
            <div className="w-4 h-4 mr-2 border-2 border-t-primary-500 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400">Updating prices...</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {recentlyViewed.map((crypto) => (
          <Link key={crypto.id} href={`/crypto/${crypto.id}`}>
            <div className="flex items-center p-3 transition-colors bg-background-light rounded-lg hover:bg-background">
              <div className="relative flex-shrink-0 w-8 h-8 mr-3">
                <Image
                  src={crypto.image}
                  alt={crypto.name}
                  fill
                  sizes="32px"
                  className="rounded-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-medium text-white truncate">{crypto.name}</h3>
                <div className="flex items-center space-x-2">
                  <p className={`text-sm ${isUpdatingPrices ? 'text-primary-400' : crypto.price_change_percentage_24h >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(crypto.current_price)}
                  </p>
                  {crypto.price_change_percentage_24h !== undefined && 
                    formatPercentage(crypto.price_change_percentage_24h)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 