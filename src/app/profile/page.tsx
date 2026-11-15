"use client";

import { useRef, useState, type RefObject } from "react";
import { motion, Reorder, type PanInfo } from "motion/react";

type Title = {
  id: number;
  label: string;
  color: string;
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

  return (
    <section>
      <h2 className="text-coal-lighter text-lg mb-4 font-bold uppercase">Identity</h2>
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
            className="w-full border border-paper/30 rounded-lg py-3 px-3 outline-none"
          />
          <p className="my-2">Division</p>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full border border-paper/30 rounded-lg py-3 px-3 outline-none"
          />
        </div>
      </div>
      <h2 className="text-coal-lighter text-lg my-4 font-bold uppercase">Your Titles</h2>
      <p className="mb-2 font-medium">
        Visible{" "}
        <span className="text-coal-lighter">
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
    </section>
  );
}
