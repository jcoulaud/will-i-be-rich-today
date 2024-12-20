import { FortuneResponse } from '@/types/fortune';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const RESPONSES_KEY = 'fortune_responses';

export async function getAllResponses(): Promise<FortuneResponse[]> {
  const responses = await redis.get<FortuneResponse[]>(RESPONSES_KEY);
  return responses || [];
}

export async function addResponse(response: FortuneResponse): Promise<boolean> {
  try {
    const responses = await getAllResponses();
    responses.unshift(response);
    await redis.set(RESPONSES_KEY, responses);
    return true;
  } catch (error) {
    console.error('Error adding response:', error);
    return false;
  }
}

export async function initializeResponses(): Promise<void> {
  const responses = await getAllResponses();
  if (responses.length === 0) {
    await redis.set(RESPONSES_KEY, []);
  }
}
