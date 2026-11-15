"use client";

import { useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import LevelProgress from "@/components/ui/LevelProgress";
import BarangCard from "@/components/shop/barangCard";

export default function Shop() {
  const [search, setSearch] = useState("");
  const barang = [
    { namaBarang: "Kopi Kapal Api", harga: 1000 },
    { namaBarang: "Rokok", harga: 50000 },
    { namaBarang: "Sandwich", harga: 10000 },
    { namaBarang: "Voucher Makan siang", harga: 25000 },
  ];

  const filteredBarang = barang.filter((item) =>
    `${item.namaBarang} ${item.harga}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleClaim = () => {
    console.log("Claimed!");
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-xl font-semibold text-coal tracking-wide dark:text-paper">Milestone</h1>
          <p className="text-lg font-light tracking-wide text-coal dark:text-paper">
            Collect points from feedback and claim them once the target has been reached.
          </p>

          <LevelProgress
            level={1}
            points={50}
            pointsToNextLevel={50}
            onClaim={handleClaim}
          />
        </div>
        <div className="mt-4 mb-4">
          <h1 className="text-xl font-semibold text-coal tracking-wide dark:text-paper">Karma Shop</h1>
          <p className="text-lg tracking-wide font-light text-coal dark:text-paper">
            Once you accumulate enough karma points, you can redeem them for a variety of payout options.
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
        />

        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBarang.map((item) => (
            <BarangCard
              key={item.namaBarang}
              namaBarang={item.namaBarang}
              harga={item.harga}
            />
          ))}
        </div>
      </div>
    </>
  );
}
