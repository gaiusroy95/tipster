import axios from 'axios';
import { X_API_KEY } from 'src/constants/config';
import {
  LiveMarkets,
  Market,
  MarketData,
  MarketType,
  Sport,
} from 'src/types/overtime';
import { sleep } from 'src/utils/overtime.util';

const V2_API_URL = 'https://api.overtime.io/overtime-v2';

const fetchWithRetry = async (
  url: string,
  maxRetries: number = 5,
  delay: number = 1000,
) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const response = await axios.get(url, {
        headers: {
          'x-api-key': X_API_KEY,
        },
      });
      return response.data;
    } catch (err) {
      attempts++;
      if (attempts === maxRetries) throw err;
      await sleep(delay);
    }
  }
};

export const fetchSportsWithRetry = async () => {
  const res: { [id: string]: Sport } = await fetchWithRetry(`${V2_API_URL}/sports`);
  return res;
};

export const fetchMarketTypesWithRetry = async () => {
  const res: { [id: string]: MarketType } = await fetchWithRetry(
    `${V2_API_URL}/market-types`,
  );
  return res;
};

export const fetchLiveMarketsWithRetry = async (
  networkId: number = 10,
  maxRetries: number = 3,
  delay: number = 1000,
) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const response = await axios.get<LiveMarkets>(
        `${V2_API_URL}/networks/${networkId}/live-markets`,
        {
          headers: {
            'x-api-key': X_API_KEY,
          },
        },
      );
      return response.data;
    } catch (err) {
      attempts++;
      if (attempts === maxRetries) throw err;
      await sleep(delay);
    }
  }
};

export const fetchMarketByGameId = async (
  networkId: number = 10,
  gameId: string,
) => {
  const res = await axios.get<Market>(
    `${V2_API_URL}/networks/${networkId}/markets/${encodeURIComponent(gameId)}`,
    {
      headers: {
        'x-api-key': X_API_KEY,
      },
    },
  );
  return res.data;
};

export const fetchMarkets = async (networkId: number = 10) => {
  const res = await axios.get<MarketData>(
    `${V2_API_URL}/networks/${networkId}/markets`,
    {
      headers: {
        'x-api-key': X_API_KEY,
      },
    },
  );
  return res.data;
};
