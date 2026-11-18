"use client";

import { useEffect, useState } from "react";
import PersonCard from "@/components/people/personCard";
import SearchBar from "@/components/ui/SearchBar";

interface Person {
  user_id: number;
  name: string;
  division: string | null;
  avatar_url: string | null;
  total_reviews: number;
  avg_overall: number | null;
  titles: {
    id: number;
    name: string;
    color_hex: string;
  }[];
}

interface UsersResponse {
  users?: Person[];
  error?: string;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPeople() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/users", { cache: "no-store", signal: controller.signal });
        const data = (await response.json()) as UsersResponse;
        if (!response.ok) throw new Error(data.error ?? "Failed to load people.");
        if (!Array.isArray(data.users)) throw new Error("The people response is invalid.");
        setPeople(data.users);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : "Failed to load people.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadPeople();
    return () => controller.abort();
  }, [refreshKey]);

  const filteredPeople = people.filter((person) =>
    `${person.name} ${person.division ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="mt-3 flex flex-col gap-4">
      <SearchBar
        value={search}
        onChange={setSearch}
      />
      <div className="grid grid-cols-1 gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
        {filteredPeople.map((person) => (
          <PersonCard
            key={person.user_id}
            userId={person.user_id}
            name={person.name}
            division={person.division}
            avatarUrl={person.avatar_url}
            score={person.avg_overall ?? 0}
            reviewCount={person.total_reviews}
            titles={person.titles}
            onReviewSubmitted={() => setRefreshKey((current) => current + 1)}
          />
        ))}
        {isLoading && <p className="text-sm text-coal/60 dark:text-paper/60">Memuat semua orang...</p>}
        {error && (
          <p
            role="alert"
            className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!isLoading && !error && filteredPeople.length === 0 && (
          <p className="text-sm text-coal/60 dark:text-paper/60">Lagi sepi nih..</p>
        )}
      </div>
    </div>
  );
}
