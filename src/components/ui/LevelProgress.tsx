import { useState } from "react";
import ClaimPopUp from "@/components/ui/claimPopup";

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
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(false);
  const progress =
    pointsToNextLevel > 0
      ? Math.min(100, Math.max(0, (points / pointsToNextLevel) * 100))
      : 0;
  const canClaim = points >= pointsToNextLevel && Boolean(onClaim);

  const handleClaim = () => {
    setIsClaimPopupOpen(true);
    onClaim?.();
  };

  return (
    <>
      <div className="mt-4 flex flex-col md:flex-row items-center gap-2">
        <div
          role="progressbar"
          aria-label={`Progress to level ${level + 1}`}
          aria-valuemin={0}
          aria-valuemax={pointsToNextLevel}
          aria-valuenow={Math.min(Math.max(points, 0), pointsToNextLevel)}
          className="relative flex md:h-13 w-full md:w-auto flex-1 items-center overflow-hidden rounded-lg border border-coal/70 p-1 dark:border-paper/70">
          <div
            aria-hidden="true"
            className="absolute inset-1 overflow-hidden rounded-md"
          >
            <div
              className="h-full rounded-md bg-paper transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="relative z-10 px-2 text-md font-medium text-coal">Level {level}</span>
          <span className="absolute inset-0 z-20 flex items-center justify-center">
            <span className="rounded-md bg-coal px-2 py-1 text-xs font-medium text-paper sm:text-sm">
            {points} / {pointsToNextLevel}pts
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleClaim}
          disabled={!canClaim}
          className="h-10 md:h-13 rounded-lg w-full md:w-auto bg-coal px-4 text-md font-medium text-paper transition-colors enabled:hover:bg-coal-lighter disabled:cursor-not-allowed disabled:opacity-50 dark:bg-paper dark:text-coal dark:enabled:hover:bg-paper-darker">
          Claim
        </button>
      </div>
      {isClaimPopupOpen && (
        <ClaimPopUp onClose={() => setIsClaimPopupOpen(false)} />
      )}
    </>
  );
}
