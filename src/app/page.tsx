'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { useFortuneResponses } from '@/hooks/useFortuneResponses';
import { useRateLimit } from '@/hooks/useRateLimit';
import { debounce } from '@/utils/debounce';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const MAX_LENGTH = 42;
const MIN_LENGTH = 3;
const VALID_INPUT_REGEX = /^[\p{L}\p{N}\p{Emoji}\s!#%?.,:'"\-$_]+$/u;
const CONTRACT_ADDRESS = 'xxxxxxxxxxxxxxxxxxxxx';

const FortuneTeller = memo(() => {
  const {
    currentResponse,
    getNextResponse,
    isLoading,
    fetchResponses,
    setCurrentResponse,
    isChangingPrediction,
  } = useFortuneResponses();

  const { canMakeAttempt, consumeAttempt, resetTime } = useRateLimit();
  const timeLeft = useCountdown(resetTime);
  const [newResponse, setNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const MIN_SUBMISSION_INTERVAL = 10000; // 10 seconds between submissions

  const validateInput = (input: string): { isValid: boolean; error?: string } => {
    if (input.length < MIN_LENGTH) {
      return { isValid: false, error: `Prediction must be at least ${MIN_LENGTH} characters long` };
    }

    if (!VALID_INPUT_REGEX.test(input)) {
      return {
        isValid: false,
        error: 'Only letters, numbers, emojis, and basic punctuation are allowed',
      };
    }

    // Check for repetitive characters
    if (/(.)\1{4,}/.test(input)) {
      return { isValid: false, error: 'Too many repeated characters' };
    }

    // Check for excessive emojis
    const emojiCount = (input.match(/\p{Emoji}/gu) || []).length;
    if (emojiCount > 5) {
      return { isValid: false, error: 'Too many emojis (maximum 5)' };
    }

    return { isValid: true };
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_LENGTH);
    if (value === '' || VALID_INPUT_REGEX.test(value)) {
      setNewResponse(value);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const timeSinceLastSubmission = Date.now() - lastSubmissionTime;
    if (timeSinceLastSubmission < MIN_SUBMISSION_INTERVAL) {
      toast.error(
        `Please wait ${Math.ceil(
          (MIN_SUBMISSION_INTERVAL - timeSinceLastSubmission) / 1000,
        )} seconds before submitting again`,
      );
      return;
    }

    if (!canMakeAttempt) {
      toast.error(`Rate limit reached. Please try again in ${timeLeft}`);
      return;
    }

    const trimmedResponse = newResponse.trim();
    if (!trimmedResponse) {
      toast.error('Please enter a prediction');
      return;
    }

    const validation = validateInput(trimmedResponse);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!consumeAttempt()) {
        toast.error(`Rate limit reached. Please try again in ${timeLeft}`);
        return;
      }

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmedResponse }),
      });

      const data = await response.json();

      if (data.success) {
        setNewResponse('');
        setLastSubmissionTime(Date.now());

        if (!data.isDuplicate) {
          const newPrediction = { text: trimmedResponse, createdAt: new Date().toISOString() };
          setCurrentResponse(newPrediction);
          await fetchResponses();
        }

        toast.success(
          data.isDuplicate ? 'This response already exists! 🎯' : 'Response added successfully! 🎉',
        );
      } else {
        toast.error(data.error || 'Failed to add response. Please try again.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    newResponse,
    fetchResponses,
    setCurrentResponse,
    canMakeAttempt,
    consumeAttempt,
    timeLeft,
    lastSubmissionTime,
  ]);

  const debouncedSubmitRef = useRef(
    debounce(() => {
      handleSubmit();
    }, 300),
  );

  useEffect(() => {
    debouncedSubmitRef.current = debounce(() => {
      handleSubmit();
    }, 300);
  }, [handleSubmit]);

  useEffect(() => {
    return () => {
      debouncedSubmitRef.current.cancel();
    };
  }, []);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex items-center justify-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex flex-col items-center justify-center p-4 text-center'>
      <Toaster position='top-center' />

      <div className='mb-8 md:fixed md:top-10 md:left-0 md:right-0 md:mb-0'>
        <a
          href={`#`}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-block px-4 py-2 rounded-full border border-purple-400 bg-purple-900/50 text-sm text-purple-200 hover:text-purple-400 hover:border-purple-300 transition-colors backdrop-blur-sm'>
          CA: {CONTRACT_ADDRESS}
        </a>
      </div>

      <div className='md:mt-16'>
        <h1 className='text-4xl md:text-5xl font-bold mb-4 animate-bounce'>
          Will I Be Rich Today? 🤑
        </h1>
      </div>

      <p className='text-lg md:text-xl text-purple-300 mb-8 max-w-2xl mx-auto px-4'>
        Community-driven fortune teller for memecoin traders. The red predictions you see are all
        from the community - add yours and see what others think about your future wealth! 🤑
      </p>

      <div className='text-5xl md:text-6xl lg:text-9xl font-extrabold mb-2 text-red-500 animate-pulse'>
        {isChangingPrediction ? (
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500'></div>
        ) : (
          currentResponse.text
        )}
      </div>

      <button
        className='mt-12 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-300 transform hover:scale-105'
        onClick={getNextResponse}
        disabled={isChangingPrediction}>
        {isChangingPrediction ? 'Loading...' : 'Get another prediction'}
      </button>

      <div className='mt-16 w-full max-w-md mb-16'>
        <div className='relative'>
          <input
            type='text'
            value={newResponse}
            onChange={handleInputChange}
            placeholder='Add your own prediction...'
            className='w-full px-4 py-2 rounded-lg bg-purple-800 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500'
            maxLength={MAX_LENGTH}
          />
          <span className='absolute right-2 top-2 text-xs text-purple-300'>
            {newResponse.length}/{MAX_LENGTH}
          </span>
        </div>

        <button
          onClick={debouncedSubmitRef.current}
          disabled={isSubmitting || !canMakeAttempt}
          className='mt-4 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'>
          {isSubmitting
            ? 'Adding...'
            : !canMakeAttempt
            ? `Try again in ${timeLeft}`
            : 'Add Prediction'}
        </button>
        <p className='text-xs text-purple-300 mt-2 text-center'>
          Limited to 5 predictions per hour
        </p>
      </div>

      <footer className='w-full text-center text-purple-300 text-sm space-y-2 mb-16'>
        <div>
          <a
            href='https://x.com/wibrichtoday'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-purple-400 transition-colors'>
            Follow us on X (Twitter)
          </a>
        </div>
        <div>
          Made by{' '}
          <a
            href='https://x.com/0xBapak'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-purple-400 transition-colors'>
            @0xBapak
          </a>
        </div>
      </footer>
    </div>
  );
});

FortuneTeller.displayName = 'FortuneTeller';

export default FortuneTeller;
