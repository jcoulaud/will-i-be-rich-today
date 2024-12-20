import { FortuneResponse } from '@/types/fortune';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_RESPONSES: FortuneResponse[] = [
  {
    text: 'NO',
    createdAt: '2024-01-01T00:00:00.000Z',
    isDefault: true,
  },
  {
    text: 'Ye... NO',
    createdAt: '2024-01-01T00:00:02.000Z',
    isDefault: true,
  },
  {
    text: 'Nice try, but NO',
    createdAt: '2024-01-01T00:00:03.000Z',
    isDefault: true,
  },
  {
    text: 'Maybe next ti... NO',
    createdAt: '2024-01-01T00:00:04.000Z',
    isDefault: true,
  },
  {
    text: 'Still poor',
    createdAt: '2024-01-01T00:00:05.000Z',
    isDefault: true,
  },
];

export const useFortuneResponses = () => {
  const [responses, setResponses] = useState<FortuneResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<FortuneResponse>(DEFAULT_RESPONSES[0]);
  const [remainingResponses, setRemainingResponses] = useState<FortuneResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPrediction, setIsChangingPrediction] = useState(false);

  const fetchResponses = useCallback(async () => {
    try {
      const response = await fetch('/api/responses');
      const data = await response.json();

      if (data.responses && data.responses.length > 0) {
        // Merge new responses with existing ones, avoiding duplicates
        const mergedResponses = [...data.responses];
        setResponses(mergedResponses);

        // If this is the initial load, set the current response
        if (isLoading) {
          setCurrentResponse(mergedResponses[0]);
          setRemainingResponses(mergedResponses.slice(1));
        }
      } else {
        // If no responses, use defaults
        const shuffledDefaults = [...DEFAULT_RESPONSES].sort(() => Math.random() - 0.5);
        setResponses(shuffledDefaults);
        if (isLoading) {
          setCurrentResponse(shuffledDefaults[0]);
          setRemainingResponses(shuffledDefaults.slice(1));
        }
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
      // On error, fallback to defaults
      const shuffledDefaults = [...DEFAULT_RESPONSES].sort(() => Math.random() - 0.5);
      setResponses(shuffledDefaults);
      if (isLoading) {
        setCurrentResponse(shuffledDefaults[0]);
        setRemainingResponses(shuffledDefaults.slice(1));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const getNextResponse = useCallback(async () => {
    setIsChangingPrediction(true);
    try {
      const response = await fetch('/api/responses');
      const data = await response.json();

      if (data.responses && data.responses.length > 0) {
        // Update the responses array with fresh data
        setResponses(data.responses);

        // Filter out the current response to avoid immediate repetition
        const availableResponses = data.responses.filter(
          (r: FortuneResponse) => r.text !== currentResponse.text,
        );

        if (availableResponses.length > 0) {
          // Get a random response from the available ones
          const randomIndex = Math.floor(Math.random() * availableResponses.length);
          const nextResponse = availableResponses[randomIndex];

          // Update states
          setCurrentResponse(nextResponse);
          setRemainingResponses(
            availableResponses.filter((r: FortuneResponse) => r.text !== nextResponse.text),
          );
        } else {
          // If somehow we have no available responses (extremely rare case)
          const shuffledDefaults = [...DEFAULT_RESPONSES].sort(() => Math.random() - 0.5);
          setCurrentResponse(shuffledDefaults[0]);
          setRemainingResponses(shuffledDefaults.slice(1));
        }
      } else {
        // If no responses in KV, fall back to defaults
        const shuffledDefaults = [...DEFAULT_RESPONSES].sort(() => Math.random() - 0.5);
        setResponses(shuffledDefaults);
        setCurrentResponse(shuffledDefaults[0]);
        setRemainingResponses(shuffledDefaults.slice(1));
      }
    } catch (error) {
      console.error('Failed to fetch fresh responses:', error);
      // On error, continue with local state
      if (remainingResponses.length === 0) {
        const availableResponses = responses.filter(
          (r) => r.createdAt !== currentResponse.createdAt,
        );
        const shuffled = availableResponses.sort(() => Math.random() - 0.5);
        setCurrentResponse(shuffled[0]);
        setRemainingResponses(shuffled.slice(1));
      } else {
        const [nextResponse, ...rest] = remainingResponses;
        setCurrentResponse(nextResponse);
        setRemainingResponses(rest);
      }
    } finally {
      setIsChangingPrediction(false);
    }
  }, [currentResponse, remainingResponses, responses]);

  return {
    currentResponse,
    getNextResponse,
    responses,
    isLoading,
    isChangingPrediction,
    fetchResponses,
    setCurrentResponse,
  };
};
