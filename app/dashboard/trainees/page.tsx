"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import {
  Users,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Trash2,
  X,
  Mail,
  GraduationCap,
  Award,
} from "lucide-react";

interface TraineeItem {
  id: string;
  full_name: string;
  email: string;
  reg_number: string | null;
  batch_id: string | null;
  batch_name: string;
  overall_score: number;
  attendance_rate: number;
  is_trainee_of_the_month?: boolean;
}

interface BatchOption {
  id: string;
  batch_name: string;
}

export default function TraineesDirectoryPage() {
  const [trainees, setTrainees] = useState<TraineeItem[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  // Add Candidate Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRegNo, setNewRegNo] = useState("");
  const [newBatchId, setNewBatchId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [traineesRes, batchesRes] = await Promise.all([
          supabase
            .from("trainees")
            .select(
              "id, reg_number, batch_id, overall_score, attendance_rate, profiles(full_name, email), batches(batch_name)",
            )
            .order("created_at", { ascending: false }),
          supabase.from("batches").select("id, batch_name").order("batch_name"),
        ]);

        if (traineesRes.error) throw traineesRes.error;

        if (isMounted) {
          const formatted = (traineesRes.data || []).map(
            (t: Record<string, unknown>) => {
              const profile = (t.profiles || {}) as {
                full_name?: string;
                email?: string;
              };
              const batch = (t.batches || {}) as { batch_name?: string };
              return {
                id: String(t.id),
                full_name: profile.full_name || "NA",
                email: profile.email || "NA",
                reg_number: t.reg_number ? String(t.reg_number) : "NA",
                batch_id: t.batch_id ? String(t.batch_id) : null,
                batch_name: batch.batch_name || "Unassigned",
                overall_score: Number(t.overall_score || 0),
                attendance_rate: Number(t.attendance_rate || 100),
              };
            },
          );

          setTrainees(formatted);
          setBatches((batchesRes.data as BatchOption[]) || []);
        }
      } catch (err) {
        console.error("Failed to load candidate list:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const matchSearch =
        t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.reg_number &&
          t.reg_number.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchBatch =
        selectedBatchFilter === "All" || t.batch_name === selectedBatchFilter;
      return matchSearch && matchBatch;
    });
  }, [trainees, searchQuery, selectedBatchFilter]);

  const handleCreateTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const newId = crypto.randomUUID();
      const email = newEmail.trim() || `candidate_${Date.now()}@trainovax.io`;

      // 1. Create Profile
      const { error: pErr } = await supabase.from("profiles").insert([
        {
          id: newId,
          full_name: newName.trim(),
          email,
          role: "trainee",
        },
      ]);
      if (pErr) throw pErr;

      // 2. Create Trainee Record
      const { error: tErr } = await supabase.from("trainees").insert([
        {
          id: newId,
          reg_number: newRegNo.trim() || "NA",
          batch_id: newBatchId || null,
          overall_score: 85,
          attendance_rate: 100,
        },
      ]);
      if (tErr) throw tErr;

      setIsModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewRegNo("");
      setNewBatchId("");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to add candidate:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrainee = async (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await supabase.from("trainees").delete().eq("id", id);
      await supabase.from("profiles").delete().eq("id", id);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete candidate:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-500/20 via-sky-400/20 to-indigo-500/20 border border-white/80 shadow-lg shadow-blue-500/5 backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white text-xs font-semibold text-blue-900 mb-2 shadow-sm">
            <Users className="w-3.5 h-3.5" />
            <span>Enrolled Candidates</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Trainees Directory
          </h1>
          <p className="text-sm text-slate-600">
            Select any candidate to view and edit their full academic & hostel
            portal profile.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name, email, or register number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-white/90 backdrop-blur-md text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-white/90 backdrop-blur-md text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Cohort Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.batch_name}>
                {b.batch_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainees Grid with Direct Links */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredTrainees.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-md">
          <p className="text-sm font-semibold text-slate-500">
            No candidates found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainees.map((trainee) => (
            <Link
              key={trainee.id}
              href={`/dashboard/trainees/${trainee.id}`}
              className="group block p-6 rounded-3xl bg-white/70 border border-white/90 backdrop-blur-xl shadow-sm hover:shadow-xl hover:border-blue-300 hover:scale-[1.01] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md group-hover:scale-105 transition-transform">
                  {trainee.full_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) =>
                      handleDeleteTrainee(e, trainee.id, trainee.full_name)
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Candidate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {trainee.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    Reg: {trainee.reg_number}
                  </span>
                  <span className="truncate">{trainee.batch_name}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs flex items-center justify-between text-slate-600">
                <span>
                  Score:{" "}
                  <strong className="text-emerald-700">
                    {trainee.overall_score}%
                  </strong>
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-1">
                  View Profile &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Trainee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white/95 border border-white backdrop-blur-2xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Add New Trainee
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrainee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adithi Chiripal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Register Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 23BCE7073"
                  value={newRegNo}
                  onChange={(e) => setNewRegNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. trainee@trainovax.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Assign Batch
                </label>
                <select
                  value={newBatchId}
                  onChange={(e) => setNewBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned Cohort</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
