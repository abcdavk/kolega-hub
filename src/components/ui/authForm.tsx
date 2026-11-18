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
    <section>
      <h3 className="mb-4 text-center text-sm font-medium tracking-wide text-coal-lighter dark:text-paper-darker">{title}</h3>
      {isCheckingSession ? (
        <p className="text-sm text-coal/60">Memeriksa sesi...</p>
      ) : authToken ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-coal/5 p-4 text-sm dark:bg-paper/5">
          <span>Login sebagai {reviewerName ?? "akun tersimpan"}.</span>
          {showLogoutButton && (
            <button
              type="button"
              onClick={logout}
              className="font-medium underline underline-offset-4">
              Keluar
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-1 rounded-xl bg-coal/5 p-1 dark:bg-paper/5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              aria-pressed={authMode === "login"}
              className={`h-10 w-full rounded-lg px-3 text-sm font-medium transition-colors ${
                authMode === "login"
                  ? "bg-paper text-coal shadow-sm dark:bg-coal dark:text-paper"
                  : "text-coal-lighter hover:text-coal dark:text-paper-darker dark:hover:text-paper"
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
              className={`h-10 w-full rounded-lg px-3 text-sm font-medium transition-colors ${
                authMode === "register"
                  ? "bg-paper text-coal shadow-sm dark:bg-coal dark:text-paper"
                  : "text-coal-lighter hover:text-coal dark:text-paper-darker dark:hover:text-paper"
              }`}>
              Daftar
            </button>
          </div>
          <form
            onSubmit={submitAuth}
            className="flex flex-col gap-3">
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
                className="h-12 rounded-xl bg-coal/5 px-4 text-sm outline-none transition-shadow placeholder:text-coal-lighter/70 focus:ring-2 focus:ring-coal/20 dark:bg-paper/5 dark:placeholder:text-paper-darker/70 dark:focus:ring-paper/20"
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
              className="h-12 rounded-xl bg-coal/5 px-4 text-sm outline-none transition-shadow placeholder:text-coal-lighter/70 focus:ring-2 focus:ring-coal/20 dark:bg-paper/5 dark:placeholder:text-paper-darker/70 dark:focus:ring-paper/20"
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
              className="h-12 rounded-xl bg-coal/5 px-4 text-sm outline-none transition-shadow placeholder:text-coal-lighter/70 focus:ring-2 focus:ring-coal/20 dark:bg-paper/5 dark:placeholder:text-paper-darker/70 dark:focus:ring-paper/20"
            />
            {authError && (
              <p
                role="alert"
                className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="mt-1 h-12 w-full rounded-xl bg-coal px-4 text-sm font-semibold text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-paper dark:text-coal">
              {isAuthenticating ? "Memproses..." : authMode === "register" ? "Daftar" : "Login"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
