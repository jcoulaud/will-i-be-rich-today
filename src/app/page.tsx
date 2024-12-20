'use client';

import { useFortuneResponses } from '@/hooks/useFortuneResponses';
import { memo, useCallback, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const MAX_LENGTH = 30;
const VALID_INPUT_REGEX = /^[\p{L}\p{N}\p{Emoji}\s]*$/u;
const CONTRACT_ADDRESS = 'xxxxxxxxxxxxxxxxxxxxx';

const FortuneTeller = memo(() => {
  const { currentResponse, getNextResponse, isLoading, fetchResponses } = useFortuneResponses();
  const [newResponse, setNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_LENGTH);
    if (value === '' || VALID_INPUT_REGEX.test(value)) {
      setNewResponse(value);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!newResponse.trim()) {
      toast.error('Please enter a response');
      return;
    }

    if (!VALID_INPUT_REGEX.test(newResponse)) {
      toast.error('Only letters, numbers, and emojis are allowed');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newResponse.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setNewResponse('');
        if (!data.isDuplicate) {
          await fetchResponses(); // Only refresh if it's a new response
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
  }, [newResponse, fetchResponses]);

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

      <div className='fixed top-4 left-0 right-0 text-center'>
        <a
          href={`#`}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-block px-4 py-2 rounded-full border border-purple-400 bg-purple-900/50 text-sm text-purple-200 hover:text-purple-400 hover:border-purple-300 transition-colors backdrop-blur-sm'>
          CA: {CONTRACT_ADDRESS}
        </a>
      </div>

      <div className='mt-20 md:mt-0'>
        <h1 className='text-4xl md:text-5xl font-bold mb-4 animate-bounce'>
          Will I Be Rich Today? 🤑
        </h1>

        <p className='text-lg md:text-xl text-purple-300 mb-8 max-w-2xl mx-auto px-4'>
          Community-driven fortune teller for memecoin traders. Add your own predictions and see
          what the community thinks about your future wealth! 🤑
        </p>
      </div>

      <div className='text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold mb-8 text-red-500 animate-pulse'>
        {currentResponse.text}
      </div>

      <div className='max-w-md space-y-6 text-lg'>
        <p className='text-yellow-400'>
          But hey, I&apos;m sure this next memecoin will be the one!
        </p>

        <div className='pt-2 text-sm text-gray-400'>
          <ul className='mt-2 space-y-2'>
            <li>Find a x30, but round trip a 20% profit 💸</li>
            <li>Top blast after a green god candle 📉</li>
            <li>Let&apos;s play this new meta 💨</li>
          </ul>
        </div>
      </div>

      <button
        className='mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-300 transform hover:scale-105'
        onClick={getNextResponse}>
        Try Again
      </button>

      <div className='mt-16 w-full max-w-md mb-12'>
        <div className='relative'>
          <input
            type='text'
            value={newResponse}
            onChange={handleInputChange}
            placeholder='Add your own response...'
            className='w-full px-4 py-2 rounded-lg bg-purple-800 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500'
            maxLength={MAX_LENGTH}
          />
          <span className='absolute right-2 top-2 text-xs text-purple-300'>
            {newResponse.length}/{MAX_LENGTH}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='mt-4 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'>
          {isSubmitting ? 'Adding...' : 'Add Response'}
        </button>
      </div>
    </div>
  );
});

FortuneTeller.displayName = 'FortuneTeller';

export default FortuneTeller;
