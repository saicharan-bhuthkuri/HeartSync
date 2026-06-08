'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: string;
  delay: string;
  duration: string;
  drift: string;
  scale: string;
  rotate: string;
  char: string;
  colorClass: string;
  opacity: number;
}

export function FloatingHeartsBg() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const symbols = ['✦', '❤', '✧', '✨', '★', '❤', '✦'];
    const colors = [
      'text-rose-400 dark:text-rose-500', 
      'text-pink-400 dark:text-pink-500',
      'text-amber-300 dark:text-amber-400', // Gold stars
      'text-violet-400 dark:text-violet-500'
    ];

    const generated: Particle[] = Array.from({ length: 24 }).map((_, i) => {
      const char = symbols[Math.floor(Math.random() * symbols.length)];
      // Hearts are slightly more opaque, stars are very faint
      const opacity = char === '❤' ? 0.08 : 0.22;
      const leftVal = `${Math.random() * 100}%`;
      const delayVal = `${Math.random() * 10}s`;
      const durationVal = `${20 + Math.random() * 25}s`; // super slow rising (20s to 45s)
      const driftVal = `${(Math.random() - 0.5) * 160}px`; // wider drifting
      const scaleVal = `${0.35 + Math.random() * 0.75}`;
      const rotateVal = `${(Math.random() - 0.5) * 270}deg`;
      const colorClass = colors[Math.floor(Math.random() * colors.length)];

      return {
        id: i,
        left: leftVal,
        delay: delayVal,
        duration: durationVal,
        drift: driftVal,
        scale: scaleVal,
        rotate: rotateVal,
        char,
        colorClass,
        opacity,
      };
    });

    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute bottom-[-60px] select-none animate-slow-float ${p.colorClass}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--drift': p.drift,
            '--scale': p.scale,
            '--rotate': p.rotate,
            '--max-opacity': p.opacity,
          } as React.CSSProperties}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
