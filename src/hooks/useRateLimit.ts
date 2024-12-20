import { useEffect, useState } from 'react';

interface RateLimitState {
  remainingAttempts: number;
  nextResetTime: number;
}

const ATTEMPTS_LIMIT = 5;
const TIME_WINDOW_MS = 1000 * 60 * 60; // 1 hour
const STORAGE_KEY = 'prediction_rate_limit';

export const useRateLimit = () => {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>(() => {
    if (typeof window === 'undefined') {
      return { remainingAttempts: ATTEMPTS_LIMIT, nextResetTime: Date.now() + TIME_WINDOW_MS };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { remainingAttempts: ATTEMPTS_LIMIT, nextResetTime: Date.now() + TIME_WINDOW_MS };
    }

    const parsed = JSON.parse(stored) as RateLimitState;
    if (Date.now() >= parsed.nextResetTime) {
      return { remainingAttempts: ATTEMPTS_LIMIT, nextResetTime: Date.now() + TIME_WINDOW_MS };
    }

    return parsed;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rateLimitState));
    }
  }, [rateLimitState]);

  const consumeAttempt = (): boolean => {
    if (Date.now() >= rateLimitState.nextResetTime) {
      const newState = {
        remainingAttempts: ATTEMPTS_LIMIT - 1,
        nextResetTime: Date.now() + TIME_WINDOW_MS,
      };
      setRateLimitState(newState);
      return true;
    }

    if (rateLimitState.remainingAttempts <= 0) {
      return false;
    }

    setRateLimitState((prev) => ({
      ...prev,
      remainingAttempts: prev.remainingAttempts - 1,
    }));
    return true;
  };

  return {
    canMakeAttempt: rateLimitState.remainingAttempts > 0,
    remainingAttempts: rateLimitState.remainingAttempts,
    consumeAttempt,
    resetTime: rateLimitState.nextResetTime,
  };
};
