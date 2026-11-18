interface ClaimPopUpProps {
  onClose: () => void;
}

export default function ClaimPopUp({ onClose }: ClaimPopUpProps) {
    return (
      <>
        <div
          className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-sm bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-popup-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}>
            <div className="dark:bg-paper bg-coal rounded-2xl p-4">
                <div className="flex flex-col items-center p-4 justify-between gap-1 text-paper dark:text-coal">
                    <h1 id="claim-popup-title" className="font-semibold text-3xl">Selamat!</h1>
                    <h1 id="claim-popup-title" className="font-semibold text-3xl">Karma telah masuk</h1>
                    <h1 id="claim-popup-title" className="font-semibold text-3xl">ke dompet anda</h1>
                    <button type="button" onClick={onClose} aria-label="Tutup popup" className="bg-paper mt-2 dark:bg-coal text-coal dark:text-paper px-3 py-1 w-full rounded-2xl"> 
                        Ok
                    </button>
                </div>
            </div>
        </div>
      </>
    );
}