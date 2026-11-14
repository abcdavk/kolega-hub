"use client";

import { RiStarFill } from "@remixicon/react";
import IconKarma from "../../app/icons/karma";

interface PersonCardProps {
  name: string;
  position: string;
  score: number;
}

interface BadgeProps {
  texts: string[];
}

export function Badge({ texts }: BadgeProps) {
  const styles = ["-rotate-2 bg-red-300", "rotate-2 bg-purple-400", "-rotate-2 bg-green-300"];

  return (
    <div className="mt-3 grid w-fit grid-cols-2 items-start gap-2">
      {texts.map((text, index) => (
        <div
          key={`${text}-${index}`}
          className={`inline-flex w-fit items-center px-2 py-1 ${styles[index % styles.length]}`}>
          <p className="paperspace-nowrap text-xs leading-none font-extralight text-coal">{text}</p>
        </div>
      ))}
    </div>
  );
}

export default function PersonCard({ name, position, score }: PersonCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-coal dark:bg-paper p-3">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        {/* LOGO */}
        <div className="h-14 w-14 rounded-lg bg-paper dark:bg-coal flex items-center justify-center text-coal dark:text-paper">
          <h1>PP</h1>
        </div>
        {/* NAME */}
        <div className="flex flex-col">
          <h1 className="text-xl text-paper dark:text-coal font-serif font-bold">{name}</h1>
          <p className="text-sm text-paper/75 dark:text-coal/75">{position}</p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <RiStarFill className="text-paper dark:text-coal" />
          {/* SCORE */}
          <p className="text-lg text-paper dark:text-coal">{score.toFixed(1)}</p>
        </div>
      </div>
      <Badge texts={["Problem Solver", "High Empathy", "Code Wizard"]} />

      {/* GIVE RATING BUTTON */}
      <button className="mt-4 w-full flex rounded-lg bg-paper dark:bg-coal py-3 px-4 text-md">
        <p className="text-coal dark:text-paper font-medium">Give Rating</p>
        <div className="ml-auto flex items-center gap-1">
          <IconKarma className="block h-6 w-6 bg-coal dark:bg-paper" />
          <p className="text-coal dark:text-paper font-medium">500</p>
        </div>
      </button>
    </div>
  );
}
