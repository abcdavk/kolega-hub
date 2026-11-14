"use client";

import { useState } from "react";
import { RiCloseFill, RiStarFill, RiStarLine } from "@remixicon/react";

interface ReviewFormProps {
  personName: string;
  onClose: () => void;
}

export default function ReviewForm({ personName, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(1);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedAppreciations, setSelectedAppreciations] = useState([
    "kinerja",
    "produktifitas",
  ]);
  const [review, setReview] = useState("");
  const displayedRating = hoveredRating ?? rating;
  const appreciationOptions = [
    "Kinerja",
    "Projek",
    "Sikap",
    "Produktifitas",
    "Responsif",
  ];
  const ratingDescriptions = [
    "",
    "Kurang bagus",
    "Perlu ditingkatkan",
    "Cukup baik",
    "Kolaborasi yang baik bangettt",
    "Hebat luar biasa, alhamdulillah!",
  ];

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center transition-all backdrop-blur-sm bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-form-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-paper p-5 text-coal shadow-xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2
              id="review-form-title"
              className="text-2xl font-bold font-serif">
              Beri Ulasan
            </h2>
            <p className="text-light-coal text-md">Review pekerjaan {personName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form ulasan"
            className="cursor-pointer rounded-lg px-3 py-1 text-sm">
            <RiCloseFill />
          </button>
        </div>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-6">
          <section aria-labelledby="overall-rating-label">
            <h3 id="overall-rating-label" className="mb-2 font-semibold">
              Penilaian keseluruhan
            </h3>
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Pilih rating dari 1 sampai 5"
              onMouseLeave={() => setHoveredRating(null)}>
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                const StarIcon =
                  value <= displayedRating ? RiStarFill : RiStarLine;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Beri nilai ${value} dari 5`}
                    aria-pressed={rating === value}
                    onMouseEnter={() => setHoveredRating(value)}
                    onClick={() => setRating(value)}
                    className="cursor-pointer text-coal transition-transform hover:scale-110">
                    <StarIcon className="h-8 w-8" />
                  </button>
                );
              })}
              <span className="ml-2 text-sm" aria-live="polite">
                {displayedRating} / 5
              </span>
            </div>
            <p className="mt-2 text-sm text-coal/60" aria-live="polite">
              {ratingDescriptions[displayedRating]}
            </p>
          </section>

          <fieldset>
            <legend className="font-semibold">
              Apa yang paling kamu apresiasi?
            </legend>
            <p className="mb-3 mt-1 text-sm text-coal/60">
              Boleh pilih lebih dari satu.
            </p>
            <div className="flex flex-wrap gap-2">
              {appreciationOptions.map((appreciation) => {
                const isSelected =
                  selectedAppreciations.includes(appreciation);

                return (
                  <button
                    key={appreciation}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelectedAppreciations((current) =>
                        isSelected
                          ? current.filter((item) => item !== appreciation)
                          : [...current, appreciation],
                      )
                    }
                    className={`rounded-full border border-coal px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-coal text-paper"
                        : "bg-transparent text-coal hover:bg-coal/10"
                    }`}>
                    {appreciation}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="review-comment" className="font-semibold">
                Ulasan
              </label>
              <span className="text-sm text-coal/60">Opsional</span>
            </div>
            <textarea
              id="review-comment"
              maxLength={500}
              value={review}
              onChange={(event) => setReview(event.target.value)}
              placeholder="Kritik, saran, atau pujian untuk rekanmu..."
              className="min-h-32 w-full resize-y rounded-xl border border-coal/60 bg-transparent p-4 text-sm outline-none placeholder:text-coal/60 focus:border-coal"
            />
            <p className="mt-1 text-right text-sm text-coal/60" aria-live="polite">
              {review.length} / 500 karakter
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-coal px-4 py-3 font-medium transition-colors hover:bg-coal/10">
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] rounded-xl bg-coal px-4 py-3 font-medium text-paper transition-colors hover:bg-coal/90">
              Kirim ulasan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
