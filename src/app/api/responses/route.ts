import { addResponse as addKVResponse, getAllResponses } from '@/lib/kv';
import { checkToxicity } from '@/services/perspectiveApi';
import { FortuneResponse } from '@/types/fortune';
import { NextResponse } from 'next/server';

const MAX_LENGTH = 30;
const VALID_INPUT_REGEX = /^[\p{L}\p{N}\p{Emoji}\s]*$/u;

export async function GET() {
  try {
    const responses = await getAllResponses();
    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid response text' }, { status: 400 });
    }

    const trimmedText = text.trim();

    if (trimmedText.length > MAX_LENGTH) {
      return NextResponse.json({ error: 'Response too long' }, { status: 400 });
    }

    if (!VALID_INPUT_REGEX.test(trimmedText)) {
      return NextResponse.json(
        { error: 'Only letters, numbers, and emojis are allowed' },
        { status: 400 },
      );
    }

    // Check if response already exists
    const existingResponses = await getAllResponses();
    const isDuplicate = existingResponses.some(
      (response) => response.text.toLowerCase() === trimmedText.toLowerCase(),
    );

    if (isDuplicate) {
      return NextResponse.json({ success: true, isDuplicate: true });
    }

    // Check toxicity before saving
    const toxicityCheck = await checkToxicity(trimmedText);

    if (!toxicityCheck.success) {
      return NextResponse.json(
        { error: toxicityCheck.error || 'Failed to check content' },
        { status: 500 },
      );
    }

    const newResponse: FortuneResponse = {
      text: trimmedText,
      createdAt: new Date().toISOString(),
    };

    const success = await addKVResponse(newResponse);

    if (!success) {
      return NextResponse.json({ error: 'Failed to add response' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding response:', error);
    return NextResponse.json({ error: 'Failed to add response' }, { status: 500 });
  }
}
