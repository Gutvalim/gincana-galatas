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
  const strokeWidth = 12;
  const padding = 12;
  const radius = (size - strokeWidth - padding * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(1, Math.max(0, seconds / maxSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  const isUrgent = seconds <= 10 && seconds > 0;
  const isExpired = seconds === 0;

  // Determine stroke color
  let ringColor = '#10b981'; // IPB Emerald default
  if (isUrgent) {
    ringColor = '#ef4444'; // Red danger
  } else if (seconds <= 20) {
    ringColor = '#f59e0b'; // Presbyterian gold warning
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        className={`relative flex items-center justify-center ${
          isUrgent ? 'animate-pulse-fast' : ''
        }`}
        style={{ width: size, height: size }}
      >
        {/* Subtle circular radial backdrop (strictly circular, no square glow or box) */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-300"
          style={{
            width: radius * 2 + strokeWidth,
            height: radius * 2 + strokeWidth,
            background: isUrgent
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(0, 99, 65, 0.25) 0%, rgba(6, 20, 14, 0.7) 70%, transparent 100%)',
          }}
        />

        <svg width={size} height={size} className="overflow-visible transform -rotate-90">
          {/* Background circle track with circular fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0a261c"
            strokeWidth={strokeWidth}
            fill="rgba(6, 25, 18, 0.6)"
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
                ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.85))'
                : 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
            }}
          />
        </svg>

        {/* Center Digital Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`font-black tracking-tighter leading-none transition-colors duration-200 ${
              isUrgent
                ? 'text-red-500 scale-110 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                : isExpired
                ? 'text-red-400'
                : 'text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]'
            }`}
            style={{ fontSize: size * 0.32 }}
          >
            {seconds}
          </span>
          <span
            className={`text-xs sm:text-sm font-bold tracking-widest uppercase mt-1 ${
              isUrgent ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {isExpired ? 'TEMPO ESGOTADO' : isRunning ? 'SEGUNDOS' : 'PAUSADO'}
          </span>
        </div>
      </div>
    </div>
  );
};
