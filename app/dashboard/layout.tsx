"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FolderLock,
  TrendingUp,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<"Admin" | "Trainer" | "Trainee">(
    "Admin",
  );

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Trainer", "Trainee"],
    },
    {
      label: "Batches",
      href: "/dashboard/batches",
      icon: Layers,
      roles: ["Admin", "Trainer"],
    },
    {
      label: "Trainers",
      href: "/dashboard/trainers",
      icon: Users,
      roles: ["Admin"],
    },
    {
      label: "Trainees",
      href: "/dashboard/trainees",
      icon: GraduationCap,
      roles: ["Admin", "Trainer"],
    },
    {
      label: "Performance",
      href: "/dashboard/performance",
      icon: TrendingUp,
      roles: ["Admin", "Trainer", "Trainee"],
    },
    {
      label: "Document Vault",
      href: "/dashboard/vault",
      icon: FolderLock,
      roles: ["Admin", "Trainer", "Trainee"],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(activeRole),
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50/50 to-teal-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/40 bg-white/60 backdrop-blur-xl flex flex-col justify-between p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 rounded-2xl bg-gradient-to-r from-sky-400/20 to-blue-500/20 border border-white/60 shadow-inner">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent">
                TrainovaX
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                Talent Analytics Suite
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white/80 text-sky-700 shadow-sm border border-white/80 font-semibold"
                      : "text-slate-600 hover:bg-white/40 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-sky-600" : "text-slate-400"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Role Switcher Widget */}
        <div className="p-3 rounded-2xl bg-white/50 border border-white/60 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 mb-2 px-1 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Active RBAC Persona</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-1 rounded-xl">
            {(["Admin", "Trainer", "Trainee"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`text-[11px] font-semibold py-1 rounded-lg transition-all ${
                  activeRole === role
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Executive Header */}
        <header className="h-16 border-b border-white/40 bg-white/40 backdrop-blur-md px-8 flex items-center justify-between shadow-[0_4px_20px_0_rgba(31,38,135,0.03)]">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Enterprise Workspace
            </h2>
            <p className="text-xs text-slate-500">
              Session Mode:{" "}
              <span className="font-semibold text-sky-700">{activeRole}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs">
              {activeRole[0]}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
