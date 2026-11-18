"use client";

import { useEffect, useState, type FormEvent } from "react";
import { RiCloseFill, RiStarFill, RiStarLine } from "@remixicon/react";
import { motion } from "motion/react";
import { AUTH_SESSION_CHANGE_EVENT, requestAuthDialog } from "@/lib/authEvents";

interface ReviewFormProps {
  revieweeId: number;
  personName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Appreciation {
  id: number;
  label: string;
}

interface AppreciationsResponse {
  appreciations?: Appreciation[];
  error?: string;
}

interface ReviewResponse {
  error?: string;
}

export default function ReviewForm({ revieweeId, personName, onClose, onSuccess }: ReviewFormProps) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [rating, setRating] = useState(1);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [selectedAppreciations, setSelectedAppreciations] = useState<number[]>([]);
  const [review, setReview] = useState("");
  const [isLoadingAppreciations, setIsLoadingAppreciations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayedRating = hoveredRating ?? rating;
  const ratingDescriptions = [
    "",
    "Kurang bagus",
    "Perlu ditingkatkan",
    "Cukup baik",
    "Kolaborasi yang baik bangettt",
    "Hebat luar biasa, alhamdulillah!",
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppreciations() {
      try {
        const response = await fetch("/api/appreciations", { signal: controller.signal });
        const data = (await response.json()) as AppreciationsResponse;
        if (!response.ok) throw new Error(data.error ?? "Gagal memuat pilihan apresiasi.");
        if (!Array.isArray(data.appreciations)) {
          throw new Error("Data pilihan apresiasi tidak valid.");
        }

        setAppreciations(data.appreciations);
        setSelectedAppreciations(
          data.appreciations
            .filter(({ label }) => label === "kinerja" || label === "produktifitas")
            .map(({ id }) => id),
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : "Gagal memuat pilihan apresiasi.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingAppreciations(false);
      }
    }

    void loadAppreciations();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleSessionChange = (event: WindowEventMap[typeof AUTH_SESSION_CHANGE_EVENT]) => {
      setAuthToken(event.detail);
    };

    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
    try {
      setAuthToken(localStorage.getItem("token"));
    } catch {
      setError("Browser tidak dapat mengakses penyimpanan login.");
    }

    return () => window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
  }, []);

  function handleLoginClick() {
    onClose();
    requestAuthDialog();
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!authToken) {
      handleLoginClick();
      return;
    }

    setIsSubmitting(true);
    let submitted = false;
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          reviewee_id: revieweeId,
          technical_score: rating,
          collaboration_score: rating,
          problem_solving_score: rating,
          mentorship_score: rating,
          comment: review.trim() || null,
          appreciation_ids: selectedAppreciations,
        }),
      });
      const data = (await response.json()) as ReviewResponse;
      if (!response.ok) throw new Error(data.error ?? "Gagal mengirim ulasan.");
      submitted = true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal mengirim ulasan.");
    } finally {
      setIsSubmitting(false);
    }
    if (submitted) onSuccess();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-sm bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-form-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-paper p-5 text-coal shadow-xl">
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
          onSubmit={submitReview}
          className="flex flex-col gap-6">
          <section aria-labelledby="overall-rating-label">
            <h3
              id="overall-rating-label"
              className="mb-2 font-semibold">
              Penilaian keseluruhan
            </h3>
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Pilih rating dari 1 sampai 5"
              onMouseLeave={() => setHoveredRating(null)}>
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                const StarIcon = value <= displayedRating ? RiStarFill : RiStarLine;

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
              <span
                className="ml-2 text-sm"
                aria-live="polite">
                {displayedRating} / 5
              </span>
            </div>
            <p
              className="mt-2 text-sm text-coal/60"
              aria-live="polite">
              {ratingDescriptions[displayedRating]}
            </p>
          </section>

          <fieldset>
            <legend className="font-semibold">Apa yang paling kamu apresiasi?</legend>
            <p className="mb-3 mt-1 text-sm text-coal/60">Boleh pilih lebih dari satu.</p>
            <div className="flex flex-wrap gap-2">
              {appreciations.map((appreciation) => {
                const isSelected = selectedAppreciations.includes(appreciation.id);

                return (
                  <button
                    key={appreciation.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelectedAppreciations((current) =>
                        isSelected
                          ? current.filter((id) => id !== appreciation.id)
                          : [...current, appreciation.id],
                      )
                    }
                    className={`rounded-full border border-coal px-3 py-2 text-sm transition-colors ${
                      isSelected ? "bg-coal text-paper" : "bg-transparent text-coal hover:bg-coal/10"
                    }`}>
                    {appreciation.label.charAt(0).toUpperCase() + appreciation.label.slice(1)}
                  </button>
                );
              })}
              {isLoadingAppreciations && <p className="text-sm text-coal/60">Memuat pilihan...</p>}
            </div>
          </fieldset>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="review-comment"
                className="font-semibold">
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
            <p
              className="mt-1 text-right text-sm text-coal/60"
              aria-live="polite">
              {review.length} / 500 karakter
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-coal px-4 py-3 font-medium transition-colors hover:bg-coal/10">
              Batal
            </button>
            {authToken ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-2 rounded-xl bg-coal px-4 py-3 font-medium text-paper transition-colors hover:bg-coal/90 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Mengirim..." : "Kirim ulasan"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLoginClick}
                className="flex-2 rounded-xl bg-coal px-4 py-3 font-medium text-paper transition-colors hover:bg-coal/90">
                Login
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
