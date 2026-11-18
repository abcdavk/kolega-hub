"use client";

import { useCallback, useEffect, useState } from "react";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import {
  faMoon,
  faRightFromBracket,
  faRightToBracket,
  faShoppingCart,
  faSun,
  faUsers,
  faAddressCard as faAddressCardSolid,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "motion/react";
import IconKarma from "../app/icons/karma";
import Link from "next/link";
import AuthForm from "@/components/ui/authForm";
import {
  notifyAuthSessionChange,
  OPEN_AUTH_DIALOG_EVENT,
} from "@/lib/authEvents";

function formatCompactPoints(points: number) {
  const formatValue = (value: number) => value.toFixed(1).replace(/\.0$/, "").replace(".", ",");

  if (points >= 1_000_000) {
    return `${formatValue(points / 1_000_000)}m`;
  }

  if (points >= 1_000) {
    return `${formatValue(points / 1_000)}k`;
  }

  return String(points);
}

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const karmaPoints = 2628;

  const isPeoplePage = pathname === "/";
  const isProfilePage = pathname === "/profile";
  const isShopPage = pathname === "/shop";

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      setIsAuthDialogOpen(!token);
    } catch {
      setIsAuthDialogOpen(true);
      setSessionError("Browser tidak dapat mengakses penyimpanan login.");
    }
  }, []);

  useEffect(() => {
    const openAuthDialog = () => {
      setIsAuthDialogOpen(true);
      setSessionError(null);
    };

    window.addEventListener(OPEN_AUTH_DIALOG_EVENT, openAuthDialog);
    return () => window.removeEventListener(OPEN_AUTH_DIALOG_EVENT, openAuthDialog);
  }, []);

  const handleSessionChange = useCallback((token: string | null) => {
    setAuthToken(token);
    notifyAuthSessionChange(token);
    if (token) {
      setIsAuthDialogOpen(false);
      setSessionError(null);
    }
  }, []);

  // toggle theme handler
  const toggleTheme = () => {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      setAuthToken(null);
      notifyAuthSessionChange(null);
      setSessionError(null);
      setIsAuthDialogOpen(true);
    } catch {
      setSessionError("Gagal menghapus sesi login dari browser.");
    }
  };

  const navItems = [
    {
      href: "/",
      label: "People",
      icon: faUserGroup,
      activeIcon: faUsers,
      active: isPeoplePage,
    },
    {
      href: "/profile",
      label: "Your Profile",
      icon: faAddressCard,
      activeIcon: faAddressCardSolid,
      active: isProfilePage,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-paper dark:bg-coal md:top-16 transition-colors duration-1000 ease-in-out">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
        <a
          href="#"
          className="font-serif text-3xl font-semibold tracking-tight">
          Kolega
        </a>
        <LayoutGroup>
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105 cursor-pointer">
              <FontAwesomeIcon
                icon={isDark ? faSun : faMoon}
                className="text-xl"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={authToken ? logout : () => setIsAuthDialogOpen(true)}
              aria-label={authToken ? "Keluar" : "Login"}
              title={authToken ? "Keluar" : "Login"}
              className="flex h-14 items-center justify-center gap-2 rounded-xl px-3 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <FontAwesomeIcon
                icon={authToken ? faRightFromBracket : faRightToBracket}
                className="text-xl"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{authToken ? "Keluar" : "Login"}</span>
            </button>
          </div>
          <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-paper px-4 py-6 dark:bg-coal md:static md:z-auto md:contents">
            <div className="flex gap-2 font-medium md:flex-none md:justify-start">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}>
                  <motion.div
                    initial={false}
                    animate={{
                      width: item.active ? 170 : 80,
                    }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className={`flex h-14 max-md:min-w-max items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-coal px-4 dark:border-paper group ${
                      item.active ? "bg-coal text-paper shadow-md shadow-black/50 dark:bg-paper dark:text-coal" : ""
                    }`}>
                    {item.href === "/" ? (
                      <>
                        {item.active && (
                          <span className="hidden overflow-hidden whitespace-nowrap md:inline">{item.label}</span>
                        )}
                        {item.active && (
                          <span className="overflow-hidden whitespace-nowrap md:hidden">{item.label}</span>
                        )}

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center group-hover:animate-wiggle">
                          <FontAwesomeIcon
                            icon={item.active ? item.activeIcon : item.icon}
                            className="text-2xl"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center group-hover:animate-wiggle">
                          <FontAwesomeIcon
                            icon={item.active ? item.activeIcon : item.icon}
                            className="text-2xl"
                          />
                        </div>
                        {item.active && (
                          <span className="hidden overflow-hidden whitespace-nowrap md:inline">{item.label}</span>
                        )}
                        {item.active && (
                          <span className="overflow-hidden whitespace-nowrap md:hidden">{item.label}</span>
                        )}
                      </>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
            <Link
              href="/shop"
              aria-label={`Karma points: ${karmaPoints}`}
              className={`flex h-14 items-center gap-3 rounded-xl border-2 border-coal px-4 transition-all duration-500 ease-in-out hover:scale-103 dark:border-paper group md:hidden ${
                isShopPage ? "bg-coal text-paper shadow-md shadow-black/50 dark:bg-paper dark:text-coal" : ""
              }`}>
              {isShopPage && <IconKarma />}
              <span className="font-medium">{formatCompactPoints(karmaPoints)}</span>
            </Link>
            <div className="hidden md:flex flex-1 justify-around gap-2 md:flex-none md:justify-start">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-14 w-14 items-center justify-center rounded-xl hover:rotate-180 transition-transform duration-300 cursor-pointer">
                <FontAwesomeIcon
                  icon={isDark ? faSun : faMoon}
                  className="text-xl"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={authToken ? logout : () => setIsAuthDialogOpen(true)}
                aria-label={authToken ? "Keluar" : "Login"}
                title={authToken ? "Keluar" : "Login"}
                className="flex h-14 items-center justify-center gap-2 rounded-xl px-3 transition-transform duration-300 hover:scale-105 cursor-pointer">
                <FontAwesomeIcon
                  icon={authToken ? faRightFromBracket : faRightToBracket}
                  className="text-xl"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{authToken ? "Keluar" : "Login"}</span>
              </button>
              <Link
                href="/shop"
                className={`flex h-14 max-md:w-14 max-md:justify-center max-md:px-0 items-center gap-3 overflow-clip rounded-xl px-6 transition-all duration-500 ease-in-out hover:scale-103 border-2 border-coal dark:border-paper group ${isShopPage ? "bg-coal text-paper dark:bg-paper dark:text-coal shadow-md shadow-black/50" : ""}`}>
                <div className="flex translate-y-9 flex-col items-center gap-12 transition-transform group-hover:-translate-y-10">
                  <IconKarma />
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="shrink-0 text-2xl"
                  />
                </div>
                <span className="font-medium max-md:hidden">{karmaPoints}</span>
              </Link>
            </div>
          </div>
        </LayoutGroup>
      </nav>
      {sessionError && (
        <p
          role="alert"
          className="mx-auto max-w-7xl px-8 pb-2 text-sm text-red-600">
          {sessionError}
        </p>
      )}
      {isAuthDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-dialog-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsAuthDialogOpen(false);
          }}>
          <div className="w-full max-w-md rounded-2xl bg-paper p-5 text-coal shadow-xl dark:bg-coal dark:text-paper">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2
                id="auth-dialog-title"
                className="font-serif text-2xl font-medium">
                Selamat datang
              </h2>
              <button
                type="button"
                onClick={() => setIsAuthDialogOpen(false)}
                aria-label="Tutup form login"
                className="rounded-lg px-3 py-1 text-sm hover:bg-coal/10 dark:hover:bg-paper/10">
                Tutup
              </button>
            </div>
            <AuthForm
              title="Login atau Register"
              onSessionChange={handleSessionChange}
            />
          </div>
        </div>
      )}
    </header>
  );
}
