'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  
  const cryptoId = useMemo(() => 
    Array.isArray(id) ? id[0] : id, 
    [id]
  );

  const isFetchingRef = useRef(false);

  const fetchCryptoData = async (isMounted = true) => {
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping duplicate request');
      return;
    }
    
    isFetchingRef.current = true;
    
    if (isMounted) {
      setCrypto(null);
      setError(null);
      setIsLoading(true);
    }
    
    try {
      if (!cryptoId) {
        throw new Error('Invalid cryptocurrency ID');
      }
      
      console.log(`Fetching details for ${cryptoId} in ${currency}`);
      const details = await getCryptocurrencyDetails(cryptoId, currency);
      
      if (!isMounted) return;
      
      setCrypto(details);
      
      const simplifiedCrypto: Cryptocurrency = {
        id: details.id,
        name: details.name,
        symbol: details.symbol,
        image: details.image.large,
        current_price: details.market_data?.current_price?.[currency] || 0,
        market_cap: details.market_data?.market_cap?.[currency] || 0,
        market_cap_rank: 0,
        fully_diluted_valuation: null,
        total_volume: details.market_data?.total_volume?.[currency] || 0,
        high_24h: 0,
        low_24h: 0,
        price_change_24h: 0,
        price_change_percentage_24h: details.market_data?.price_change_percentage_24h || 0,
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: 0,
        circulating_supply: details.market_data?.circulating_supply || 0,
        total_supply: details.market_data?.total_supply,
        max_supply: details.market_data?.max_supply,
        ath: 0,
        ath_change_percentage: 0,
        ath_date: '',
        atl: 0,
        atl_change_percentage: 0,
        atl_date: '',
        last_updated: ''
      };
      
      if (isMounted) {
        setTimeout(() => {
          try {
            addToRecentlyViewed(simplifiedCrypto);
          } catch (err) {
            console.error('Error adding to recently viewed:', err);
          }
        }, 0);
      }
    } catch (err: any) {
      if (!isMounted) return;
      
      console.error(`Error fetching details for ${cryptoId}:`, err);
      
      if (err.message.includes('Network error')) {
        setError('Network error: Unable to connect to cryptocurrency data provider. Please check your internet connection and try again.');
      } else if (err.message.includes('Rate limit exceeded')) {
        setError('Rate limit exceeded: Too many requests to the cryptocurrency API. Please try again in a few minutes.');
      } else if (err.message.includes('not found')) {
        setError(`Cryptocurrency with ID '${cryptoId}' not found. It may have been delisted or the ID is incorrect.`);
      } else {
        setError(err.message || 'Failed to load cryptocurrency details. Please try again later.');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
      
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    fetchCryptoData(isMounted);
    
    return () => {
      isMounted = false;
    };
  }, [cryptoId, currency]);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const formatPercentage = (percentage: number | undefined) => {
    if (percentage === undefined) return 'N/A';
    
    const isPositive = percentage >= 0;
    return (
      <span className={`
        inline-flex items-center px-2 py-1 rounded-md text-white 
        ${isPositive ? 'bg-success/20' : 'bg-error/20'}
      `}>
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

  if (isLoading) {
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

  if (error || !crypto) {
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
          </div>
          <div className="p-6 bg-error bg-opacity-10 rounded-lg">
            <div className="text-center">
              <h2 className="mb-4 text-xl font-semibold">Error</h2>
              <p className="mb-6 text-gray-300">{error || 'Failed to load cryptocurrency details.'}</p>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
                <button
                  onClick={() => fetchCryptoData()}
                  className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 text-white bg-background-light rounded-md hover:bg-background"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
          {error && error.includes('Network error') && (
            <div className="mt-6 p-6 bg-background-light rounded-lg">
              <h3 className="mb-4 text-lg font-medium">You're currently offline</h3>
              <p className="mb-4 text-gray-300">
                It appears you're having connectivity issues. 
                While we try to reconnect, you can browse your previously viewed cryptocurrencies:
              </p>
              <Link href="/">
                <button className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700">
                  View Recent Cryptocurrencies
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
  
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
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="relative w-16 h-16 mr-4">
                {crypto.image?.large && (
                  <Image
                    src={crypto.image.large}
                    alt={crypto.name}
                    fill
                    sizes="64px"
                    className="rounded-full object-contain"
                    priority
                  />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{crypto.name}</h1>
                <p className="text-lg uppercase text-gray-400">{crypto.symbol}</p>
              </div>
            </div>
            <div className="flex-grow"></div>
            <div className="text-right">
              <div className={`text-3xl font-mono font-semibold ${crypto.market_data?.price_change_percentage_24h && crypto.market_data.price_change_percentage_24h >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(crypto.market_data?.current_price?.[currency])}
              </div>
              <div className="text-lg mt-2">
                {formatPercentage(crypto.market_data?.price_change_percentage_24h)}
              </div>
            </div>
          </div>

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

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-white">About {crypto.name}</h2>
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: crypto.description?.en || 'No description available.',
              }}
            />
          </div>

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