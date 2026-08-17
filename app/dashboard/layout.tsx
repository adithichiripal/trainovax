"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  UserCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trainers", href: "/dashboard/trainers", icon: Users },
  { label: "Trainees", href: "/dashboard/trainees", icon: GraduationCap },
  { label: "Attendance", href: "/dashboard/attendance", icon: UserCheck },
  { label: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const emptySubscribe = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-between px-2">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white shadow-md shadow-blue-500/20">
                  T
                </div>
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Trainova<span className="text-blue-600">X</span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  isHydrated &&
                  (pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}`)));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? "bg-blue-50 text-sky-600 font-bold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? "text-sky-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200/80 pt-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search records..."
                className="w-64 rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-4 text-xs font-medium focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <button className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
