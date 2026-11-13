"use client";

import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import {
  faShoppingCart,
  faUsers,
  faAddressCard as faAddressCardSolid,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "motion/react";
import IconKarma from "../icons/karma";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();

  const isPeoplePage = pathname === "/";
  const isProfilePage = pathname === "/profile";
  const isShopPage = pathname === "/shop";

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
    <header className="sticky top-16 z-50 w-full bg-paper dark:bg-coal">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
        <a
          href="#"
          className="font-serif text-3xl font-semibold tracking-tight">
          Kolega
        </a>
        <LayoutGroup>
          <div className="flex gap-2 font-medium">
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
                  className={`flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-coal px-4 dark:border-paper group ${
                    item.active ? "bg-coal text-paper shadow-md shadow-black/50 dark:bg-paper dark:text-coal" : ""
                  }`}>
                  {item.href === "/" ? (
                    <>
                      {item.active && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}

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
                      {item.active && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}
                    </>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
          <Link
            href="/shop"
            className={`flex h-14 items-center gap-3 overflow-clip rounded-xl bg-coal px-6 text-paper shadow-md shadow-black/50 transition-all duration-500 ease-in-out hover:scale-103 border-2 border-coal dark:border-paper group ${isShopPage ? "dark:bg-paper dark:text-coal" : ""}`}>
            <div className="flex translate-y-9 flex-col items-center gap-12 transition-transform group-hover:-translate-y-10">
              <IconKarma />
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="shrink-0 text-2xl"
              />
            </div>
            <span className="font-medium">2628</span>
          </Link>
        </LayoutGroup>
      </nav>
    </header>
  );
}
