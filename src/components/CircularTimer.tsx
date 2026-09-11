import React from 'react';

interface CircularTimerProps {
  seconds: number;
  maxSeconds?: number;
  isRunning?: boolean;
  size?: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  seconds,
  maxSeconds = 60,
  isRunning = false,
  size = 280,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(1, Math.max(0, seconds / maxSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  const isUrgent = seconds <= 10 && seconds > 0;
  const isExpired = seconds === 0;

  // Determine stroke color
  let ringColor = '#06b6d4'; // Cyan default
  if (isUrgent) {
    ringColor = '#ef4444'; // Red danger
  } else if (seconds <= 20) {
    ringColor = '#f59e0b'; // Amber warning
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        className={`relative flex items-center justify-center ${
          isUrgent ? 'animate-pulse-fast' : ''
        }`}
        style={{ width: size, height: size }}
      >
        {/* Glow backdrop */}
        <div
          className="absolute inset-2 rounded-full blur-xl transition-all duration-300"
          style={{
            backgroundColor: isUrgent
              ? 'rgba(239, 68, 68, 0.4)'
              : 'rgba(6, 182, 212, 0.25)',
          }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1f2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
            style={{
              filter: isUrgent
                ? 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))'
                : 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.7))',
            }}
          />
        </svg>

        {/* Center Digital Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-black tracking-tighter leading-none transition-colors duration-200 ${
              isUrgent
                ? 'text-red-500 scale-110 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                : isExpired
                ? 'text-red-400'
                : 'text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]'
            }`}
            style={{ fontSize: size * 0.32 }}
          >
            {seconds}
          </span>
          <span
            className={`text-xs sm:text-sm font-bold tracking-widest uppercase mt-1 ${
              isUrgent ? 'text-red-400' : 'text-cyan-400'
            }`}
          >
            {isExpired ? 'TEMPO ESGOTADO' : isRunning ? 'SEGUNDOS' : 'PAUSADO'}
          </span>
        </div>
      </div>
    </div>
  );
};
