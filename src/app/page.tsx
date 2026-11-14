"use client";

import { useState } from "react";
import PersonCard from "@/components/people/personCard";
import SearchBar from "@/components/ui/SearchBar";

export default function Home() {
  const [search, setSearch] = useState("");
  const people = [
    { name: "John cow we", position: "CEO", score: 4.5 },
    { name: "pria so low", position: "Designer", score: 4.8 },
    { name: "isnan cawapres", position: "Developer", score: 4.2 },
    { name: "fufufafa", position: "Product Manager", score: 4.7 },
    { name: "abner rakabuming raka", position: "Marketing", score: 4.4 },
    { name: "si KERJA tuh", position: "Analyst", score: 4.6 },
  ];
  const filteredPeople = people.filter((person) =>
    `${person.name} ${person.position}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="mt-3 flex flex-col gap-4">
      <SearchBar value={search} onChange={setSearch} />
      <div className="grid grid-cols-1 gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
        {filteredPeople.map((person) => (
          <PersonCard key={person.name} {...person} />
        ))}
        {filteredPeople.length === 0 && (
          <p className="text-sm text-coal/60 dark:text-paper/60">No people found.</p>
        )}
      </div>
    </div>
  );
}
