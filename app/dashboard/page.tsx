'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Users, GraduationCap, Layers, Award, Sparkles, ArrowUpRight } from 'lucide-react';

interface MetricState {
  totalBatches: number;
  totalTrainers: number;
  totalTrainees: number;
  avgScore: number;
  topTrainer: string;
  topTrainee: string;
}

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<MetricState>({
    totalBatches: 0,
    totalTrainers: 0,
    totalTrainees: 0,
    avgScore: 0,
    topTrainer: 'Loading...',
    topTrainee: 'Loading...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [batchesRes, trainersRes, traineesRes] = await Promise.all([
          supabase.from('batches').select('id', { count: 'exact' }),
          supabase.from('trainers').select('id, is_trainer_of_the_month, profiles(full_name)'),
          supabase.from('trainees').select('id, overall_score, is_trainee_of_the_month, profiles(full_name)'),
        ]);

        const rawTrainers = trainersRes.data || [];
        const rawTrainees = traineesRes.data || [];

        // Find spotlights
        const topTrainerRecord = rawTrainers.find((t: Record<string, unknown>) => Boolean(t.is_trainer_of_the_month));
        const topTraineeRecord = rawTrainees.find((tr: Record<string, unknown>) => Boolean(tr.is_trainee_of_the_month));

        // Safely extract names
        let trainerName = 'None Selected';
        if (topTrainerRecord && topTrainerRecord.profiles) {
          const profile = topTrainerRecord.profiles as unknown as { full_name?: string };
          trainerName = profile.full_name || 'None Selected';
        }

        let traineeName = 'None Selected';
        if (topTraineeRecord && topTraineeRecord.profiles) {
          const profile = topTraineeRecord.profiles as unknown as { full_name?: string };
          traineeName = profile.full_name || 'None Selected';
        }

        // Calculate average score
        const scores = rawTrainees
          .map((tr: Record<string, unknown>) => Number(tr.overall_score))
          .filter((score: number) => !isNaN(score));

        const avg = scores.length > 0
          ? Number((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1))
          : 0;

        setMetrics({
          totalBatches: batchesRes.count || 0,
          totalTrainers: rawTrainers.length,
          totalTrainees: rawTrainees.length,
          avgScore: avg,
          topTrainer: trainerName,
          topTrainee: traineeName,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = [
    { label: 'Active Batches', value: metrics.totalBatches, icon: Layers, color: 'from-blue-500 to-sky-400' },
    { label: 'Certified Trainers', value: metrics.totalTrainers, icon: Users, color: 'from-indigo-500 to-purple-400' },
    { label: 'Enrolled Trainees', value: metrics.totalTrainees, icon: GraduationCap, color: 'from-teal-500 to-emerald-400' },
    { label: 'Cohort Avg Score', value: `${metrics.avgScore}%`, icon: ArrowUpRight, color: 'from-amber-500 to-orange-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-sky-400/20 via-indigo-400/20 to-teal-400/20 border border-white/70 shadow-lg shadow-sky-500/5 backdrop-blur-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white text-xs font-semibold text-sky-700 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Talent Command</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Talent Velocity & Analytics</h1>
          <p className="text-sm text-slate-600 mt-1">Real-time telemetry across training cohorts, staff allocation, and skill milestones.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-800 mt-3">
                {loading ? '...' : stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Trainer */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Trainer of the Month</h3>
              <p className="text-xs text-slate-500">Highest rated mentor</p>
            </div>
          </div>
          <p className="text-xl font-extrabold text-indigo-900">{loading ? '...' : metrics.topTrainer}</p>
        </div>

        {/* Top Trainee */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Trainee of the Month</h3>
              <p className="text-xs text-slate-500">Highest overall cohort score</p>
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-900">{loading ? '...' : metrics.topTrainee}</p>
        </div>
      </div>
    </div>
  );
}