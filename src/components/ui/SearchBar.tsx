import { RiSearchLine } from "@remixicon/react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-coal/15 px-3 py-3 focus-within:border-coal/40 dark:border-paper/20 dark:focus-within:border-paper/50">
      <input
        type="search"
        aria-label="Search people"
        placeholder="Search..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-coal outline-none placeholder:text-coal/45 dark:text-paper dark:placeholder:text-paper/45"
      />
      <RiSearchLine
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-coal/50 dark:text-paper/50"
      />
    </div>
  );
}
