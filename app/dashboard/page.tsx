"use client";

import React from "react";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const MODULE_PERFORMANCE_DATA = [
  { module: "Data Structures", avgScore: 78, clearance: 88 },
  { module: "Algorithms", avgScore: 84, clearance: 92 },
  { module: "System Design", avgScore: 72, clearance: 80 },
  { module: "Neural Networks", avgScore: 91, clearance: 96 },
  { module: "Cloud Infra", avgScore: 86, clearance: 89 },
];

const WEEKLY_TREND_DATA = [
  { week: "W1", attendance: 95, submissions: 90 },
  { week: "W2", attendance: 92, submissions: 88 },
  { week: "W3", attendance: 89, submissions: 85 },
  { week: "W4", attendance: 94, submissions: 92 },
  { week: "W5", attendance: 91, submissions: 95 },
  { week: "W6", attendance: 96, submissions: 98 },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8 pb-16">
      {/* 1. Quick KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Avg Trainee Score
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs inline-flex items-center">
              +4.2% <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">84.6%</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: "84.6%" }}
            />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Attendance Rate
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
              Target: 85%
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">91.8%</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: "91.8%" }}
            />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Assignment Clearance
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
              Active
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">142 / 160</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: "88.7%" }}
            />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Trainer Efficacy
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">
              Top Tier
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">4.85 / 5.0</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: "97%" }}
            />
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Performance Area Chart */}
        <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Module Performance &amp; Clearance Rates
            </h3>
            <p className="text-xs text-slate-500">
              Average assessment score by subject
            </p>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MODULE_PERFORMANCE_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="scoreGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  name="Avg Score (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Attendance vs Submissions Bar Chart */}
        <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Weekly Engagement Trend
            </h3>
            <p className="text-xs text-slate-500">
              Attendance consistency vs timely assignment submissions
            </p>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={WEEKLY_TREND_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="attendance"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  name="Attendance %"
                />
                <Bar
                  dataKey="submissions"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  name="Submissions %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
