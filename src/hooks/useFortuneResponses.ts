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

  const fetchResponses = useCallback(async () => {
    try {
      const response = await fetch('/api/responses');
      const data = await response.json();

      if (data.responses && data.responses.length > 0) {
        setResponses(data.responses);
        setCurrentResponse(data.responses[0]);
        setRemainingResponses(data.responses.slice(1));
      } else {
        // If no responses, use defaults
        const shuffledDefaults = [...DEFAULT_RESPONSES].sort(() => Math.random() - 0.5);
        setResponses(shuffledDefaults);
        setCurrentResponse(shuffledDefaults[0]);
        setRemainingResponses(shuffledDefaults.slice(1));
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
      // On error, fallback to defaults
      const shuffledDefaults = [...DEFAULT_RESPONSES].sort(() => Math.random() - 0.5);
      setResponses(shuffledDefaults);
      setCurrentResponse(shuffledDefaults[0]);
      setRemainingResponses(shuffledDefaults.slice(1));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const addResponse = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (data.success) {
          await fetchResponses();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to add response:', error);
        return false;
      }
    },
    [fetchResponses],
  );

  const getNextResponse = useCallback(() => {
    if (remainingResponses.length === 0) {
      // If no remaining responses, shuffle all responses except current
      const availableResponses =
        responses.length > 1
          ? responses.filter((r) => r.createdAt !== currentResponse.createdAt)
          : DEFAULT_RESPONSES;

      const shuffled = availableResponses.sort(() => Math.random() - 0.5);
      setCurrentResponse(shuffled[0]);
      setRemainingResponses(shuffled.slice(1));
    } else {
      const [nextResponse, ...rest] = remainingResponses;
      setCurrentResponse(nextResponse);
      setRemainingResponses(rest);
    }
  }, [remainingResponses, responses, currentResponse]);

  return {
    currentResponse,
    addResponse,
    getNextResponse,
    responses,
    isLoading,
    fetchResponses,
    setCurrentResponse,
  };
};
