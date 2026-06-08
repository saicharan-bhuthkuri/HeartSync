'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDateStr: string; // YYYY-MM-DD
}

export function CountdownTimer({ targetDateStr }: { targetDateStr: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(`${targetDateStr}T00:00:00`) - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center items-center space-x-3 md:space-x-4">
      {timeBlocks.map((block, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-rose-500/10 dark:border-rose-400/10 flex items-center justify-center shadow-inner">
            <span className="text-xl md:text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400 font-mono">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 mt-1">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}
