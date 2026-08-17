"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import {
  User,
  Search,
  Eye,
  Edit3,
  Loader2,
  Building,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";

interface TrainerSummary {
  id: string;
  employee_id: string | null;
  designation: string | null;
  department: string | null;
  mobile_number: string | null;
  experience_years: number;
  photo_url: string | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export default function TrainersDirectoryPage() {
  const [trainers, setTrainers] = useState<TrainerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTrainers() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("trainers")
          .select(
            `
    id,
    employee_id,
    designation,
    department,
    mobile_number,
    experience_years,
    photo_url,
    profiles(full_name, email)
  `,
          )
          .order("id", { ascending: true });

        if (error) throw error;
        // @ts-expect-error Supabase join mapping
        setTrainers(data || []);
      } catch (err) {
        console.error("Error fetching trainers:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTrainers();
  }, []);

  const filteredTrainers = trainers.filter((t) => {
    const name = t.profiles?.full_name?.toLowerCase() || "";
    const empId = t.employee_id?.toLowerCase() || "";
    const dept = t.department?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || empId.includes(q) || dept.includes(q);
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Trainers &amp; Faculty Directory
          </h1>
          <p className="text-xs text-slate-500">
            Select a faculty member to review records or modify credentials
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Directory Grid / Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="p-8 text-center bg-white/60 rounded-3xl border border-slate-200 text-slate-500 text-xs font-semibold">
          No faculty or trainers found matching your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainers.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-3xl bg-white/80 border border-white/90 shadow-lg shadow-blue-500/5 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-16 rounded-2xl bg-gradient-to-b from-blue-100 to-indigo-200 border border-blue-400/30 flex items-center justify-center overflow-hidden shrink-0">
                  {t.photo_url && t.photo_url !== "NA" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photo_url}
                      alt={t.profiles?.full_name || "Trainer"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-blue-700/60" />
                  )}
                </div>

                <div className="space-y-1 overflow-hidden">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {t.employee_id || "ID: NA"}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {t.profiles?.full_name || "Faculty Member"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {t.designation || "Trainer"} &bull;{" "}
                    {t.department || "Department"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{t.profiles?.email || "NA"}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{t.mobile_number || "NA"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{t.experience_years || 0} Years Experience</span>
                </p>
              </div>

              {/* Distinct Action Buttons: View Profile vs Update Details */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/dashboard/trainers/${t.id}`}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                <Link
                  href={`/dashboard/trainers/${t.id}?edit=true`}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm shadow-blue-500/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
