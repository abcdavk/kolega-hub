"use client";

import { RiStarFill } from "@remixicon/react";
import IconKarma from "../../app/icons/karma";
import { use } from "motion/react-m";
interface PersonCardProps {
  name: string;
  position: string;
  score: number;
}

interface BadgeProps {
  texts: string[];
}

export function Badge({ texts }: BadgeProps) {
  const styles = [
    "-rotate-2 bg-red-300",
    "rotate-2 bg-purple-400",
    "-rotate-2 bg-green-300",
  ];

  return (
    <div className="mt-3 grid w-fit grid-cols-2 items-start gap-2">
      {texts.map((text, index) => (
        <div
          key={`${text}-${index}`}
          className={`inline-flex w-fit items-center px-2 py-1 ${styles[index % styles.length]}`}>
          <p className="whitespace-nowrap text-xs leading-none font-extralight text-black">
            {text}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function PersonCard({ name, position, score }: PersonCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-paper p-3">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        {/* LOGO */}
        <div className="h-14 w-14 rounded-lg bg-black flex items-center justify-center text-white">
          <h1>PP</h1>
        </div>
        {/* NAME */}
        <div className="flex flex-col">
          <h1 className="text-xl text-black font-serif font-bold">{name}</h1>
          <p className="text-sm text-black/75">{position}</p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <RiStarFill className="text-black" />
          {/* SCORE */}
          <p className="text-lg text-black">{score.toFixed(1)}</p>
        </div>
      </div>
      <Badge texts={["Problem Solver", "High Empathy", "Code Wizard"]} />

      {/* GIVE RATING BUTTON */}
      <button className="mt-4 w-full flex rounded-lg bg-coal py-3 px-2">
        <p className="text-white font-medium text-sm">Give Rating</p>
        <div className="ml-auto flex items-center gap-1">
          <IconKarma className="block h-4 w-4 bg-gray-200" />
          <p className="text-gray-200 font-medium text-[13px]">500</p>
        </div>
      </button>
    </div>
  );
}
