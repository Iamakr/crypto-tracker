import axios from 'axios';

/**
 * API service module for cryptocurrency data
 */

// Base URL for CoinGecko API
const API_URL = 'https://api.coingecko.com/api/v3';

// Available currency options for the application
export const AVAILABLE_CURRENCIES = ['usd', 'eur', 'gbp', 'chf', 'inr'];

// API Request Configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

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
  try {
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
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
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
  console.log('Fetching details for:', id);
  try {
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
  } catch (error) {
    console.error(`Error fetching details for ${id}:`, error);
    throw error;
  }
}

/**
 * Searches for cryptocurrencies by query string
 */
export async function searchCryptocurrencies(
  query: string
): Promise<{ coins: Array<{ id: string; name: string; symbol: string; market_cap_rank: number }> }> {
  try {
    const response = await axiosInstance.get('/search', {
      params: {
        query,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error);
    throw error;
  }
} 