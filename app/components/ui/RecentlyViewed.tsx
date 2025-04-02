'use client';

import { useAppContext } from '../../context/AppContext';
import Link from 'next/link';
import Image from 'next/image';
import { Cryptocurrency } from '../../services/api';

export default function RecentlyViewed() {
  const { recentlyViewed, currency } = useAppContext();

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

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-white">Recently Viewed</h2>
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
                <p className="text-sm text-gray-400">{formatCurrency(crypto.current_price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 