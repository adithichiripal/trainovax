"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  Filter,
  Search,
  BarChart3,
  Edit3,
  Calendar,
  Layers,
  ArrowUpRight,
  UserCheck,
  RefreshCw,
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

interface TraineeItem {
  id: string;
  application_number: string | null;
  batch_name: string | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface AttendanceRecord {
  id: string;
  trainee_id: string;
  batch_name: string;
  session_date: string;
  subject_code: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  remarks: string | null;
  trainees?: {
    application_number: string | null;
    profiles?: { full_name: string; email: string } | null;
  } | null;
}

export default function AttendanceHubPage() {
  const [viewMode, setViewMode] = useState<"analytics" | "mark">("analytics");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Data collections
  const [allTrainees, setAllTrainees] = useState<TraineeItem[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  // Session Marking States
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [subjectCode, setSubjectCode] = useState("CS602");
  const [sessionTitle, setSessionTitle] = useState("Neural Networks Lab");
  const [searchQuery, setSearchQuery] = useState("");

  // Status mapping for marking mode: { [traineeId]: { status, remarks } }
  const [statusMap, setStatusMap] = useState<
    Record<
      string,
      { status: "Present" | "Absent" | "Late" | "Excused"; remarks: string }
    >
  >({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [traineesRes, recordsRes] = await Promise.all([
        supabase
          .from("trainees")
          .select(
            "id, application_number, batch_name, profiles(full_name, email)",
          )
          .order("application_number", { ascending: true }),
        supabase
          .from("trainee_attendance_records")
          .select(
            "id, trainee_id, batch_name, session_date, subject_code, status, remarks, trainees(application_number, profiles(full_name, email))",
          )
          .order("session_date", { ascending: false }),
      ]);

      const trainees = (traineesRes.data as unknown as TraineeItem[]) || [];
      const records = (recordsRes.data as unknown as AttendanceRecord[]) || [];

      setAllTrainees(trainees);
      setAttendanceRecords(records);

      // Extract unique batch names from trainees & existing logs
      const rawBatches = [
        ...trainees.map((t) => t.batch_name),
        ...records.map((r) => r.batch_name),
      ].filter(Boolean) as string[];

      const uniqueBatches = Array.from(
        new Set(rawBatches.map((b) => b.trim())),
      ).filter(Boolean);
      const finalBatches =
        uniqueBatches.length > 0
          ? uniqueBatches
          : ["Batch-Alpha", "Batch-Beta"];

      setAvailableBatches(finalBatches);
      setSelectedBatch((prev) =>
        prev && finalBatches.includes(prev) ? prev : finalBatches[0],
      );
    } catch (err) {
      console.error("Error loading attendance hub:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter trainees belonging to active batch (case-insensitive fallback)
  const currentBatchTrainees = useMemo(() => {
    return allTrainees.filter((t) => {
      const b = (t.batch_name || "").trim().toLowerCase();
      const sel = (selectedBatch || "").trim().toLowerCase();
      return b === sel;
    });
  }, [allTrainees, selectedBatch]);

  // Sync existing session attendance if editing a specific date
  useEffect(() => {
    const map: Record<
      string,
      { status: "Present" | "Absent" | "Late" | "Excused"; remarks: string }
    > = {};

    // Check if attendance already exists for this batch + date
    const existingDateRecords = attendanceRecords.filter(
      (r) => r.batch_name === selectedBatch && r.session_date === sessionDate,
    );

    currentBatchTrainees.forEach((t) => {
      const existing = existingDateRecords.find((r) => r.trainee_id === t.id);
      if (existing) {
        map[t.id] = {
          status: existing.status,
          remarks: existing.remarks || "",
        };
      } else {
        map[t.id] = { status: "Present", remarks: "" };
      }
    });

    setStatusMap(map);
  }, [selectedBatch, sessionDate, currentBatchTrainees, attendanceRecords]);

  const handleStatusChange = (
    traineeId: string,
    status: "Present" | "Absent" | "Late" | "Excused",
  ) => {
    setStatusMap((prev) => ({
      ...prev,
      [traineeId]: {
        status,
        remarks: prev[traineeId]?.remarks || "",
      },
    }));
  };

  const handleRemarksChange = (traineeId: string, remarks: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [traineeId]: {
        status: prev[traineeId]?.status || "Present",
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: "Present" | "Absent" | "Late" | "Excused") => {
    const updated: Record<
      string,
      { status: "Present" | "Absent" | "Late" | "Excused"; remarks: string }
    > = {};
    currentBatchTrainees.forEach((t) => {
      updated[t.id] = {
        status,
        remarks: statusMap[t.id]?.remarks || "",
      };
    });
    setStatusMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (currentBatchTrainees.length === 0) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Upsert/Delete & Insert pattern for selected batch & date
      await supabase
        .from("trainee_attendance_records")
        .delete()
        .eq("batch_name", selectedBatch)
        .eq("session_date", sessionDate);

      const payload = currentBatchTrainees.map((t) => {
        const entry = statusMap[t.id] || { status: "Present", remarks: "" };
        return {
          trainee_id: t.id,
          batch_name: selectedBatch,
          session_date: sessionDate,
          subject_code: subjectCode,
          status: entry.status,
          remarks: entry.remarks || `${sessionTitle} Session`,
        };
      });

      const { error } = await supabase
        .from("trainee_attendance_records")
        .insert(payload);
      if (error) throw error;

      await loadData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Attendance commit error:", err);
      alert("Failed to commit attendance records.");
    } finally {
      setSaving(false);
    }
  };

  // Trainee attendance percentage calculations for Risk Radar (< 75%)
  const traineePerformanceStats = useMemo(() => {
    return currentBatchTrainees.map((trainee) => {
      const logs = attendanceRecords.filter((r) => r.trainee_id === trainee.id);
      const total = logs.length;
      const attended = logs.filter(
        (r) => r.status === "Present" || r.status === "Late",
      ).length;
      const percentage = total > 0 ? (attended / total) * 100 : 100;

      return {
        ...trainee,
        totalSessions: total,
        attendedSessions: attended,
        percentage: Number(percentage.toFixed(1)),
      };
    });
  }, [currentBatchTrainees, attendanceRecords]);

  const defaulters = traineePerformanceStats.filter(
    (t) => t.totalSessions > 0 && t.percentage < 75,
  );

  // Timeline graph data (last 7 recorded dates)
  const timelineGraphData = useMemo(() => {
    const dates = Array.from(
      new Set(attendanceRecords.map((r) => r.session_date)),
    )
      .sort()
      .slice(-7);
    return dates.map((d) => {
      const recordsOnDate = attendanceRecords.filter(
        (r) => r.session_date === d,
      );
      const present = recordsOnDate.filter(
        (r) => r.status === "Present" || r.status === "Late",
      ).length;
      const pct =
        recordsOnDate.length > 0 ? (present / recordsOnDate.length) * 100 : 0;
      return {
        date: d,
        rate: Number(pct.toFixed(1)),
      };
    });
  }, [attendanceRecords]);

  // Batch-wise comparative rates
  const batchComparisonData = useMemo(() => {
    return availableBatches.map((b) => {
      const recs = attendanceRecords.filter((r) => r.batch_name === b);
      const attended = recs.filter(
        (r) => r.status === "Present" || r.status === "Late",
      ).length;
      const rate = recs.length > 0 ? (attended / recs.length) * 100 : 100;
      return {
        batch: b,
        rate: Number(rate.toFixed(1)),
        totalLogs: recs.length,
      };
    });
  }, [availableBatches, attendanceRecords]);

  // Active Marking metrics
  const totalInBatch = currentBatchTrainees.length;
  const presentInForm = currentBatchTrainees.filter(
    (t) => (statusMap[t.id]?.status || "Present") === "Present",
  ).length;
  const lateInForm = currentBatchTrainees.filter(
    (t) => statusMap[t.id]?.status === "Late",
  ).length;
  const absentInForm = currentBatchTrainees.filter(
    (t) =>
      statusMap[t.id]?.status === "Absent" ||
      statusMap[t.id]?.status === "Excused",
  ).length;
  const currentBatchRate =
    totalInBatch > 0
      ? (((presentInForm + lateInForm) / totalInBatch) * 100).toFixed(1)
      : "100.0";

  const filteredRoster = currentBatchTrainees.filter((t) => {
    const name = t.profiles?.full_name?.toLowerCase() || "";
    const app = t.application_number?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || app.includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Attendance Management Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Institutional tracking, session overrides, and cohort analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="p-1 bg-slate-100/90 rounded-2xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode("analytics")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                viewMode === "analytics"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </button>

            <button
              onClick={() => setViewMode("mark")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                viewMode === "mark"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Mark / Update Roster</span>
            </button>
          </div>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cohort Selector Pill */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
          Select Cohort:
        </span>
        {availableBatches.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBatch(b)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedBatch === b
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white/80 border border-slate-200 text-slate-600 hover:bg-white"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* VIEW 1: ANALYTICS & VISUAL METRICS */}
      {viewMode === "analytics" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Cohort Strength
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {currentBatchTrainees.length} Students
              </p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">
                Active in {selectedBatch}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Cumulative Rate
              </span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {batchComparisonData.find((b) => b.batch === selectedBatch)
                  ?.rate || "100.0"}
                %
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Institutional target: 85%
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Low Attendance Alerts
              </span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {defaulters.length}
              </p>
              <p className="text-[11px] text-rose-700 font-semibold mt-1">
                Trainees below 75% threshold
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Recorded Sessions
              </span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {
                  attendanceRecords.filter(
                    (r) => r.batch_name === selectedBatch,
                  ).length
                }
              </p>
              <p className="text-[11px] text-indigo-700 font-semibold mt-1">
                Log entries stored
              </p>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Attendance Chart */}
            <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Historical Attendance Trend
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daily average participation percentage
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                  Last 7 Sessions
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                {timelineGraphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timelineGraphData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="attGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2563eb"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2563eb"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
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
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#attGradient)"
                        name="Attendance Rate (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    No historical records available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Batch Comparison Bar Chart */}
            <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Cohort Comparison Metrics
                  </h3>
                  <p className="text-xs text-slate-500">
                    Overall clearance rates across active batches
                  </p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={batchComparisonData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="batch"
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
                      dataKey="rate"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      name="Batch Attendance (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Low Attendance Risk Alert Radar */}
          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Attendance Risk Radar (&lt; 75% Compliance)
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                {defaulters.length} Defaulters Found
              </span>
            </div>

            {defaulters.length === 0 ? (
              <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
                All enrolled students in {selectedBatch} meet the minimum 75%
                attendance threshold.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {defaulters.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                        {t.application_number}
                      </span>
                      <p className="font-bold text-slate-900 mt-1">
                        {t.profiles?.full_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t.attendedSessions} of {t.totalSessions} sessions
                        attended
                      </p>
                    </div>
                    <span className="text-base font-black text-rose-600">
                      {t.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MARK / UPDATE ROSTER MODE */}
      {viewMode === "mark" && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Editing Roster:{" "}
              <strong className="text-blue-700">{selectedBatch}</strong> on{" "}
              <strong className="text-slate-900">{sessionDate}</strong>
            </span>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes
                  Saved
                </span>
              )}

              <button
                onClick={handleSaveAttendance}
                disabled={saving || currentBatchTrainees.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Roster Changes</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics on Current Roster */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Roster Enrolled
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {totalInBatch}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Marked Present
              </span>
              <p className="text-xl font-black text-emerald-800 mt-1">
                {presentInForm}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Marked Late
              </span>
              <p className="text-xl font-black text-amber-800 mt-1">
                {lateInForm}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Absent / Excused
              </span>
              <p className="text-xl font-black text-rose-800 mt-1">
                {absentInForm}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Session Rate
              </span>
              <p className="text-xl font-black text-blue-800 mt-1">
                {currentBatchRate}%
              </p>
            </div>
          </div>

          {/* Session Parameters */}
          <div className="p-5 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Session Date (Select to Edit)
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  placeholder="CS602"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Topic / Lab Title
                </label>
                <input
                  type="text"
                  placeholder="Neural Networks Lab"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Quick Bulk Marking */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter roster by student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-500 mr-1">
                  Bulk Mark:
                </span>
                <button
                  type="button"
                  onClick={() => handleMarkAll("Present")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll("Late")}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 transition"
                >
                  All Late
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll("Absent")}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 transition"
                >
                  All Absent
                </button>
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="rounded-3xl bg-white/80 border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3.5">Registration ID</th>
                    <th className="p-3.5">Trainee Name</th>
                    <th className="p-3.5 text-center">Status Action</th>
                    <th className="p-3.5">Session Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-slate-400"
                      >
                        No trainees found matching this batch.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((trainee) => {
                      const currentStatus =
                        statusMap[trainee.id]?.status || "Present";
                      const currentRemarks =
                        statusMap[trainee.id]?.remarks || "";

                      return (
                        <tr
                          key={trainee.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {trainee.application_number || "REG: NA"}
                          </td>
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">
                              {trainee.profiles?.full_name || "Trainee"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {trainee.profiles?.email || "NA"}
                            </p>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-1">
                              {(
                                [
                                  "Present",
                                  "Late",
                                  "Absent",
                                  "Excused",
                                ] as const
                              ).map((st) => {
                                const isSelected = currentStatus === st;
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(trainee.id, st)
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                      isSelected
                                        ? st === "Present"
                                          ? "bg-emerald-600 text-white shadow-sm"
                                          : st === "Late"
                                            ? "bg-amber-500 text-white shadow-sm"
                                            : st === "Absent"
                                              ? "bg-rose-600 text-white shadow-sm"
                                              : "bg-indigo-600 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    {st}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <input
                              type="text"
                              placeholder="Session remarks..."
                              value={currentRemarks}
                              onChange={(e) =>
                                handleRemarksChange(trainee.id, e.target.value)
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
