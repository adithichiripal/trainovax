"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Layers, Plus, Calendar, Users, Loader2 } from "lucide-react";

interface BatchItem {
  id: string;
  batch_name: string;
  start_date: string;
  end_date: string;
  trainee_count?: number;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form State
  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBatches() {
      setLoading(true);
      try {
        const { data: batchesData, error: bErr } = await supabase
          .from("batches")
          .select("*, trainees(id)")
          .order("created_at", { ascending: false });

        if (bErr) throw bErr;

        if (isMounted) {
          const formatted = (batchesData || []).map(
            (b: Record<string, unknown>) => ({
              id: String(b.id),
              batch_name: String(b.batch_name),
              start_date: String(b.start_date),
              end_date: String(b.end_date),
              trainee_count: Array.isArray(b.trainees) ? b.trainees.length : 0,
            }),
          );

          setBatches(formatted);
        }
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBatches();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || !startDate || !endDate) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("batches").insert([
        {
          batch_name: batchName,
          start_date: startDate,
          end_date: endDate,
        },
      ]);

      if (error) throw error;

      setBatchName("");
      setStartDate("");
      setEndDate("");
      setIsModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to create batch:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-400/20 via-blue-400/20 to-indigo-400/20 border border-white/70 shadow-lg shadow-sky-500/5 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white text-xs font-semibold text-sky-700 mb-2 shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>Cohort Lifecycle</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Active Training Batches
          </h1>
          <p className="text-sm text-slate-600">
            Track and allocate candidate groups across program timelines.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>New Batch</span>
        </button>
      </div>

      {/* Grid of Batches */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 text-white shadow-sm">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs font-semibold text-sky-700">
                    <Users className="w-3 h-3" />
                    {batch.trainee_count} Trainees
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-2">
                  {batch.batch_name}
                </h3>
              </div>

              <div className="pt-4 border-t border-slate-100/80 mt-4 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Start:{" "}
                    <strong className="text-slate-700">
                      {batch.start_date}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    End:{" "}
                    <strong className="text-slate-700">{batch.end_date}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Glassmorphism Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white/90 border border-white backdrop-blur-2xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-800">
              Create New Cohort Batch
            </h2>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud & DevOps Autumn 2026"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-sky-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
