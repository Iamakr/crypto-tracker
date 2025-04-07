import axios from 'axios';

/**
 * API service module for cryptocurrency data
 */

// Base URL for CoinGecko API
const API_URL = 'https://api.coingecko.com/api/v3';

// Available currency options for the application
export const AVAILABLE_CURRENCIES = ['usd', 'eur', 'gbp', 'chf', 'inr'];

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface Cache {
  [key: string]: CacheItem<any>;
}

const cache: Cache = {};
const CACHE_DURATION = 5 * 60 * 1000;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for rate limiting
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit hit with CoinGecko API. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Function to check if cache is valid
function isCacheValid<T>(key: string): boolean {
  const item = cache[key];
  if (!item) return false;
  
  const now = Date.now();
  return now - item.timestamp < CACHE_DURATION;
}

// Function to get data from cache
function getFromCache<T>(key: string): T | null {
  if (isCacheValid(key)) {
    console.log(`Cache hit for ${key}`);
    return cache[key].data;
  }
  console.log(`Cache miss for ${key}`);
  return null;
}

// Function to set data in cache
function setInCache<T>(key: string, data: T): void {
  console.log(`Caching data for ${key}`);
  cache[key] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Generic function to make API calls with retry logic
 */
async function fetchWithRetry<T>(
  apiCall: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // If we have no more retries, throw the error
    if (retries <= 0) {
      throw error;
    }
    
    // Determine if this is a network error or a rate limit error where retry makes sense
    const isNetworkError = !error.response && error.message === 'Network Error';
    const isRateLimitError = error.response?.status === 429;
    
    if (isNetworkError || isRateLimitError) {
      console.log(`API call failed with ${error.message}. Retrying (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      
      const delay = RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      await sleep(delay);
      
      return fetchWithRetry(apiCall, retries - 1);
    }
    
    throw error;
  }
}

// Types definition for cryptocurrency data
export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

// Interface for detailed cryptocurrency data
export interface CryptocurrencyDetailed {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  categories: string[];
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: Record<string, number>;
    atl: Record<string, number>;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
  };
}

/**
 * Fetches top cryptocurrencies by market cap
 */
export async function getTopCryptocurrencies(
  currency: string = 'usd',
  limit: number = 50
): Promise<Cryptocurrency[]> {
  const cacheKey = `topCryptos-${currency}-${limit}`;
  
  const cachedData = getFromCache<Cryptocurrency[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached data for top cryptocurrencies');
    return cachedData;
  }
  
  try {
    console.log(`Fetching top cryptocurrencies in ${currency}...`);
    const data = await fetchWithRetry(async () => {
      const response = await axiosInstance.get('/coins/markets', {
        params: {
          vs_currency: currency,
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
        },
      });
      return response.data;
    });
    
    setInCache(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Error fetching cryptocurrencies:', error);
    
    if (!error.response && error.message === 'Network Error') {
      throw new Error('Network error when connecting to CoinGecko API. Please check your internet connection and try again.');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded on CoinGecko API. Please try again in a few minutes.');
    }
    
    throw error;
  }
}

/**
 * Fetches detailed information for a specific cryptocurrency
 */
export async function getCryptocurrencyDetails(
  id: string,
  currency: string = 'usd'
): Promise<CryptocurrencyDetailed> {
  if (!id) {
    throw new Error('Cryptocurrency ID is required');
  }
  
  const cacheKey = `cryptoDetails-${id}-${currency}`;
  
  const cachedData = getFromCache<CryptocurrencyDetailed>(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for ${id}`);
    return cachedData;
  }
  
  console.log('Fetching details for:', id);
  try {
    const data = await fetchWithRetry(async () => {
      const response = await axiosInstance.get(`/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
        },
      });
      return response.data;
    });
    
    setInCache(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error(`Error fetching details for ${id}:`, error);
    
    if (!error.response && error.message === 'Network Error') {
      throw new Error('Network error when connecting to CoinGecko API. Please check your internet connection and try again.');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded on CoinGecko API. Please try again in a few minutes.');
    } else if (error.response?.status === 404) {
      throw new Error(`Cryptocurrency with ID '${id}' not found. Please check the ID and try again.`);
    }
    
    throw error;
  }
}

/**
 * Searches for cryptocurrencies by query string
 */
export async function searchCryptocurrencies(
  query: string
): Promise<{ coins: Array<{ id: string; name: string; symbol: string; market_cap_rank: number }> }> {
  if (!query || query.trim() === '') {
    return { coins: [] };
  }
  
  const cacheKey = `search-${query.toLowerCase()}`;
  
  const cachedData = getFromCache<{ coins: Array<{ id: string; name: string; symbol: string; market_cap_rank: number }> }>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const data = await fetchWithRetry(async () => {
      const response = await axiosInstance.get('/search', {
        params: {
          query,
        },
      });
      return response.data;
    });
    
    setInCache(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Error searching cryptocurrencies:', error);
    
    if (!error.response && error.message === 'Network Error') {
      throw new Error('Network error when connecting to CoinGecko API. Please check your internet connection and try again.');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded on CoinGecko API. Please try again in a few minutes.');
    }
    
    throw error;
  }
} 