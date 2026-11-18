interface BuyConfirmPopupProps {
  namaBarang: string;
  onClose: () => void;
}

export default function BuyConfirmPopup({
  namaBarang,
  onClose,
}: BuyConfirmPopupProps) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-confirm-popup-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="rounded-2xl bg-coal p-6 text-paper dark:bg-paper dark:text-coal">
        <p id="buy-confirm-popup-title" className="text-center text-xl font-semibold">
          Beli {namaBarang}?
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-paper px-5 py-2 font-medium text-coal dark:bg-coal dark:text-paper"
          >
            Oke
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-paper/50 px-5 py-2 font-medium text-paper dark:border-coal/50 dark:text-coal"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
