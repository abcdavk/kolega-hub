"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { motion, Reorder, type PanInfo } from "motion/react";
import { faCheck, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RiStarFill, RiStarLine } from "@remixicon/react";
import {
  AUTH_SESSION_CHANGE_EVENT,
  notifyAuthSessionChange,
  requestAuthDialog,
} from "@/lib/authEvents";

type Title = {
  id: number;
  label: string;
  color: string;
};

type Stat = {
  id: string;
  label: string;
};

interface MeUser {
  id: number;
  name: string;
  email: string;
  division: string | null;
  avatar_url: string | null;
  karma_balance: number;
  feedback_exp: number;
}

interface ApiTitle {
  id: number;
  name: string;
  color_hex: string;
}

interface UserTitle extends ApiTitle {
  is_visible: number;
  display_order: number;
}

interface UserSummary {
  avg_technical: number | string | null;
  avg_collaboration: number | string | null;
  avg_problem_solving: number | string | null;
  avg_mentorship: number | string | null;
  avg_overall: number | string | null;
}

interface ProfileReview {
  id: number;
  reviewer_name: string;
  technical_score: number;
  collaboration_score: number;
  problem_solving_score: number;
  mentorship_score: number;
  comment: string | null;
  created_at: string;
}

const stats: Stat[] = [
  { id: "technical", label: "Technical & Execution Skills" },
  { id: "collaboration", label: "Collaboration & Communication" },
  { id: "problemSolving", label: "Problem Solving Under Pressure" },
  { id: "mentorship", label: "Mentorship & Culture Contribution" },
];

const ratingLabel = (rating: number) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Good";
  if (rating >= 2.5) return "Average";
  return "Needs Improvement";
};

