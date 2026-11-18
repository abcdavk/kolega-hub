"use client";

import { useEffect, useState, type FormEvent } from "react";

interface AuthResponse {
  token?: string;
  user?: {
    name: string;
  };
  error?: string;
}

interface AuthFormProps {
  title?: string;
  showLogoutButton?: boolean;
  onSessionChange?: (token: string | null) => void;
}

export default function AuthForm({
  title = "Akun",
  showLogoutButton = true,
  onSessionChange,
}: AuthFormProps) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      onSessionChange?.(token);
    } catch {
      setAuthError("Browser tidak dapat mengakses penyimpanan login.");
      onSessionChange?.(null);
    } finally {
      setIsCheckingSession(false);
    }
  }, [onSessionChange]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const isRegistering = authMode === "register";
      const response = await fetch(isRegistering ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isRegistering ? { name: authName } : {}),
          email: authEmail,
          password: authPassword,
        }),
      });
      const data = (await response.json()) as AuthResponse;
      if (!response.ok) throw new Error(data.error ?? "Gagal masuk.");
      if (!data.token || !data.user) throw new Error("Respons autentikasi tidak valid.");

      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      setReviewerName(data.user.name);
      setAuthPassword("");
      onSessionChange?.(data.token);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Gagal masuk.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  function logout() {
    try {
      localStorage.removeItem("token");
      setAuthToken(null);
      setReviewerName(null);
      setAuthError(null);
      onSessionChange?.(null);
    } catch {
      setAuthError("Gagal menghapus sesi login dari browser.");
    }
  }

  return (
    <section className="mb-6 rounded-lg border border-coal/20 dark:border-paper/20 p-5">
      <h3 className="mb-2 font-medium text-center tracking-wide text-lg">{title}</h3>
      {isCheckingSession ? (
        <p className="text-sm text-coal/60">Memeriksa sesi...</p>
      ) : authToken ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>Login sebagai {reviewerName ?? "akun tersimpan"}.</span>
          {showLogoutButton && (
            <button
              type="button"
              onClick={logout}
              className="underline">
              Keluar
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-3 items-center justify-center text-center flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              aria-pressed={authMode === "login"}
              className={`rounded border px-3 py-1 w-full text-sm ${
                authMode === "login" ? "bg-coal dark:bg-paper text-paper dark:text-coal" : ""
              }`}>
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError(null);
              }}
              aria-pressed={authMode === "register"}
              className={`rounded border px-3 w-full py-1 text-sm ${
                authMode === "register" ? "bg-coal dark:bg-paper text-paper dark:text-coal" : ""
              }`}>
              Daftar
            </button>
          </div>
          <form
            onSubmit={submitAuth}
            className="flex flex-col gap-2">
            {authMode === "register" && (
              <input
                type="text"
                autoComplete="name"
                maxLength={100}
                required
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                placeholder="Nama"
                aria-label="Nama"
                className="rounded border border-coal/30 dark:border-paper/30 bg-transparent px-3 py-2 text-sm"
              />
            )}
            <input
              type="email"
              autoComplete="email"
              required
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="Email"
              aria-label="Email"
              className="rounded border border-coal/30 dark:border-paper/30 bg-transparent px-3 py-2 text-sm"
            />
            <input
              type="password"
              autoComplete={authMode === "register" ? "new-password" : "current-password"}
              minLength={authMode === "register" ? 8 : undefined}
              maxLength={72}
              required
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Password"
              aria-label="Password"
              className="rounded border border-coal/30 dark:border-paper/30 bg-transparent px-3 py-2 text-sm"
            />
            {authError && (
              <p
                role="alert"
                className="text-sm text-red-600">
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="self-start w-full rounded bg-coal dark:bg-paper px-3 py-2 text-sm text-paper dark:text-coal disabled:opacity-60">
              {isAuthenticating ? "Memproses..." : authMode === "register" ? "Daftar" : "Login"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
