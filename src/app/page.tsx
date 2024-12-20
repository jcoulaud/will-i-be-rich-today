'use client';

import { useFortuneResponses } from '@/hooks/useFortuneResponses';
import { memo, useCallback, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const MAX_LENGTH = 42;
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
      toast.error(
        'Only letters, numbers, emojis, and basic punctuation (!#%?.,:\'"$_-) are allowed',
      );
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
          const newPrediction = { text: newResponse.trim(), createdAt: new Date().toISOString() };
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
  }, [newResponse, fetchResponses, setCurrentResponse]);

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
          Community-driven fortune teller for memecoin traders. The red predictions you see are all
          from the community - add yours and see what others think about your future wealth! 🤑
        </p>
      </div>

      <div className='text-4xl sm:text-5xl md:text-6xl lg:text-9xl font-extrabold mb-2 text-red-500 animate-pulse'>
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

      <div className='mt-16 w-full max-w-md mb-12'>
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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='mt-4 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'>
          {isSubmitting ? 'Adding...' : 'Add Prediction'}
        </button>
      </div>
    </div>
  );
});

FortuneTeller.displayName = 'FortuneTeller';

export default FortuneTeller;
