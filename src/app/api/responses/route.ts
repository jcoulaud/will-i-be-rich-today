import { addResponse as addKVResponse, getAllResponses } from '@/lib/kv';
import { checkToxicity } from '@/services/perspectiveApi';
import { FortuneResponse } from '@/types/fortune';
import {
  containsBannedWords,
  containsSpamPatterns,
  containsSuspiciousPatterns,
} from '@/utils/contentModeration';
import { NextResponse } from 'next/server';

const MAX_LENGTH = 42;
const VALID_INPUT_REGEX = /^[\p{L}\p{N}\p{Emoji}\s!#%?.,:'"\-$_]+$/u;

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
        {
          error: 'Only letters, numbers, emojis, and basic punctuation (!#%?.,:\'"$_-) are allowed',
        },
        { status: 400 },
      );
    }

    // Check for banned words
    if (containsBannedWords(trimmedText)) {
      return NextResponse.json(
        { error: 'Your prediction contains inappropriate language' },
        { status: 400 },
      );
    }

    // Check for spam patterns
    if (containsSpamPatterns(trimmedText)) {
      return NextResponse.json({ error: 'Please avoid repetitive content' }, { status: 400 });
    }

    // Check for suspicious patterns
    if (containsSuspiciousPatterns(trimmedText)) {
      return NextResponse.json(
        { error: 'Your prediction contains suspicious patterns' },
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
    if (process.env.PERSPECTIVE_API_KEY) {
      try {
        const toxicityCheck = await checkToxicity(trimmedText);
        if (!toxicityCheck.success) {
          return NextResponse.json(
            { error: toxicityCheck.error || 'Content moderation failed' },
            { status: 400 },
          );
        }
      } catch (error) {
        console.error('Error during toxicity check:', error);
        return NextResponse.json({ error: 'Content moderation check failed' }, { status: 400 });
      }
    }

    // Additional validation for common patterns of inappropriate content
    const containsRepeatedPunctuation = /[!?.,]{3,}/.test(trimmedText);
    const containsAllCaps = /^[A-Z\s!?.,]+$/.test(trimmedText) && trimmedText.length > 10;
    const containsURLs = /https?:\/\/|www\./i.test(trimmedText);
    const containsEmailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmedText);
    const containsPhonePattern = /[\d-+()]{10,}/.test(trimmedText);
    const containsExcessiveSpaces = /\s{3,}/.test(trimmedText);

    if (containsRepeatedPunctuation) {
      return NextResponse.json({ error: 'Please avoid excessive punctuation' }, { status: 400 });
    }

    if (containsAllCaps) {
      return NextResponse.json(
        { error: 'Please avoid using all capital letters' },
        { status: 400 },
      );
    }

    if (containsURLs) {
      return NextResponse.json({ error: 'URLs are not allowed in predictions' }, { status: 400 });
    }

    if (containsEmailPattern || containsPhonePattern) {
      return NextResponse.json(
        { error: 'Personal contact information is not allowed' },
        { status: 400 },
      );
    }

    if (containsExcessiveSpaces) {
      return NextResponse.json({ error: 'Please avoid excessive spacing' }, { status: 400 });
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
