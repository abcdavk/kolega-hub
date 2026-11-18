"use client";

import { useCallback, useEffect, useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import LevelProgress from "@/components/ui/LevelProgress";
import ClaimPopUp from "@/components/ui/claimPopup";
import BarangCard from "@/components/shop/barangCard";
import {
  AUTH_SESSION_CHANGE_EVENT,
  notifyAuthSessionChange,
  requestAuthDialog,
} from "@/lib/authEvents";

interface MeUser {
  karma_balance: number;
  feedback_exp: number;
}

interface ShopItem {
  id: number;
  name: string;
  image_url: string | null;
  point_cost: number;
  stock: number;
}

interface Milestone {
  id: number;
  level: number;
  target_points: number;
  reward_karma: number;
  is_claimed?: number;
  is_assigned?: number;
}

interface Redemption {
  id: number;
  item_name: string;
  points_spent: number;
  status: "pending" | "completed" | "cancelled";
  redeemed_at: string;
}

export default function Shop() {
  const [search, setSearch] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [claimConfirmation, setClaimConfirmation] = useState<Milestone | null>(null);
  const [selectedExchangeItem, setSelectedExchangeItem] = useState<ShopItem | null>(null);
  const [voucherCodes, setVoucherCodes] = useState<Record<number, string>>({});
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [isVoucherRevealed, setIsVoucherRevealed] = useState(false);
  const [isVoucherCopied, setIsVoucherCopied] = useState(false);

  const generateVoucherCode = () => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    return `KLG-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
  };

  const loadProtectedData = useCallback(async (token: string | null) => {
    if (!token) {
      setMe(null);
      setRedemptions([]);
      const response = await fetch("/api/milestones", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat milestone.");
      if (Array.isArray(data.milestones)) setMilestones(data.milestones);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const [meResponse, milestonesResponse, redemptionsResponse] = await Promise.all([
      fetch("/api/me", { headers, cache: "no-store" }),
      fetch("/api/milestones", { headers, cache: "no-store" }),
      fetch("/api/redemptions", { headers, cache: "no-store" }),
    ]);
    const meData = await meResponse.json();
    const milestonesData = await milestonesResponse.json();
    const redemptionsData = await redemptionsResponse.json();
    if (!meResponse.ok) throw new Error(meData.error ?? "Gagal memuat profil.");
    if (!milestonesResponse.ok) throw new Error(milestonesData.error ?? "Gagal memuat milestone.");
    if (!redemptionsResponse.ok) throw new Error(redemptionsData.error ?? "Gagal memuat riwayat penukaran.");
    setMe(meData.user);
    if (Array.isArray(milestonesData.milestones)) setMilestones(milestonesData.milestones);
    if (Array.isArray(redemptionsData.redemptions)) setRedemptions(redemptionsData.redemptions);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let token: string | null = null;
    try {
      token = localStorage.getItem("token");
      setAuthToken(token);
    } catch {
      setError("Browser tidak dapat mengakses penyimpanan login.");
    }

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const itemsResponse = await fetch("/api/shop-items", {
          cache: "no-store",
          signal: controller.signal,
        });
        const itemsData = await itemsResponse.json();
        if (!itemsResponse.ok) throw new Error(itemsData.error ?? "Gagal memuat item toko.");
        if (!Array.isArray(itemsData.items)) throw new Error("Data item toko tidak valid.");
        setItems(itemsData.items);

        if (token) {
          const [meResponse, milestonesResponse, redemptionsResponse] = await Promise.all([
            fetch("/api/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal }),
            fetch("/api/milestones", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal }),
            fetch("/api/redemptions", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal }),
          ]);
          const meData = await meResponse.json();
          const milestonesData = await milestonesResponse.json();
          const redemptionsData = await redemptionsResponse.json();
          if (!meResponse.ok) throw new Error(meData.error ?? "Gagal memuat profil.");
          if (!milestonesResponse.ok) throw new Error(milestonesData.error ?? "Gagal memuat milestone.");
          if (!redemptionsResponse.ok) throw new Error(redemptionsData.error ?? "Gagal memuat riwayat penukaran.");
          setMe(meData.user);
          if (Array.isArray(milestonesData.milestones)) setMilestones(milestonesData.milestones);
          if (Array.isArray(redemptionsData.redemptions)) setRedemptions(redemptionsData.redemptions);
        } else {
          const milestonesResponse = await fetch("/api/milestones", {
            cache: "no-store",
            signal: controller.signal,
          });
          const milestonesData = await milestonesResponse.json();
          if (!milestonesResponse.ok) throw new Error(milestonesData.error ?? "Gagal memuat milestone.");
          if (Array.isArray(milestonesData.milestones)) setMilestones(milestonesData.milestones);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat toko.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleSessionChange = (event: WindowEventMap[typeof AUTH_SESSION_CHANGE_EVENT]) => {
      setAuthToken(event.detail);
      setSuccess(null);
      void loadProtectedData(event.detail).catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Gagal memuat saldo.");
      });
    };
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
    return () => window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
  }, [loadProtectedData]);

  const filteredBarang = items.filter((item) =>
    `${item.name} ${item.point_cost}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const currentMilestone =
    milestones.find((milestone) => milestone.is_claimed !== 1) ??
    milestones[milestones.length - 1];

  async function handleClaim(milestone: Milestone) {
    if (!authToken) {
      requestAuthDialog();
      return;
    }
    setIsActing(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/milestones/${milestone.id}/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal mengklaim milestone.");
      setMilestones((current) =>
        current.map((item) => item.id === milestone.id ? { ...item, is_claimed: 1 } : item),
      );
      setMe((current) =>
        current
          ? { ...current, karma_balance: current.karma_balance + milestone.reward_karma }
          : current,
      );
      setClaimConfirmation({
        ...milestone,
        reward_karma: Number(data.reward_karma ?? milestone.reward_karma),
      });
      notifyAuthSessionChange(authToken);
      await loadProtectedData(authToken);
      setSuccess(`Milestone level ${milestone.level} berhasil diklaim.`);
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Gagal mengklaim milestone.");
    } finally {
      setIsActing(false);
    }
  }

  async function handleExchange(item: ShopItem) {
    if (!authToken) {
      requestAuthDialog();
      return;
    }
    setIsActing(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/redemptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ item_id: item.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal menukarkan item.");
      const newVoucherCode = generateVoucherCode();
      const redemptionId = Number(data.redemption?.id);
      if (Number.isSafeInteger(redemptionId) && redemptionId > 0) {
        setVoucherCodes((current) => ({ ...current, [redemptionId]: newVoucherCode }));
      }
      setItems((current) =>
        current.map((shopItem) => shopItem.id === item.id ? { ...shopItem, stock: shopItem.stock - 1 } : shopItem),
      );
      setMe((current) =>
        current
          ? { ...current, karma_balance: Math.max(0, current.karma_balance - item.point_cost) }
          : current,
      );
      setVoucherCode(newVoucherCode);
      setIsVoucherRevealed(false);
      notifyAuthSessionChange(authToken);
      setSuccess(`${item.name} berhasil ditukarkan.`);
    } catch (exchangeError) {
      setError(exchangeError instanceof Error ? exchangeError.message : "Gagal menukarkan item.");
    } finally {
      setIsActing(false);
    }
  }

  function openExchangeConfirmation(item: ShopItem) {
    if (!authToken) {
      requestAuthDialog();
      return;
    }
    setVoucherCode(null);
    setIsVoucherRevealed(false);
    setIsVoucherCopied(false);
    setSelectedExchangeItem(item);
  }

  function openRedemptionVoucher(redemption: Redemption) {
    const code = voucherCodes[redemption.id] ?? generateVoucherCode();
    setVoucherCodes((current) => ({ ...current, [redemption.id]: code }));
    setSelectedExchangeItem({
      id: redemption.id,
      name: redemption.item_name,
      image_url: null,
      point_cost: redemption.points_spent,
      stock: 0,
    });
    setVoucherCode(code);
    setIsVoucherRevealed(false);
    setIsVoucherCopied(false);
  }

  function closeExchangePopup() {
    if (isActing) return;
    setSelectedExchangeItem(null);
    setVoucherCode(null);
    setIsVoucherRevealed(false);
    setIsVoucherCopied(false);
  }

  async function handleVoucherClick() {
    if (!isVoucherRevealed) {
      setIsVoucherRevealed(true);
      setIsVoucherCopied(false);
      return;
    }

    if (!voucherCode) return;
    try {
      await navigator.clipboard.writeText(voucherCode);
      setIsVoucherCopied(true);
    } catch {
      setError("Voucher tidak dapat disalin ke clipboard.");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-xl font-semibold text-coal tracking-wide dark:text-paper">Milestone</h1>
          <p className="text-lg font-light tracking-wide text-coal dark:text-paper">
            Collect points from feedback and claim them once the target has been reached.
          </p>

          {currentMilestone && (
            <LevelProgress
              key={currentMilestone.id}
              level={currentMilestone.level}
              points={me?.feedback_exp ?? 0}
              pointsToNextLevel={currentMilestone.target_points}
              onClaim={
                !isActing &&
                currentMilestone.is_claimed !== 1 &&
                (me?.feedback_exp ?? 0) >= currentMilestone.target_points
                  ? () => handleClaim(currentMilestone)
                  : undefined
              }
            />
          )}
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
              key={item.id}
              namaBarang={item.name}
              harga={item.point_cost}
              stock={item.stock}
              imageUrl={item.image_url}
              disabled={isActing || (authToken ? (me?.karma_balance ?? 0) < item.point_cost : false)}
              onExchange={() => openExchangeConfirmation(item)}
            />
          ))}
        </div>
        {isLoading && <p className="text-sm text-coal/60 dark:text-paper/60">Memuat toko...</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {success && <p role="status" className="text-sm text-green-700">{success}</p>}
        {authToken && redemptions.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-coal dark:text-paper">Riwayat Penukaran</h2>
            <div className="grid gap-2">
              {redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-coal/20 px-3 py-2 text-sm dark:border-paper/20">
                  <span className="text-coal dark:text-paper">{redemption.item_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-coal-lighter dark:text-paper-darker">
                      {redemption.points_spent} karma
                    </span>
                    <a
                      href={`#voucher-${redemption.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        openRedemptionVoucher(redemption);
                      }}
                      className="cursor-pointer text-coal underline underline-offset-2 dark:text-paper">
                      Cek Voucher
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {claimConfirmation && (
        <ClaimPopUp
          level={claimConfirmation.level}
          rewardKarma={claimConfirmation.reward_karma}
          onClose={() => setClaimConfirmation(null)}
        />
      )}
      {selectedExchangeItem && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exchange-popup-title">
          <div className="w-full max-w-md rounded-2xl bg-paper p-5 text-coal shadow-xl dark:bg-coal dark:text-paper">
            {voucherCode ? (
              <div className="flex flex-col items-center text-center">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-coal-lighter dark:text-paper-darker">
                  Penukaran Berhasil
                </p>
                <h2
                  id="exchange-popup-title"
                  className="font-serif text-2xl font-semibold">
                  {selectedExchangeItem.name}
                </h2>
                <button
                  type="button"
                  onClick={handleVoucherClick}
                  aria-label={isVoucherRevealed ? "Kode voucher" : "Buka voucher"}
                  className={`mt-5 flex min-h-36 w-full cursor-pointer items-center justify-center rounded-2xl border-4 border-dashed px-4 py-8 text-center transition-transform duration-300 hover:scale-[1.02] ${
                    isVoucherRevealed
                      ? "border-coal/30 bg-white text-coal dark:border-paper/30 dark:bg-coal dark:text-paper"
                      : "border-paper/30 bg-coal text-paper dark:border-coal/30 dark:bg-paper dark:text-coal"
                  }`}>
                  {isVoucherRevealed ? (
                    <span className="font-mono text-xl font-bold tracking-wider">{voucherCode}</span>
                  ) : (
                    <span className="text-lg font-semibold">Klik untuk membuka voucher</span>
                  )}
                </button>
                {isVoucherRevealed && (
                  <p
                    role="status"
                    className="mt-3 text-sm font-medium text-coal-lighter dark:text-paper-darker">
                    {isVoucherCopied ? "Kode voucher berhasil disalin" : "Klik kode lagi untuk menyalin"}
                  </p>
                )}
                <button
                  type="button"
                  onClick={closeExchangePopup}
                  className="mt-5 h-12 w-full rounded-xl bg-coal text-sm font-semibold text-paper cursor-pointer dark:bg-paper dark:text-coal">
                  Selesai
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-coal-lighter dark:text-paper-darker">
                      Konfirmasi Penukaran
                    </p>
                    <h2
                      id="exchange-popup-title"
                      className="mt-1 font-serif text-2xl font-semibold">
                      {selectedExchangeItem.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeExchangePopup}
                    aria-label="Batalkan penukaran"
                    className="rounded-lg px-2 py-1 text-lg cursor-pointer">
                    ×
                  </button>
                </div>
                <div className="rounded-xl border border-coal/20 p-4 text-sm dark:border-paper/20">
                  <div className="flex justify-between gap-4">
                    <span>Harga hadiah</span>
                    <strong>{selectedExchangeItem.point_cost} karma</strong>
                  </div>
                  <div className="mt-2 flex justify-between gap-4">
                    <span>Saldo saat ini</span>
                    <strong>{me?.karma_balance ?? 0} karma</strong>
                  </div>
                  <div className="mt-2 flex justify-between gap-4">
                    <span>Sisa setelah ditukar</span>
                    <strong>{Math.max(0, (me?.karma_balance ?? 0) - selectedExchangeItem.point_cost)} karma</strong>
                  </div>
                  <div className="mt-2 flex justify-between gap-4">
                    <span>Stok tersedia</span>
                    <strong>{selectedExchangeItem.stock}</strong>
                  </div>
                </div>
                {error && (
                  <p
                    role="alert"
                    className="mt-3 text-sm text-red-600">
                    {error}
                  </p>
                )}
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={closeExchangePopup}
                    disabled={isActing}
                    className="h-12 flex-1 rounded-xl border border-coal/30 text-sm font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 dark:border-paper/30">
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExchange(selectedExchangeItem)}
                    disabled={isActing}
                    className="h-12 flex-1 rounded-xl bg-coal text-sm font-semibold text-paper cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 dark:bg-paper dark:text-coal">
                    {isActing ? "Memproses..." : "Tukar Hadiah"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
