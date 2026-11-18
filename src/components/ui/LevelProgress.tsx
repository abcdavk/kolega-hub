interface LevelProgressProps {
  level: number;
  points: number;
  pointsToNextLevel: number;
  onClaim?: () => void;
}

export default function LevelProgress({
  level,
  points,
  pointsToNextLevel,
  onClaim,
}: LevelProgressProps) {
  const progress =
    pointsToNextLevel > 0
      ? Math.min(100, Math.max(0, (points / pointsToNextLevel) * 100))
      : 0;
  const canClaim = points >= pointsToNextLevel && Boolean(onClaim);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex min-h-20 w-full flex-col justify-center gap-2 rounded-xl bg-coal/5 px-4 py-3 sm:min-w-0 sm:flex-1 dark:bg-paper/5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-coal dark:text-paper">Level {level}</span>
          <span className="text-right tabular-nums text-coal-lighter dark:text-paper-darker">
            {Math.max(points, 0)} / {pointsToNextLevel} EXP
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`Progress level ${level}`}
          aria-valuemin={0}
          aria-valuemax={pointsToNextLevel}
          aria-valuenow={Math.min(Math.max(points, 0), pointsToNextLevel)}
          className="h-3 w-full overflow-hidden rounded-full bg-coal/15 dark:bg-paper/15">
          <div
            className="h-full rounded-full bg-coal transition-[width] duration-500 dark:bg-paper"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onClaim}
        disabled={!canClaim}
        className="w-full min-h-10 rounded-xl bg-coal px-5 text-base font-semibold text-paper transition-colors enabled:hover:bg-coal-lighter disabled:cursor-not-allowed disabled:opacity-50 sm:w-36 sm:min-h-20 dark:bg-paper dark:text-coal dark:enabled:hover:bg-paper-darker">
        Claim
      </button>
    </div>
  );
}
