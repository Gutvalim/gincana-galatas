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

  // Determine stroke color (UMP Blue -> Amber -> UMP Red)
  let ringColor = '#004b93'; // UMP Royal Blue
  if (isUrgent) {
    ringColor = '#dc2626'; // UMP Red danger
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
        {/* Circular background shadow / glow */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-300"
          style={{
            width: radius * 2 + strokeWidth,
            height: radius * 2 + strokeWidth,
            background: isUrgent
              ? 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, rgba(220, 38, 38, 0.03) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(0, 75, 147, 0.1) 0%, rgba(255, 255, 255, 0.6) 70%, transparent 100%)',
          }}
        />

        <svg width={size} height={size} className="overflow-visible transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="#ffffff"
            className="shadow-inner"
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
                ? 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.6))'
                : 'drop-shadow(0 0 6px rgba(0, 75, 147, 0.4))',
            }}
          />
        </svg>

        {/* Center Digital Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`font-black tracking-tighter leading-none transition-colors duration-200 font-mono ${
              isUrgent
                ? 'text-red-600 scale-110 drop-shadow'
                : isExpired
                ? 'text-red-500'
                : 'text-slate-900 drop-shadow-sm'
            }`}
            style={{ fontSize: size * 0.32 }}
          >
            {seconds}
          </span>
          <span
            className={`text-xs sm:text-sm font-black tracking-widest uppercase mt-1 ${
              isUrgent ? 'text-red-600 animate-pulse' : 'text-blue-900'
            }`}
          >
            {isExpired ? 'TEMPO ESGOTADO' : isRunning ? 'SEGUNDOS' : 'PAUSADO'}
          </span>
        </div>
      </div>
    </div>
  );
};
