"use client";

import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  User,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";

import ModuleSwitcher from "./ModuleSwitcher";

type HeaderProps = {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  onMenuClick?: () => void;
};

export default function Header({
  title = "Dashboard",
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  onMenuClick,
}: HeaderProps) {
  const [profileOpen, setProfileOpen] =
    useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">

        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-gray-700 hover:bg-gray-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="hidden items-center gap-2 lg:flex"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              S
            </div>

            <span className="font-semibold text-slate-900">
              Sreshta
            </span>
          </Link>

          <div className="hidden h-6 w-px bg-gray-200 lg:block" />

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-gray-900">
              {title}
            </h1>
          </div>
        </div>

        {/* Center */}
        <div className="hidden flex-1 justify-center lg:flex">
          {showSearch && (
            <div className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-full rounded-lg border bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          <ModuleSwitcher />

          {showNotifications && (
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
          )}

          {showProfile && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (value) => !value,
                  )
                }
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                  <User className="h-4 w-4" />
                </div>

                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-gray-900">
                    Admin
                  </p>

                  <p className="text-xs text-gray-500">
                    Administrator
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-gray-500 md:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl border bg-white p-2 shadow-lg">
                  <Link
                    href="/admin/settings"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    Settings
                  </Link>

                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}