export default function Profile() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const nameRef = useRef("");
  const divisionRef = useRef("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [titles, setTitles] = useState<Title[]>([]);
  const [statRatings, setStatRatings] = useState<Record<string, number>>({
    technical: 0,
    collaboration: 0,
    problemSolving: 0,
    mentorship: 0,
  });
  const maxVisibleTitle = 3;
  const [visibleTitleIds, setVisibleTitleIds] = useState<number[]>([]);
  const [titleMessage, setTitleMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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
    void saveVisibleTitles([...visibleTitleIds, id]);
  };

  const removeVisibleTitle = (id: number) => {
    setTitleMessage("");
    void saveVisibleTitles(visibleTitleIds.filter((titleId) => titleId !== id));
  };

  const saveVisibleTitles = async (titleIds: number[]) => {
    setVisibleTitleIds(titleIds);
    setTitleMessage("");
    if (!authToken) return;

    try {
      const response = await fetch("/api/me/titles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title_ids: titleIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan title.");
    } catch (error) {
      setTitleMessage(error instanceof Error ? error.message : "Gagal menyimpan title.");
    }
  };

  const droppedInside = (ref: RefObject<HTMLElement | null>, point: PanInfo["point"]) => {
    const bounds = ref.current?.getBoundingClientRect();
    return (
      bounds !== undefined &&
      point.x >= bounds.left + window.scrollX &&
      point.x <= bounds.right + window.scrollX &&
      point.y >= bounds.top + window.scrollY &&
      point.y <= bounds.bottom + window.scrollY
    );
  };

  const handleAvailableTitleDragEnd = (id: number, info: PanInfo) => {
    if (droppedInside(visibleDropZoneRef, info.point)) addVisibleTitle(id);
  };

  const overallRating =
    Math.floor((stats.reduce((sum, stat) => sum + statRatings[stat.id], 0) / stats.length) * 10) / 10;

  const loadProfile = useCallback(async (token: string | null) => {
    setSessionError(null);
    if (!token) {
      setMe(null);
      setTitles([]);
      setReviews([]);
      setReviewsError(null);
      setName("");
      setDivision("");
      nameRef.current = "";
      divisionRef.current = "";
      setTitles([]);
      setVisibleTitleIds([]);
      setStatRatings({ technical: 0, collaboration: 0, problemSolving: 0, mentorship: 0 });
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const meResponse = await fetch("/api/me", { headers, cache: "no-store" });
      const meData = await meResponse.json();
      if (!meResponse.ok) throw new Error(meData.error ?? "Gagal memuat profil.");
      const profile = meData.user as MeUser;
      setMe(profile);
      setName(profile.name);
      setDivision(profile.division ?? "");
      nameRef.current = profile.name;
      divisionRef.current = profile.division ?? "";

      const [userResponse, reviewsResponse, titlesResponse] = await Promise.all([
        fetch(`/api/users/${profile.id}`, { cache: "no-store" }),
        fetch(`/api/reviews?reviewee_id=${profile.id}`, { cache: "no-store" }),
        fetch("/api/titles", { cache: "no-store" }),
      ]);
      const [userData, reviewsData, titlesData] = await Promise.all([
        userResponse.json(),
        reviewsResponse.json(),
        titlesResponse.json(),
      ]);
      if (!userResponse.ok) throw new Error(userData.error ?? "Gagal memuat data penilaian.");
      if (!titlesResponse.ok) throw new Error(titlesData.error ?? "Gagal memuat title tersedia.");
      if (Array.isArray(titlesData.titles)) {
        setTitles((titlesData.titles as ApiTitle[]).map((title) => ({
          id: title.id,
          label: title.name,
          color: title.color_hex,
        })));
      }
      if (!reviewsResponse.ok) {
        setReviewsError(reviewsData.error ?? "Gagal memuat daftar ulasan.");
      } else if (Array.isArray(reviewsData.reviews)) {
        setReviews(reviewsData.reviews);
        setReviewsError(null);
      }
      const summary = userData.user as UserSummary;
      setStatRatings({
        technical: Number(summary.avg_technical ?? 0),
        collaboration: Number(summary.avg_collaboration ?? 0),
        problemSolving: Number(summary.avg_problem_solving ?? 0),
        mentorship: Number(summary.avg_mentorship ?? 0),
      });

      if (Array.isArray(userData.titles)) {
        setVisibleTitleIds(
          (userData.titles as UserTitle[])
            .filter((title) => title.is_visible === 1)
            .slice(0, maxVisibleTitle)
            .map((title) => title.id),
        );
      }
    } catch (loadError) {
      setSessionError(loadError instanceof Error ? loadError.message : "Gagal memuat profil.");
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const handleSessionChange = (event: WindowEventMap[typeof AUTH_SESSION_CHANGE_EVENT]) => {
      const token = event.detail;
      setAuthToken(token);
      void loadProfile(token);
    };

    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      void loadProfile(token);
    } catch {
      setSessionError("Browser tidak dapat mengakses penyimpanan login.");
      setIsLoadingProfile(false);
    }

    return () => window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
  }, [loadProfile]);

  const logout = () => {
    try {
      localStorage.removeItem("token");
      setAuthToken(null);
      setSessionError(null);
      notifyAuthSessionChange(null);
      requestAuthDialog();
    } catch {
      setSessionError("Gagal menghapus sesi login dari browser.");
    }
  };

  const saveProfileField = async (field: "name" | "division") => {
    if (!authToken) return;
    const value = field === "name" ? name.trim() : division.trim();
    if (field === "name" && !value) {
      setProfileSaveError("Nama wajib diisi.");
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ [field]: value || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan profil.");

      if (field === "name") {
        const savedName = data.name as string;
        setMe((current) => current ? { ...current, name: savedName } : current);
        setName(savedName);
        nameRef.current = savedName;
      } else {
        const savedDivision = data.division as string | null;
        setMe((current) => current ? { ...current, division: savedDivision } : current);
        setDivision(savedDivision ?? "");
        divisionRef.current = savedDivision ?? "";
      }
    } catch (error) {
      setProfileSaveError(error instanceof Error ? error.message : "Gagal menyimpan profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!authToken) return;
    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch("/api/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal mengupload foto profil.");

      setMe((current) => current ? { ...current, avatar_url: data.avatar_url } : current);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Gagal mengupload foto profil.");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!authToken || !me || isLoadingProfile || isSavingProfile || profileSaveError) return;

    const trimmedName = name.trim();
    const trimmedDivision = division.trim();
    if (trimmedName === me.name && trimmedDivision === (me.division ?? "")) return;
    if (!trimmedName) {
      setProfileSaveError("Nama wajib diisi.");
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsSavingProfile(true);
      try {
        const response = await fetch("/api/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ name: trimmedName, division: trimmedDivision }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan profil.");

        const savedName = data.name as string;
        const savedDivision = data.division as string | null;
        setMe((current) => current ? { ...current, name: savedName, division: savedDivision } : current);
        if (nameRef.current.trim() === trimmedName) setName(savedName);
        if (divisionRef.current.trim() === trimmedDivision) setDivision(savedDivision ?? "");
      } catch (error) {
        if (
          nameRef.current.trim() === trimmedName &&
          divisionRef.current.trim() === trimmedDivision
        ) {
          setProfileSaveError(error instanceof Error ? error.message : "Gagal menyimpan profil.");
        }
      } finally {
        setIsSavingProfile(false);
      }
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [authToken, division, isLoadingProfile, isSavingProfile, me, name, profileSaveError]);

  return (
    <section>
      <h2 className="text-coal dark:text-paper text-lg mb-4 font-bold uppercase">Identity</h2>
      {isLoadingProfile && <p className="mb-3 text-sm text-coal-lighter dark:text-paper-darker">Memuat profil...</p>}
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadAvatar(file);
            }}
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={!authToken || isLoadingProfile || isUploadingAvatar}
            aria-label="Upload foto profil"
            className="group relative flex h-full w-40 items-center justify-center overflow-hidden rounded-2xl bg-coal text-paper border border-coal dark:border-paper disabled:cursor-not-allowed dark:bg-paper dark:text-coal">
            {me?.avatar_url ? (
              <img
                src={me.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{me?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PP"}</span>
            )}
            {authToken && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 px-3 text-center text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {isUploadingAvatar ? "Mengupload..." : "Upload Foto"}
              </span>
            )}
          </button>
          {avatarError && (
            <p role="alert" className="max-w-40 text-center text-xs text-red-600">
              {avatarError}
            </p>
          )}
        </div>
        <div className="w-full">
          <p className="mb-2">Your Name</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="name"
              id="name"
              maxLength={100}
              value={name}
              onChange={(event) => {
                nameRef.current = event.target.value;
                setName(event.target.value);
                setProfileSaveError(null);
              }}
              disabled={!authToken || isLoadingProfile}
              className="w-full border border-coal/30 dark:border-paper/30 rounded-lg py-3 px-3 outline-none"
            />
            <button
              type="button"
              onClick={() => void saveProfileField("name")}
              disabled={!authToken || isLoadingProfile || isSavingProfile || name.trim() === me?.name}
              aria-label="Simpan nama"
              title="Simpan nama"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-coal/30 text-coal hover:bg-coal/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-paper/30 dark:text-paper dark:hover:bg-paper/10">
              <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
            </button>
          </div>
          <p className="my-2">Division</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="division"
              id="division"
              maxLength={100}
              value={division}
              onChange={(event) => {
                divisionRef.current = event.target.value;
                setDivision(event.target.value);
                setProfileSaveError(null);
              }}
              disabled={!authToken || isLoadingProfile}
              className="w-full border border-coal/30 dark:border-paper/30 rounded-lg py-3 px-3 outline-none"
            />
            <button
              type="button"
              onClick={() => void saveProfileField("division")}
              disabled={!authToken || isLoadingProfile || isSavingProfile || division.trim() === (me?.division ?? "")}
              aria-label="Simpan division"
              title="Simpan division"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-coal/30 text-coal hover:bg-coal/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-paper/30 dark:text-paper dark:hover:bg-paper/10">
              <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
            </button>
          </div>
          {profileSaveError && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600">
              {profileSaveError}
            </p>
          )}
        </div>
      </div>
      <h2 className="text-coal dark:text-paper text-lg my-4 font-bold uppercase">Your Titles</h2>
      <p className="mb-2 font-medium">
        Visible{" "}
        <span className="text-paper-darker dark:text-coal-lighter">
          ({visibleTitleIds.length}/{maxVisibleTitle})
        </span>
      </p>
      <Reorder.Group
        ref={visibleDropZoneRef}
        axis="x"
        values={visibleTitleIds}
        onReorder={(titleIds) => void saveVisibleTitles(titleIds)}
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
              style={{ rotate: `${rotationForTitle(id)}deg`, backgroundColor: title.color }}
              className="touch-none cursor-grab rounded-lg px-3 py-2 text-coal shadow-sm active:cursor-grabbing">
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
      <p className="mt-5 mb-2 font-medium">Available Titles</p>
      <div
        aria-label="Available titles. Apply a title by dragging it to the visible area or using the apply button."
        role="group"
        className="flex min-h-20 flex-wrap items-center gap-3 rounded-xl border-2 border-dashed border-coal/20 p-3 dark:border-paper/20">
        {titles
          .filter((title) => !visibleTitleIds.includes(title.id))
          .map((title) => (
            <motion.div
              key={title.id}
              drag
              dragMomentum={false}
              dragSnapToOrigin
              onDragEnd={(_, info) => handleAvailableTitleDragEnd(title.id, info)}
              whileDrag={{ scale: 1.05, zIndex: 1 }}
              style={{ rotate: `${rotationForTitle(title.id)}deg`, backgroundColor: title.color }}
              className="touch-none cursor-grab rounded-lg px-3 py-2 text-coal shadow-sm active:cursor-grabbing">
              <span>{title.label}</span>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => addVisibleTitle(title.id)}
                disabled={visibleTitleIds.length >= maxVisibleTitle}
                aria-label={`Apply ${title.label}`}
                className="ml-2 cursor-pointer rounded-full px-1 font-bold hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-50">
                +
              </button>
            </motion.div>
          ))}
        {titles.length > 0 && titles.every((title) => visibleTitleIds.includes(title.id)) && (
          <p className="list-none text-sm text-coal-lighter dark:text-paper-darker">
            All available titles are applied.
          </p>
        )}
        {titles.length === 0 && (
          <p className="list-none text-sm text-coal-lighter dark:text-paper-darker">
            No titles are available right now.
          </p>
        )}
      </div>
      <p
        aria-live="polite"
        className="mt-2 min-h-5 text-sm text-coal-lighter dark:text-paper-darker">
        {titleMessage || "Apply available titles to show them on your profile. You can show up to 3 titles."}
      </p>

      <h2 className="text-coal dark:text-paper text-lg my-4 font-bold uppercase">Your Stats</h2>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        {stats.map((stat) => {
          const rating = statRatings[stat.id];

          return (
            <div key={stat.id}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p>{stat.label}</p>
                <span className="text-coal-lighter dark:text-paper-darker">{rating.toFixed(1)} / 5.0</span>
              </div>
              <div
                role="img"
                aria-label={`${stat.label}: ${rating.toFixed(1)} out of 5`}
                className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isActive = value <= Math.round(rating);
                  const Star = isActive ? RiStarFill : RiStarLine;

                  return (
                    <Star
                      key={value}
                      aria-hidden="true"
                      className={`h-5 w-5 ${isActive ? "text-amber-400" : "text-coal/25 dark:text-paper/25"}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-sm uppercase">Overall Rating</p>
        <div
          className="flex gap-2"
          role="img"
          aria-label={`${overallRating.toFixed(1)} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              viewBox="0 0 24 24"
              className="h-9 w-9 text-coal dark:text-paper"
              fill={star <= Math.floor(overallRating) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round">
              <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
            </svg>
          ))}
        </div>
        <p className="text-sm">
          {overallRating.toFixed(1)} ({ratingLabel(overallRating)})
        </p>
      </div>
      <h2 className="text-coal dark:text-paper text-lg my-4 font-bold uppercase">Ulasan</h2>
      {reviewsError && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {reviewsError}
        </p>
      )}
      {reviews.length === 0 && !reviewsError ? (
        <p className="text-sm text-coal-lighter dark:text-paper-darker">Belum ada ulasan.</p>
      ) : (
        <div className="grid gap-3">
          {reviews.map((review) => {
            const reviewRating =
              (review.technical_score +
                review.collaboration_score +
                review.problem_solving_score +
                review.mentorship_score) /
              4;

            return (
              <article
                key={review.id}
                className="rounded-2xl bg-coal p-4 text-paper dark:bg-paper dark:text-coal">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-semibold">{review.reviewer_name}</h3>
                    <time
                      dateTime={review.created_at}
                      className="text-xs opacity-70">
                      {new Date(review.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <RiStarFill aria-hidden="true" />
                    <span>{reviewRating.toFixed(1)}</span>
                  </div>
                </div>
                {review.comment && <p className="mt-3 whitespace-pre-wrap text-sm">{review.comment}</p>}
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
                  {[
                    ["Technical & Execution Skills", review.technical_score],
                    ["Collaboration & Communication", review.collaboration_score],
                    ["Problem Solving Under Pressure", review.problem_solving_score],
                    ["Mentorship & Culture Contribution", review.mentorship_score],
                  ].map(([label, rating]) => (
                    <div key={label} className="flex justify-between gap-2 opacity-80">
                      <dt>{label}</dt>
                      <dd className="shrink-0 font-semibold">{rating} / 5</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      )}
      {sessionError && (
        <p
          role="alert"
          className="mt-4 text-sm text-red-600">
          {sessionError}
        </p>
      )}
      {authToken && (
        <button
          type="button"
          onClick={logout}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-coal-lighter px-4 text-sm font-medium transition-transform duration-300 hover:scale-[1.02] cursor-pointer dark:border-paper-darker">
          <FontAwesomeIcon
            icon={faRightFromBracket}
            aria-hidden="true"
          />
          Keluar
        </button>
      )}
    </section>
  );
}
