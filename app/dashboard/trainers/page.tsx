"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  Briefcase,
  Star,
  Search,
  Mail,
  Loader2,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  Award,
} from "lucide-react";

interface TrainerItem {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  domain_expertise: string;
  rating: number;
  is_trainer_of_the_month: boolean;
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomainFilter, setSelectedDomainFilter] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerItem | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingSpotlightId, setUpdatingSpotlightId] = useState<string | null>(
    null,
  );

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDomain, setFormDomain] = useState("Full Stack Cloud Architecture");
  const [formRating, setFormRating] = useState(4.8);

  useEffect(() => {
    let isMounted = true;

    async function loadTrainers() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("trainers")
          .select(
            "id, domain_expertise, rating, is_trainer_of_the_month, profiles(id, full_name, email)",
          )
          .order("rating", { ascending: false });

        if (error) throw error;

        if (isMounted) {
          const formatted = (data || []).map((t: Record<string, unknown>) => {
            const profile = (t.profiles || {}) as {
              id?: string;
              full_name?: string;
              email?: string;
            };
            return {
              id: String(t.id),
              profile_id: String(profile.id || t.id),
              full_name: profile.full_name || "Faculty Member",
              email: profile.email || "No email registered",
              domain_expertise: String(t.domain_expertise || "General Tech"),
              rating: Number(t.rating || 5.0),
              is_trainer_of_the_month: Boolean(t.is_trainer_of_the_month),
            };
          });

          setTrainers(formatted);
        }
      } catch (err) {
        console.error("Failed to load faculty directory:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTrainers();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const domainList = useMemo(() => {
    const list = Array.from(new Set(trainers.map((t) => t.domain_expertise)));
    return ["All", ...list];
  }, [trainers]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      const matchesSearch =
        t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.domain_expertise.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain =
        selectedDomainFilter === "All" ||
        t.domain_expertise === selectedDomainFilter;
      return matchesSearch && matchesDomain;
    });
  }, [trainers, searchQuery, selectedDomainFilter]);

  const openCreateModal = () => {
    setEditingTrainer(null);
    setFormName("");
    setFormEmail("");
    setFormDomain("Full Stack Cloud Architecture");
    setFormRating(4.8);
    setIsModalOpen(true);
  };

  const openEditModal = (trainer: TrainerItem) => {
    setEditingTrainer(trainer);
    setFormName(trainer.full_name);
    setFormEmail(trainer.email);
    setFormDomain(trainer.domain_expertise);
    setFormRating(trainer.rating);
    setIsModalOpen(true);
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDomain.trim()) return;

    setSaving(true);
    try {
      if (editingTrainer) {
        const { error: pErr } = await supabase
          .from("profiles")
          .update({ full_name: formName.trim() })
          .eq("id", editingTrainer.profile_id);
        if (pErr) throw pErr;

        const { error: tErr } = await supabase
          .from("trainers")
          .update({
            domain_expertise: formDomain.trim(),
            rating: formRating,
          })
          .eq("id", editingTrainer.id);
        if (tErr) throw tErr;
      } else {
        const newProfileId = crypto.randomUUID();
        const emailToUse =
          formEmail.trim() || `trainer_${Date.now()}@trainovax.io`;

        const { error: pErr } = await supabase.from("profiles").insert([
          {
            id: newProfileId,
            full_name: formName.trim(),
            email: emailToUse,
            role: "trainer",
          },
        ]);
        if (pErr) throw pErr;

        const { error: tErr } = await supabase.from("trainers").insert([
          {
            id: newProfileId,
            domain_expertise: formDomain.trim(),
            rating: formRating,
            is_trainer_of_the_month: false,
          },
        ]);
        if (tErr) throw tErr;
      }

      setIsModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to save faculty record:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrainer = async (trainer: TrainerItem) => {
    if (
      !confirm(
        `Are you sure you want to remove instructor ${trainer.full_name}?`,
      )
    )
      return;

    setDeletingId(trainer.id);
    try {
      const { error: tErr } = await supabase
        .from("trainers")
        .delete()
        .eq("id", trainer.id);
      if (tErr) throw tErr;

      const { error: pErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", trainer.profile_id);
      if (pErr) throw pErr;

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete instructor:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetSpotlight = async (trainerId: string) => {
    setUpdatingSpotlightId(trainerId);
    try {
      await supabase
        .from("trainers")
        .update({ is_trainer_of_the_month: false })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      const { error } = await supabase
        .from("trainers")
        .update({ is_trainer_of_the_month: true })
        .eq("id", trainerId);

      if (error) throw error;

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to assign faculty spotlight:", err);
    } finally {
      setUpdatingSpotlightId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-400/20 via-indigo-400/20 to-teal-400/20 border border-white/70 shadow-lg shadow-sky-500/5 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white text-xs font-semibold text-sky-800 mb-2 shadow-sm">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Academic Faculty</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Trainers Directory
          </h1>
          <p className="text-sm text-slate-600">
            Manage instructors, domain specializations, and mentorship ratings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trainer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, email, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-white backdrop-blur-md text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="relative">
          <Layers className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={selectedDomainFilter}
            onChange={(e) => setSelectedDomainFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-white backdrop-blur-md text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {domainList.map((d) => (
              <option key={d} value={d}>
                {d === "All" ? "All Domains" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className={`p-6 rounded-3xl backdrop-blur-xl border transition-all duration-200 flex flex-col justify-between ${
                trainer.is_trainer_of_the_month
                  ? "bg-gradient-to-br from-sky-500/15 via-white/80 to-indigo-500/15 border-sky-300 shadow-md ring-2 ring-sky-400/30"
                  : "bg-white/60 border-white/80 shadow-sm hover:shadow-md hover:border-sky-200"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sm">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(trainer)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-200 transition-colors shadow-sm"
                      title="Edit Instructor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrainer(trainer)}
                      disabled={deletingId === trainer.id}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50"
                      title="Delete Instructor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-800">
                    {trainer.full_name}
                  </h3>
                  {trainer.is_trainer_of_the_month && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-[10px] font-bold text-sky-800 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                      Faculty Spotlight
                    </span>
                  )}
                </div>

                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {trainer.domain_expertise}
                </span>

                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-slate-700 font-semibold">
                      Faculty Rating: {trainer.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/80 mt-5">
                {trainer.is_trainer_of_the_month ? (
                  <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-sky-700">
                    <Award className="w-4 h-4 text-sky-600" />
                    <span>Trainer of the Month</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSetSpotlight(trainer.id)}
                    disabled={updatingSpotlightId === trainer.id}
                    className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors disabled:opacity-50"
                  >
                    {updatingSpotlightId === trainer.id
                      ? "Setting..."
                      : "Set as Spotlight"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white/95 border border-white backdrop-blur-2xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingTrainer
                  ? "Edit Faculty Details"
                  : "Add New Faculty Member"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrainer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alan Grant"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {!editingTrainer && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. instructor@trainovax.io"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Domain Expertise
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Infrastructure, AI & ML"
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Instructor Rating</span>
                  <span className="text-sky-700 font-bold">
                    {formRating.toFixed(1)} / 5.0
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={formRating}
                  onChange={(e) => setFormRating(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-sky-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingTrainer
                      ? "Update Instructor"
                      : "Create Instructor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
