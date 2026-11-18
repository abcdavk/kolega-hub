"use client";

import { useCallback, useEffect, useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import LevelProgress from "@/components/ui/LevelProgress";
import BarangCard from "@/components/shop/barangCard";
import { AUTH_SESSION_CHANGE_EVENT, requestAuthDialog } from "@/lib/authEvents";

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
      setItems((current) =>
        current.map((shopItem) => shopItem.id === item.id ? { ...shopItem, stock: shopItem.stock - 1 } : shopItem),
      );
      await loadProtectedData(authToken);
      setSuccess(`${item.name} berhasil ditukarkan.`);
    } catch (exchangeError) {
      setError(exchangeError instanceof Error ? exchangeError.message : "Gagal menukarkan item.");
    } finally {
      setIsActing(false);
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

          {milestones.map((milestone) => (
            <LevelProgress
              key={milestone.id}
              level={milestone.level}
              points={me?.feedback_exp ?? 0}
              pointsToNextLevel={milestone.target_points}
              onClaim={
                !isActing &&
                milestone.is_claimed !== 1 &&
                milestone.is_assigned === 1 &&
                (me?.feedback_exp ?? 0) >= milestone.target_points
                  ? () => handleClaim(milestone)
                  : undefined
              }
            />
          ))}
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
              onExchange={() => handleExchange(item)}
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
                  <span className="text-coal-lighter dark:text-paper-darker">
                    {redemption.points_spent} karma - {redemption.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
