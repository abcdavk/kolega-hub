interface ClaimPopUpProps {
  level: number;
  rewardKarma: number;
  onClose: () => void;
}

export default function ClaimPopUp({ level, rewardKarma, onClose }: ClaimPopUpProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-popup-title">
      <div className="w-full max-w-md rounded-3xl bg-paper p-6 text-center text-coal shadow-2xl sm:p-8 dark:bg-coal dark:text-paper">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coal-lighter dark:text-paper-darker">
          Milestone tercapai
        </p>
        <p className="mt-2 text-2xl font-bold">+{rewardKarma} karma</p>
        <p className="mt-2 text-coal-lighter dark:text-paper-darker">
          Level {level} berhasil diklaim.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-12 w-full rounded-xl bg-coal px-4 text-sm font-semibold text-paper transition-transform hover:scale-[1.01] dark:bg-paper dark:text-coal">
          Konfirmasi
        </button>
      </div>
    </div>
  );
}
