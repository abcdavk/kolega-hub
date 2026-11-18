"use client";

import { useState } from "react";
import IconKarma from "../../app/icons/karma";
import BuyConfirmPopup from "./buyConfirmPopup";

interface Barangprops {
  namaBarang: string;
  harga: number;
  stock: number;
  imageUrl?: string | null;
  disabled?: boolean;
  onExchange: () => void;
}

export default function BarangCard({
  namaBarang,
  harga,
  stock,
  imageUrl,
  disabled = false,
  onExchange,
}: Barangprops) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-coal dark:bg-paper p-3 gap-2">
      <div className="flex h-35 w-full items-center justify-center overflow-hidden rounded-xl bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={namaBarang}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-coal/50">{namaBarang}</span>
        )}
      </div>

      <h2 className="text-2xl font-medium tracking-wide text-paper dark:text-coal">{namaBarang}</h2>
      <p className="text-xs text-paper/70 dark:text-coal/70">Stok: {stock}</p>
      <button
        type="button"
        onClick={onExchange}
        disabled={disabled || stock < 1}
        className="mt-auto w-full h-12 flex rounded-lg bg-paper dark:bg-coal items-center px-4 text-md hover:scale-102 hover:translate-y-1 transition-transform duration-300 ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 group overflow-clip">
        <p className="text-coal dark:text-paper tracking-wide font-medium text-lg">Exchange</p>
        <div className="ml-auto flex items-center gap-1">
          <div className="flex flex-col gap-4 translate-y-15 group-hover:-translate-y-25 transition-transform duration-1000 ease-out">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <IconKarma
                key={index}
                className="block h-6 w-6 bg-coal/50 dark:bg-paper/50"
              />
            ))}
          </div>
          <p className="text-coal dark:text-paper font-medium">{harga}</p>
        </div>
      </button>
    </div>
  );
}
