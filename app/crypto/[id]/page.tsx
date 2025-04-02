'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CryptocurrencyDetailed, 
  Cryptocurrency,
  getCryptocurrencyDetails
} from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import CurrencySelector from '../../components/ui/CurrencySelector';

/**
 * Cryptocurrency Detail Page
 * Displays comprehensive information about a specific cryptocurrency
 */
export default function CryptoDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { currency, addToRecentlyViewed } = useAppContext();
  const [crypto, setCrypto] = useState<CryptocurrencyDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ensure id is properly extracted from params
  const cryptoId = useMemo(() => Array.isArray(id) ? id[0] : id, [id]);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCryptoDetails() {
      if (!cryptoId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const details = await getCryptocurrencyDetails(cryptoId, currency);
        
        if (isMounted) {
          setCrypto(details);
          
          const currentPrice = details.market_data.current_price[currency] || 0;
          const marketCap = details.market_data.market_cap[currency] || 0;
          const totalVolume = details.market_data.total_volume[currency] || 0;

          // Create simplified version for recently viewed
          const simplifiedCrypto: Cryptocurrency = {
            id: details.id,
            name: details.name,
            symbol: details.symbol,
            image: details.image.large,
            current_price: currentPrice,
            market_cap: marketCap,
            market_cap_rank: 0,
            fully_diluted_valuation: null,
            total_volume: totalVolume,
            high_24h: 0,
            low_24h: 0,
            price_change_24h: 0,
            price_change_percentage_24h: details.market_data.price_change_percentage_24h || 0,
            market_cap_change_24h: 0,
            market_cap_change_percentage_24h: 0,
            circulating_supply: details.market_data.circulating_supply || 0,
            total_supply: details.market_data.total_supply,
            max_supply: details.market_data.max_supply,
            ath: 0,
            ath_change_percentage: 0,
            ath_date: '',
            atl: 0,
            atl_change_percentage: 0,
            atl_date: '',
            last_updated: ''
          };
          
          addToRecentlyViewed(simplifiedCrypto);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error fetching details for ${cryptoId}:`, err);
          setError('Failed to load cryptocurrency details. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCryptoDetails();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [cryptoId, currency, addToRecentlyViewed]);

  /**
   * Formats a number as currency with appropriate decimal places
   */
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  /**
   * Formats a percentage value with appropriate styling
   */
  const formatPercentage = (percentage: number | undefined) => {
    if (percentage === undefined) return 'N/A';
    
    const isPositive = percentage >= 0;
    return (
      <span className={`inline-flex items-center ${isPositive ? 'text-success' : 'text-error'}`}>
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

  // Loading state UI
  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-8 text-white bg-background sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="w-48 h-10 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="p-6 bg-background-light rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 mr-4 bg-gray-700 rounded-full animate-pulse"></div>
              <div>
                <div className="w-48 h-8 mb-2 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex-grow"></div>
              <div className="w-36 h-12 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4 bg-background rounded-lg">
                  <div className="w-24 h-4 mb-2 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-full h-8 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error || !crypto) {
    return (
      <div className="min-h-screen px-4 py-8 text-white bg-background sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 text-center bg-error bg-opacity-20 rounded-lg">
            <h2 className="mb-4 text-xl font-semibold">Error</h2>
            <p>{error || 'Failed to load cryptocurrency details.'}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 mt-4 text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content UI
  return (
    <div className="min-h-screen px-4 py-8 text-white bg-background sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-background-light rounded-md hover:bg-primary-600">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </Link>
          <CurrencySelector />
        </div>

        <div className="p-6 bg-background-light rounded-lg shadow-lg">
          {/* Header with image, name and price */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="relative w-16 h-16 mr-4">
                <Image
                  src={crypto.image?.large || ''}
                  alt={crypto.name}
                  fill
                  sizes="64px"
                  className="rounded-full object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{crypto.name}</h1>
                <p className="text-lg uppercase text-gray-400">{crypto.symbol}</p>
              </div>
            </div>
            <div className="flex-grow"></div>
            <div className="text-right">
              <div className="text-3xl font-mono font-semibold text-white">
                {formatCurrency(crypto.market_data?.current_price?.[currency])}
              </div>
              <div className="text-lg">
                {formatPercentage(crypto.market_data?.price_change_percentage_24h)}
              </div>
            </div>
          </div>

          {/* Market data grid */}
          <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
            <div className="p-4 bg-background rounded-lg">
              <h3 className="mb-2 text-sm font-medium text-gray-400">Market Cap</h3>
              <p className="text-xl font-mono text-white">
                {formatCurrency(crypto.market_data?.market_cap?.[currency])}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h3 className="mb-2 text-sm font-medium text-gray-400">Volume (24h)</h3>
              <p className="text-xl font-mono text-white">
                {formatCurrency(crypto.market_data?.total_volume?.[currency])}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h3 className="mb-2 text-sm font-medium text-gray-400">Circulating Supply</h3>
              <p className="text-xl font-mono text-white">
                {crypto.market_data?.circulating_supply
                  ? `${crypto.market_data.circulating_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}`
                  : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h3 className="mb-2 text-sm font-medium text-gray-400">Total Supply</h3>
              <p className="text-xl font-mono text-white">
                {crypto.market_data?.total_supply
                  ? `${crypto.market_data.total_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}`
                  : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h3 className="mb-2 text-sm font-medium text-gray-400">All-Time High</h3>
              <p className="text-xl font-mono text-white">
                {formatCurrency(crypto.market_data?.ath?.[currency])}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h3 className="mb-2 text-sm font-medium text-gray-400">All-Time Low</h3>
              <p className="text-xl font-mono text-white">
                {formatCurrency(crypto.market_data?.atl?.[currency])}
              </p>
            </div>
          </div>

          {/* Description section */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-white">About {crypto.name}</h2>
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: crypto.description?.en || 'No description available.',
              }}
            />
          </div>

          {/* External links */}
          {crypto.links && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-white">Links</h2>
              <div className="flex flex-wrap gap-3">
                {crypto.links.homepage?.[0] && (
                  <a
                    href={crypto.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-white transition-colors bg-background rounded-md hover:bg-primary-600"
                  >
                    Website
                  </a>
                )}
                {crypto.links.blockchain_site?.[0] && (
                  <a
                    href={crypto.links.blockchain_site[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-white transition-colors bg-background rounded-md hover:bg-primary-600"
                  >
                    Explorer
                  </a>
                )}
                {crypto.links.subreddit_url && (
                  <a
                    href={crypto.links.subreddit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-white transition-colors bg-background rounded-md hover:bg-primary-600"
                  >
                    Reddit
                  </a>
                )}
                {crypto.links.twitter_screen_name && (
                  <a
                    href={`https://twitter.com/${crypto.links.twitter_screen_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-white transition-colors bg-background rounded-md hover:bg-primary-600"
                  >
                    Twitter
                  </a>
                )}
                {crypto.links.repos_url?.github?.[0] && (
                  <a
                    href={crypto.links.repos_url.github[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-white transition-colors bg-background rounded-md hover:bg-primary-600"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 