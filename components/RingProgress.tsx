export default function RingProgress({
  consumed,
  target,
  size = 160,
  strokeWidth = 14,
}: {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const offset = circumference * (1 - pct);
  const remaining = target - consumed;
  const over = remaining < 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? "#f59e0b" : "#059669"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-900">
          {Math.abs(Math.round(remaining))}
        </span>
        <span className="text-xs text-slate-500">
          {over ? "kcal over" : "kcal left"}
        </span>
      </div>
    </div>
  );
}
