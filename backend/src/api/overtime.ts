import axios from 'axios';
import { X_API_KEY } from '../constants/config';
import {
  GameInfo,
  LiveMarkets,
  LiveScore,
  Market,
  MarketData,
  MarketType,
  Sport,
} from '../types/overtime';
import { sleep } from '../utils/overtime.util';

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

function parseGameInfoPayload(
  gameId: string,
  payload: Record<string, GameInfo> | GameInfo | undefined,
): GameInfo | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  if ('teams' in payload) return payload as GameInfo;
  return (payload as Record<string, GameInfo>)[gameId];
}

function scoresFromGameInfo(info: GameInfo | undefined): {
  homeScore: number;
  awayScore: number;
} | null {
  const homeTeam = info?.teams?.find((team) => team.isHome);
  const awayTeam = info?.teams?.find((team) => !team.isHome);
  if (
    homeTeam &&
    awayTeam &&
    Number.isFinite(homeTeam.score) &&
    Number.isFinite(awayTeam.score)
  ) {
    return { homeScore: homeTeam.score, awayScore: awayTeam.score };
  }
  return null;
}

export async function fetchGameSettlementInfo(
  gameId: string,
  maxRetries: number = 2,
  delay: number = 500,
): Promise<{
  isGameFinished: boolean;
  homeScore: number;
  awayScore: number;
} | null> {
  if (!gameId) return null;

  const encodedGameId = encodeURIComponent(gameId);
  const headers = { 'x-api-key': X_API_KEY };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const gameInfoResponse = await axios.get<Record<string, GameInfo> | GameInfo>(
        `${V2_API_URL}/games-info/${encodedGameId}`,
        {
          headers,
          timeout: 8000,
          validateStatus: (status) => status === 200 || status === 404,
        },
      );

      if (gameInfoResponse.status === 404) return null;

      const info = parseGameInfoPayload(gameId, gameInfoResponse.data);
      const scores = scoresFromGameInfo(info);
      if (!info || !scores) return null;

      return {
        isGameFinished: info.isGameFinished,
        homeScore: scores.homeScore,
        awayScore: scores.awayScore,
      };
    } catch (error) {
      if (attempt === maxRetries - 1) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`[overtime] fetchGameSettlementInfo ${gameId}: ${message}`);
        return null;
      }
      await sleep(delay);
    }
  }

  return null;
}

export async function fetchGameScoresWithRetry(
  gameId: string,
  maxRetries: number = 2,
  delay: number = 500,
): Promise<{ homeScore: number; awayScore: number } | null> {
  if (!gameId) return null;

  const encodedGameId = encodeURIComponent(gameId);
  const headers = { 'x-api-key': X_API_KEY };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const liveScoreResponse = await axios.get<LiveScore>(
        `${V2_API_URL}/live-scores/${encodedGameId}`,
        {
          headers,
          timeout: 8000,
          validateStatus: (status) => status === 200 || status === 404,
        },
      );

      if (
        liveScoreResponse.status === 200 &&
        liveScoreResponse.data?.homeScore != null &&
        liveScoreResponse.data?.awayScore != null &&
        Number.isFinite(liveScoreResponse.data.homeScore) &&
        Number.isFinite(liveScoreResponse.data.awayScore)
      ) {
        return {
          homeScore: liveScoreResponse.data.homeScore,
          awayScore: liveScoreResponse.data.awayScore,
        };
      }

      const gameInfoResponse = await axios.get<Record<string, GameInfo> | GameInfo>(
        `${V2_API_URL}/games-info/${encodedGameId}`,
        {
          headers,
          timeout: 8000,
          validateStatus: (status) => status === 200 || status === 404,
        },
      );

      if (gameInfoResponse.status === 404) return null;

      const info = parseGameInfoPayload(gameId, gameInfoResponse.data);
      return scoresFromGameInfo(info);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`[overtime] fetchGameScores ${gameId}: ${message}`);
        return null;
      }
      await sleep(delay);
    }
  }

  return null;
}
