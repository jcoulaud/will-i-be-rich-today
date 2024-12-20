'use client';

import { memo, useCallback, useState } from 'react';

const FortuneTeller = memo(() => {
  const allResponses = [
    'NO',
    'Still NO',
    'Ye... NO',
    'Nice try, but NO',
    'Maybe next ti... NO',
    'Still poor',
  ];

  // Initialize with NO as first response and rest shuffled
  const initializeResponses = useCallback(() => {
    const shuffled = [...allResponses.slice(1)].sort(() => Math.random() - 0.5);
    return ['NO', ...shuffled];
  }, []);

  const [currentResponse, setCurrentResponse] = useState('NO');
  const [remainingResponses, setRemainingResponses] = useState(initializeResponses().slice(1));

  const handleClick = useCallback(() => {
    if (remainingResponses.length === 0) {
      const newResponses = initializeResponses();
      setCurrentResponse(newResponses[0]);
      setRemainingResponses(newResponses.slice(1));
    } else {
      const [nextResponse, ...rest] = remainingResponses;
      setCurrentResponse(nextResponse);
      setRemainingResponses(rest);
    }
  }, [remainingResponses, initializeResponses]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex flex-col items-center justify-center p-4 text-center'>
      <h1 className='text-4xl md:text-6xl font-bold mb-12 animate-bounce'>
        Will I Be Rich Today? 🤑
      </h1>

      <div className='text-8xl md:text-9xl font-extrabold mb-8 text-red-500 animate-pulse'>
        {currentResponse}
      </div>

      <div className='max-w-md space-y-6 text-lg'>
        <p className='text-yellow-400'>
          But hey, I&apos;m sure this next memecoin will be the one!
        </p>

        <div className='pt-8 text-sm text-gray-400'>
          <ul className='mt-2 space-y-2'>
            <li>Find a x30, but round trip a 20% profit 💸</li>
            <li>Top blast after a green god candle 📉</li>
            <li>Let&apos;s play this new meta 💨</li>
          </ul>
        </div>
      </div>

      <button
        className='mt-12 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-300 transform hover:scale-105'
        onClick={handleClick}>
        Try Again
      </button>
    </div>
  );
});

FortuneTeller.displayName = 'FortuneTeller';

export default FortuneTeller;
