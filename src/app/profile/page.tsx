"use client";

import { useRef, useState, type RefObject } from "react";
import { motion, Reorder, type PanInfo } from "motion/react";

type Title = {
  id: number;
  label: string;
  color: string;
};

type Stat = {
  id: string;
  label: string;
};

const stats: Stat[] = [
  { id: "technical", label: "Technical & Execution Skills" },
  { id: "collaboration", label: "Collaboration & Communication" },
  { id: "problemSolving", label: "Problem Solving Under Pressure" },
  { id: "mentorship", label: "Mentorship & Culture Contribution" },
];

const ratingLabel = (rating: number) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Good";
  if (rating >= 2.5) return "Average";
  return "Needs Improvement";
};

export default function Profile() {
  const titles: Title[] = [
    {
      id: 1,
      label: "High Empathy",
      color: "bg-red-300",
    },
    {
      id: 2,
      label: "Code Wizard",
      color: "bg-purple-400",
    },
    {
      id: 3,
      label: "Problem Solver",
      color: "bg-green-300",
    },
    {
      id: 4,
      label: "Bla bla",
      color: "bg-amber-300",
    },
  ];
  const maxVisibleTitle = 3;
  const [visibleTitleIds, setVisibleTitleIds] = useState([1, 2]);
  const [titleMessage, setTitleMessage] = useState("");
  const visibleDropZoneRef = useRef<HTMLUListElement>(null);

  const titleById = (id: number) => titles.find((title) => title.id === id);
  const rotationForTitle = (id: number) => (((id * 37) % 7) - 3) * 0.7;

  const addVisibleTitle = (id: number) => {
    if (visibleTitleIds.includes(id)) return;
    if (visibleTitleIds.length >= maxVisibleTitle) {
      setTitleMessage(`You can show up to ${maxVisibleTitle} titles.`);
      return;
    }

    setTitleMessage("");
    setVisibleTitleIds((current) => [...current, id]);
  };

  const removeVisibleTitle = (id: number) => {
    setTitleMessage("");
    setVisibleTitleIds((current) => current.filter((titleId) => titleId !== id));
  };

  const droppedInside = (ref: RefObject<HTMLElement | null>, point: PanInfo["point"]) => {
    const bounds = ref.current?.getBoundingClientRect();
    return (
      bounds !== undefined &&
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom
    );
  };

  const handleOwnedTitleDragEnd = (id: number, info: PanInfo) => {
    if (droppedInside(visibleDropZoneRef, info.point)) addVisibleTitle(id);
  };

  const statRatings: Record<string, number> = {
    technical: 5,
    collaboration: 5,
    problemSolving: 4,
    mentorship: 5,
  };

  const overallRating =
    Math.floor((stats.reduce((sum, stat) => sum + statRatings[stat.id], 0) / stats.length) * 10) / 10;

  return (
    <section>
      <h2 className="text-coal dark:text-paper text-lg mb-4 font-bold uppercase">Identity</h2>
      <div className="flex gap-4">
        <div className="min-w-42 h-auto flex bg-coal text-paper dark:bg-paper dark:text-coal rounded-xl justify-center items-center">
          PP
        </div>
        <div className="w-full">
          <p className="mb-2">Your Name</p>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full border border-coal/30 dark:border-paper/30 rounded-lg py-3 px-3 outline-none"
          />
          <p className="my-2">Division</p>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full border border-coal/30 dark:border-paper/30 rounded-lg py-3 px-3 outline-none"
          />
        </div>
      </div>
      <h2 className="text-coal dark:text-paper text-lg my-4 font-bold uppercase">Your Titles</h2>
      <p className="mb-2 font-medium">
        Visible{" "}
        <span className="text-paper-darker dark:text-coal-lighter">
          ({visibleTitleIds.length}/{maxVisibleTitle})
        </span>
      </p>
      <Reorder.Group
        ref={visibleDropZoneRef}
        axis="x"
        values={visibleTitleIds}
        onReorder={setVisibleTitleIds}
        aria-label="Visible titles. Drag to reorder titles or use the hide button."
        className="flex min-h-20 flex-wrap items-center gap-3 rounded-xl border-2 border-dashed border-coal/20 p-3 dark:border-paper/20">
        {visibleTitleIds.map((id) => {
          const title = titleById(id);
          if (!title) return null;

          return (
            <Reorder.Item
              key={id}
              value={id}
              whileDrag={{ scale: 1.05, zIndex: 1 }}
              dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
              style={{ rotate: `${rotationForTitle(id)}deg` }}
              className={`touch-none cursor-grab rounded-lg px-3 py-2 text-coal shadow-sm active:cursor-grabbing ${title.color}`}>
              <span>{title.label}</span>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => removeVisibleTitle(id)}
                aria-label={`Hide ${title.label}`}
                className="ml-2 cursor-pointer rounded-full px-1 font-bold hover:bg-black/10">
                ×
              </button>
            </Reorder.Item>
          );
        })}
        {visibleTitleIds.length === 0 && (
          <li className="list-none text-sm text-coal-lighter dark:text-paper-darker">
            Drag a title here to make it visible.
          </li>
        )}
      </Reorder.Group>
      <p className="mt-5 mb-2 font-medium">Owned</p>
      <div
        aria-label="Owned titles. Drag a title to the visible area to show it."
        role="group"
        className="flex min-h-20 flex-wrap items-center gap-3 rounded-xl border-2 border-dashed border-coal/20 p-3 dark:border-paper/20">
        {titles.map((title) => {
          const isVisible = visibleTitleIds.includes(title.id);

          return (
            <motion.div
              key={title.id}
              drag
              dragMomentum={false}
              dragSnapToOrigin
              onDragEnd={(_, info) => handleOwnedTitleDragEnd(title.id, info)}
              whileDrag={{ scale: 1.05, zIndex: 1 }}
              style={{ rotate: `${rotationForTitle(title.id)}deg` }}
              className={`touch-none cursor-grab rounded-lg px-3 py-2 text-coal shadow-sm active:cursor-grabbing ${title.color} ${
                isVisible ? "opacity-60" : ""
              }`}>
              <span>{title.label}</span>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => addVisibleTitle(title.id)}
                disabled={isVisible || visibleTitleIds.length >= maxVisibleTitle}
                aria-label={isVisible ? `${title.label} is visible` : `Show ${title.label}`}
                className="ml-2 cursor-pointer rounded-full px-1 font-bold hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-50">
                {isVisible ? "✓" : "+"}
              </button>
            </motion.div>
          );
        })}
      </div>
      <p
        aria-live="polite"
        className="mt-2 min-h-5 text-sm text-coal-lighter dark:text-paper-darker">
        {titleMessage || "Drag to arrange visible titles. Use × to hide a title or drag one from Owned to show it."}
      </p>

      <h2 className="text-coal dark:text-paper text-lg my-4 font-bold uppercase">Your Stats</h2>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        {stats.map((stat) => {
          const rating = statRatings[stat.id];

          return (
            <div key={stat.id}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p>{stat.label}</p>
                <span className="text-coal-lighter dark:text-paper-darker">{rating.toFixed(1)} / 5.0</span>
              </div>
              <div
                role="img"
                aria-label={`${stat.label}: ${rating.toFixed(1)} out of 5`}
                className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isActive = value <= Math.round(rating);

                  return (
                    <span
                      key={value}
                      className={`h-2 flex-1 rounded-full border border-paper-darker ${isActive ? "bg-green-300" : "bg-paper"}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-sm uppercase">Overall Rating</p>
        <div
          className="flex gap-2"
          role="img"
          aria-label={`${overallRating.toFixed(1)} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              viewBox="0 0 24 24"
              className="h-9 w-9 text-coal dark:text-paper"
              fill={star <= Math.floor(overallRating) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round">
              <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
            </svg>
          ))}
        </div>
        <p className="text-sm">
          {overallRating.toFixed(1)} ({ratingLabel(overallRating)})
        </p>
      </div>
    </section>
  );
}
