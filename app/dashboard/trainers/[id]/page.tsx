"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import {
  User,
  Briefcase,
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  Users,
  Sparkles,
} from "lucide-react";

interface AssignedTrainee {
  id: string;
  reg_number: string | null;
  overall_score: number;
  profiles?: {
    full_name: string;
    email: string;
  };
  batches?: {
    batch_name: string;
  };
}

interface TrainerProfileData {
  id: string;
  employee_id: string | null;
  designation: string | null;
  department: string | null;
  cabin_number: string | null;
  mobile_number: string | null;
  domain_expertise: string | null;
  rating: number;
  is_trainer_of_the_month: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
  assigned_trainees?: AssignedTrainee[];
}

export default function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const trainerId = resolvedParams.id;

  const [trainer, setTrainer] = useState<TrainerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadTrainer() {
      setLoading(true);
      try {
        const [trainerRes, traineesRes] = await Promise.all([
          supabase
            .from("trainers")
            .select("*, profiles(full_name, email)")
            .eq("id", trainerId)
            .single(),
          supabase
            .from("trainees")
            .select(
              "id, reg_number, overall_score, profiles(full_name, email), batches(batch_name)",
            )
            .eq("trainer_id", trainerId),
        ]);

        if (trainerRes.error) throw trainerRes.error;

        if (isMounted) {
          setTrainer({
            ...(trainerRes.data as unknown as TrainerProfileData),
            assigned_trainees:
              (traineesRes.data as unknown as AssignedTrainee[]) || [],
          });
        }
      } catch (err) {
        console.error("Failed to load instructor profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (trainerId) loadTrainer();
    return () => {
      isMounted = false;
    };
  }, [trainerId]);

  const handleFieldChange = <K extends keyof TrainerProfileData>(
    key: K,
    value: TrainerProfileData[K],
  ) => {
    if (!trainer) return;
    setTrainer({ ...trainer, [key]: value });
  };

  const handleSave = async () => {
    if (!trainer) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      if (trainer.profiles?.full_name) {
        await supabase
          .from("profiles")
          .update({ full_name: trainer.profiles.full_name })
          .eq("id", trainerId);
      }

      const { error } = await supabase
        .from("trainers")
        .update({
          employee_id: trainer.employee_id || "NA",
          designation: trainer.designation || "NA",
          department: trainer.department || "NA",
          cabin_number: trainer.cabin_number || "NA",
          mobile_number: trainer.mobile_number || "NA",
          domain_expertise: trainer.domain_expertise || "NA",
          rating: trainer.rating || 5.0,
          is_trainer_of_the_month: trainer.is_trainer_of_the_month,
        })
        .eq("id", trainerId);

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update faculty member:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !trainer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/trainers"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/70 border border-white text-xs font-bold text-slate-700 hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Faculty Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes
              Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Faculty</span>
          </button>
        </div>
      </div>

      {/* Header Profile Identity Glass Card */}
      <div className="p-6 rounded-3xl bg-white/80 border border-white/90 shadow-xl shadow-blue-500/5 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="w-28 h-32 rounded-2xl bg-gradient-to-b from-blue-100 to-indigo-200 border-2 border-blue-400/40 flex items-center justify-center shadow-inner overflow-hidden">
              <User className="w-16 h-16 text-blue-700/60" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 uppercase tracking-wide text-center">
              {trainer.profiles?.full_name || "NA"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 flex-1 text-xs w-full">
            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                FACULTY ID:{" "}
              </span>
              <input
                type="text"
                value={trainer.employee_id ?? "NA"}
                placeholder="NA"
                onChange={(e) =>
                  handleFieldChange("employee_id", e.target.value)
                }
                className="font-bold text-slate-800 bg-white/50 border border-slate-200 px-2 py-0.5 rounded ml-1"
              />
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                OFFICIAL EMAIL:{" "}
              </span>
              <span className="font-bold text-slate-800">
                {trainer.profiles?.email || "NA"}
              </span>
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                DESIGNATION:{" "}
              </span>
              <input
                type="text"
                value={trainer.designation ?? "NA"}
                placeholder="NA"
                onChange={(e) =>
                  handleFieldChange("designation", e.target.value)
                }
                className="font-bold text-slate-800 bg-white/50 border border-slate-200 px-2 py-0.5 rounded ml-1 w-2/3"
              />
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                DEPARTMENT:{" "}
              </span>
              <input
                type="text"
                value={trainer.department ?? "NA"}
                placeholder="NA"
                onChange={(e) =>
                  handleFieldChange("department", e.target.value)
                }
                className="font-bold text-slate-800 bg-white/50 border border-slate-200 px-2 py-0.5 rounded ml-1 w-2/3"
              />
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                CABIN:{" "}
              </span>
              <input
                type="text"
                value={trainer.cabin_number ?? "NA"}
                placeholder="NA"
                onChange={(e) =>
                  handleFieldChange("cabin_number", e.target.value)
                }
                className="font-bold text-slate-800 bg-white/50 border border-slate-200 px-2 py-0.5 rounded ml-1"
              />
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                MOBILE:{" "}
              </span>
              <input
                type="text"
                value={trainer.mobile_number ?? "NA"}
                placeholder="NA"
                onChange={(e) =>
                  handleFieldChange("mobile_number", e.target.value)
                }
                className="font-bold text-slate-800 bg-white/50 border border-slate-200 px-2 py-0.5 rounded ml-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FACULTY METRICS & EXPERTISE */}
      <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
              <Briefcase className="w-4 h-4" />
            </div>
            <span>EXPERTISE & PERFORMANCE RATING</span>
          </div>
          {trainer.is_trainer_of_the_month && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full shadow">
              <Sparkles className="w-3 h-3" /> Spotlight Faculty
            </span>
          )}
        </div>

        <div className="p-5 text-xs bg-amber-50/25 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center pr-4">
            <span className="font-bold text-slate-700 uppercase">
              DOMAIN EXPERTISE
            </span>
            <input
              type="text"
              value={trainer.domain_expertise ?? "NA"}
              placeholder="NA"
              onChange={(e) =>
                handleFieldChange("domain_expertise", e.target.value)
              }
              className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
            />
          </div>

          <div className="flex justify-between items-center pr-4">
            <span className="font-bold text-slate-700 uppercase">
              STUDENT FEEDBACK RATING
            </span>
            <div className="flex items-center gap-2 w-1/2">
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={trainer.rating || 5}
                onChange={(e) =>
                  handleFieldChange("rating", Number(e.target.value))
                }
                className="w-full accent-blue-600"
              />
              <span className="font-bold text-blue-900">
                {Number(trainer.rating || 5).toFixed(1)}/5.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ASSIGNED MENTEES / TRAINEES LIST */}
      <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
              <Users className="w-4 h-4" />
            </div>
            <span>
              ASSIGNED CANDIDATES & PROCTOR WARDS (
              {trainer.assigned_trainees?.length || 0})
            </span>
          </div>
        </div>

        <div className="p-5 text-xs bg-amber-50/25">
          {!trainer.assigned_trainees ||
          trainer.assigned_trainees.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              No candidates currently assigned to this proctor.
            </div>
          ) : (
            <div className="divide-y divide-amber-200/40">
              {trainer.assigned_trainees.map((t) => (
                <div
                  key={t.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/trainees/${t.id}`}
                        className="font-bold text-slate-800 hover:text-blue-600 transition"
                      >
                        {t.profiles?.full_name || "NA"}
                      </Link>
                      <p className="text-[10px] text-slate-500">
                        {t.reg_number ? `Reg: ${t.reg_number} • ` : ""}
                        Batch: {t.batches?.batch_name || "NA"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Score: {t.overall_score}%
                    </span>
                    <Link
                      href={`/dashboard/trainees/${t.id}`}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
