"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  TrendingUp,
  BarChart3,
  Award,
  Target,
  Loader2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Percent,
} from "lucide-react";

interface TraineeMetric {
  id: string;
  full_name: string;
  batch_id: string;
  batch_name: string;
  overall_score: number;
  attendance_rate: number;
}

interface BatchAggregate {
  name: string;
  count: number;
  avgScore: number;
  avgAttendance: number;
  passCount: number;
}

export default function PerformancePage() {
  const [trainees, setTrainees] = useState<TraineeMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function fetchPerformanceData() {
      setLoading(true);
      try {
        const [traineesRes, batchesRes] = await Promise.all([
          supabase
            .from("trainees")
            .select(
              "id, batch_id, overall_score, attendance_rate, profiles(full_name)",
            )
            .order("overall_score", { ascending: false }),
          supabase.from("batches").select("id, batch_name"),
        ]);

        if (traineesRes.error) throw traineesRes.error;

        const batchMap = new Map<string, string>();
        (batchesRes.data || []).forEach((b: Record<string, unknown>) => {
          batchMap.set(String(b.id), String(b.batch_name || "Unnamed Batch"));
        });

        if (isMounted) {
          const formatted = (traineesRes.data || []).map(
            (t: Record<string, unknown>) => {
              const profile = (t.profiles || {}) as { full_name?: string };
              const bId = String(t.batch_id || "");
              return {
                id: String(t.id),
                full_name: profile.full_name || "Candidate",
                batch_id: bId,
                batch_name: batchMap.get(bId) || "Unassigned",
                overall_score: Number(t.overall_score || 0),
                attendance_rate: Number(t.attendance_rate || 100),
              };
            },
          );

          setTrainees(formatted);
        }
      } catch (err) {
        console.error("Error loading performance analytics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPerformanceData();

    return () => {
      isMounted = false;
    };
  }, []);

  const batchList = useMemo(() => {
    const list = Array.from(new Set(trainees.map((t) => t.batch_name)));
    return ["All", ...list];
  }, [trainees]);

  const filtered = useMemo(() => {
    return selectedBatch === "All"
      ? trainees
      : trainees.filter((t) => t.batch_name === selectedBatch);
  }, [trainees, selectedBatch]);

  // High-level KPI Telemetry
  const stats = useMemo(() => {
    if (!filtered.length) {
      return {
        avgScore: 0,
        avgAttendance: 0,
        high: 0,
        low: 0,
        passRate: 0,
        passCount: 0,
      };
    }
    const scores = filtered.map((t) => t.overall_score);
    const attendances = filtered.map((t) => t.attendance_rate);

    const avgScore = Number(
      (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
    );
    const avgAttendance = Number(
      (attendances.reduce((a, b) => a + b, 0) / attendances.length).toFixed(1),
    );
    const high = Math.max(...scores);
    const low = Math.min(...scores);
    const passCount = scores.filter((s) => s >= 75).length;
    const passRate = Number(((passCount / filtered.length) * 100).toFixed(1));

    return { avgScore, avgAttendance, high, low, passRate, passCount };
  }, [filtered]);

  // Batch Aggregations for Comparison Matrix
  const batchAggregates = useMemo<BatchAggregate[]>(() => {
    const map = new Map<string, TraineeMetric[]>();
    trainees.forEach((t) => {
      const arr = map.get(t.batch_name) || [];
      arr.push(t);
      map.set(t.batch_name, arr);
    });

    return Array.from(map.entries()).map(([name, list]) => {
      const scores = list.map((l) => l.overall_score);
      const attendances = list.map((l) => l.attendance_rate);
      const avgScore = Number(
        (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      );
      const avgAttendance = Number(
        (attendances.reduce((a, b) => a + b, 0) / attendances.length).toFixed(
          1,
        ),
      );
      const passCount = scores.filter((s) => s >= 75).length;

      return {
        name,
        count: list.length,
        avgScore,
        avgAttendance,
        passCount,
      };
    });
  }, [trainees]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-rose-400/20 border border-white/70 shadow-lg shadow-orange-500/5 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white text-xs font-semibold text-amber-700 mb-2 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Telemetry & Scoring</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Performance & Talent Analytics
          </h1>
          <p className="text-sm text-slate-600">
            Benchmark scoring, passing criteria (&ge;75%), and cohort health
            metrics.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="w-full md:w-56">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-2xl bg-white/80 border border-white backdrop-blur-md text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {batchList.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Cohorts" : b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Cohort Average Score
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">
            {loading ? "..." : `${stats.avgScore}%`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Benchmark Pass Rate
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-2">
            {loading ? "..." : `${stats.passRate}%`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.passCount} of {filtered.length} candidates cleared
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Avg. Attendance
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-400 text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-800 mt-2">
            {loading ? "..." : `${stats.avgAttendance}%`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Score Spread (High / Low)
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-sm">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">
            {loading ? "..." : `${stats.high}% / ${stats.low}%`}
          </div>
        </div>
      </div>

      {/* Cohort Comparison Matrix */}
      <div className="p-6 rounded-3xl bg-white/70 border border-white/90 backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Cross-Cohort Comparison Matrix
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {batchAggregates.length} Active Batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Batch Name</th>
                <th className="pb-3 px-3">Enrolled</th>
                <th className="pb-3 px-3">Avg. Score</th>
                <th className="pb-3 px-3">Avg. Attendance</th>
                <th className="pb-3 px-3">Cleared (&ge;75%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {batchAggregates.map((b) => (
                <tr
                  key={b.name}
                  className="hover:bg-white/50 transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {b.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {b.count}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold ${
                        b.avgScore >= 80
                          ? "text-emerald-700"
                          : b.avgScore >= 70
                            ? "text-amber-700"
                            : "text-rose-700"
                      }`}
                    >
                      {b.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {b.avgAttendance}%
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      {b.passCount} / {b.count}
                      {b.passCount === b.count && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Trainee Telemetry */}
      <div className="p-6 rounded-3xl bg-white/70 border border-white/90 backdrop-blur-xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800">
          Candidate Score & Telemetry Breakdown
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No candidate data available for this selection.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((t) => {
              const score = t.overall_score;
              const barColor =
                score >= 85
                  ? "bg-emerald-500"
                  : score >= 75
                    ? "bg-sky-500"
                    : score >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500";

              return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-white/50 border border-slate-100/80 space-y-2.5 hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {t.full_name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {t.batch_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">
                        Attendance:{" "}
                        <strong className="text-slate-700">
                          {t.attendance_rate}%
                        </strong>
                      </span>
                      <span className="font-extrabold text-slate-800">
                        {score}%
                      </span>
                      {score < 75 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Needs Attention
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Award className="w-3 h-3" /> Passing
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
