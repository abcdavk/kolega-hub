"use client";

import { useState } from "react";
import { RiStarFill } from "@remixicon/react";
import IconKarma from "../../app/icons/karma";
import ReviewForm from "@/components/ui/reviewForm";
interface PersonCardProps {
  userId: number;
  name: string;
  division: string | null;
  avatarUrl: string | null;
  score: number;
  reviewCount: number;
  titles: TitleBadge[];
  onReviewSubmitted: () => void;
}

interface TitleBadge {
  id: number;
  name: string;
  color_hex: string;
}

export function Badge({ titles }: { titles: TitleBadge[] }) {
  return (
    <div className="my-4 flex flex-wrap items-start gap-3">
      {titles.map((title) => (
        <div
          key={title.id}
          style={{
            rotate: `${(((title.id * 37) % 7) - 3) * 0.7}deg`,
            backgroundColor: title.color_hex,
          }}
          className="inline-flex w-fit items-center rounded-lg px-3 py-2 text-xs leading-none text-coal shadow-sm">
          {title.name}
        </div>
      ))}
    </div>
  );
}

export default function PersonCard({
  userId,
  name,
  division,
  avatarUrl,
  score,
  reviewCount,
  titles,
  onReviewSubmitted,
}: PersonCardProps) {
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full flex-col rounded-2xl bg-coal dark:bg-paper p-3">
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-2">
        {/* LOGO */}
        <div className="h-14 w-14 rounded-lg bg-paper dark:bg-coal flex items-center justify-center text-coal dark:text-paper">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name}'s avatar`}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        {/* NAME */}
        <div className="flex flex-col">
          <h1 className="text-xl text-paper dark:text-coal font-serif font-bold">{name}</h1>
          <p className="text-sm text-paper/75 dark:text-coal/75">{division || "No division"}</p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <RiStarFill className="text-paper dark:text-coal" aria-hidden="true" />
          {/* SCORE */}
          <div className="text-right">
            <p className="font-medium text-lg text-paper dark:text-coal">{score.toFixed(1)}</p>
          </div>
        </div>
      </div>
      {titles.length > 0 && <Badge titles={titles} />}

      {/* GIVE RATING BUTTON */}
      <button
        type="button"
        onClick={() => setIsReviewFormOpen(true)}
        className="mt-auto w-full h-12 flex rounded-lg bg-paper dark:bg-coal items-center px-4 text-md hover:scale-102 hover:translate-y-1 transition-transform duration-300 ease-out cursor-pointer group overflow-clip">
        <p className="text-coal dark:text-paper font-medium text-sm">Give Rating</p>
        <div className="ml-auto flex items-center gap-1">
          <div className="flex flex-col gap-4 translate-y-15 group-hover:-translate-y-25 transition-transform duration-1000 ease-out">
            <IconKarma className="block h-6 w-6 bg-coal dark:bg-paper" />
            <IconKarma className="block h-6 w-6 bg-coal dark:bg-paper" />
            <IconKarma className="block h-6 w-6 bg-coal dark:bg-paper" />
            <IconKarma className="block h-6 w-6 bg-coal dark:bg-paper" />
            <IconKarma className="block h-6 w-6 bg-coal dark:bg-paper" />
            <IconKarma className="block h-6 w-6 bg-coal dark:bg-paper" />
          </div>
          <p className="text-coal dark:text-paper font-medium">250</p>
        </div>
      </button>
      {isReviewFormOpen && (
        <ReviewForm
          revieweeId={userId}
          personName={name}
          onClose={() => setIsReviewFormOpen(false)}
          onSuccess={() => {
            setIsReviewFormOpen(false);
            onReviewSubmitted();
          }}
        />
      )}
    </div>
  );
}
