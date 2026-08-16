import { createClient } from "@supabase/supabase-js";

// Read directly from environment or hardcode your keys temporarily for this seed run
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://edmlyetsirxfhlkhplud.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbWx5ZXRzaXJ4Zmhsa2hwbHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTE0NzAsImV4cCI6MjEwMjM4NzQ3MH0.gVU7SipGJVQ4IZV8fHsFdU6dojus5vPcsB8_oOxRZa0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log("🚀 Starting TrainovaX database seed...");

  // 1. Insert Batches
  const batchesData = [
    {
      batch_name: "AI & Data Engineering 2026",
      start_date: "2026-01-10",
      end_date: "2026-06-30",
    },
    {
      batch_name: "Full Stack Cloud Native 2026",
      start_date: "2026-02-01",
      end_date: "2026-07-31",
    },
    {
      batch_name: "Cybersecurity Operations 2026",
      start_date: "2026-03-15",
      end_date: "2026-08-30",
    },
  ];

  const { data: batches, error: bErr } = await supabase
    .from("batches")
    .insert(batchesData)
    .select();
  if (bErr) {
    console.error("Error inserting batches:", bErr);
    return;
  }
  console.log(`✅ Inserted ${batches.length} batches`);

  // 2. Insert Trainers (Profiles + Trainers)
  const trainerProfiles = [
    {
      email: "sarah.connor@trainovax.io",
      full_name: "Sarah Connor",
      role: "trainer",
      avatar_url:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
    {
      email: "marcus.vance@trainovax.io",
      full_name: "Marcus Vance",
      role: "trainer",
      avatar_url:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    },
    {
      email: "elena.rostova@trainovax.io",
      full_name: "Elena Rostova",
      role: "trainer",
      avatar_url:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    },
    {
      email: "david.kim@trainovax.io",
      full_name: "David Kim",
      role: "trainer",
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    {
      email: "priya.sharma@trainovax.io",
      full_name: "Priya Sharma",
      role: "trainer",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
  ];

  const { data: createdTrainerProfiles, error: tpErr } = await supabase
    .from("profiles")
    .insert(trainerProfiles)
    .select();
  if (tpErr) {
    console.error("Error inserting trainer profiles:", tpErr);
    return;
  }

  const trainerDetails = [
    {
      id: createdTrainerProfiles[0].id,
      department: "Cloud & DevOps",
      monthly_pay: 8500.0,
      is_trainer_of_the_month: true,
      rating: 4.95,
    },
    {
      id: createdTrainerProfiles[1].id,
      department: "Full Stack Web",
      monthly_pay: 7800.0,
      is_trainer_of_the_month: false,
      rating: 4.8,
    },
    {
      id: createdTrainerProfiles[2].id,
      department: "AI & Data Science",
      monthly_pay: 9200.0,
      is_trainer_of_the_month: false,
      rating: 4.88,
    },
    {
      id: createdTrainerProfiles[3].id,
      department: "Cybersecurity",
      monthly_pay: 8000.0,
      is_trainer_of_the_month: false,
      rating: 4.75,
    },
    {
      id: createdTrainerProfiles[4].id,
      department: "System Architecture",
      monthly_pay: 8900.0,
      is_trainer_of_the_month: false,
      rating: 4.9,
    },
  ];

  const { error: tErr } = await supabase
    .from("trainers")
    .insert(trainerDetails);
  if (tErr) {
    console.error("Error inserting trainer details:", tErr);
    return;
  }
  console.log(`✅ Inserted ${trainerDetails.length} trainers`);

  // 3. Insert Trainees (Profiles + Trainees)
  const traineeNames = [
    "Aarav Patel",
    "Diya Sen",
    "Rohan Gupta",
    "Ananya Iyer",
    "Kavya Nair",
    "Vikram Malhotra",
    "Siddharth Rao",
    "Pooja Reddy",
    "Rahul Verma",
    "Sneha Kulkarni",
    "Arjun Das",
    "Meera Joshi",
    "Tanvi Deshmukh",
    "Aditya Roy",
    "Ishaan Bhat",
    "Rhea Kapoor",
    "Devendra Singh",
    "Tara Singhania",
    "Nikhil Saxena",
    "Zoya Akhtar",
  ];

  const traineeProfiles = traineeNames.map((name, i) => ({
    email: `${name.toLowerCase().replace(" ", ".")}@trainovax.com`,
    full_name: name,
    role: "trainee",
    avatar_url: `https://images.unsplash.com/photo-${1500000000000 + i * 12345}?w=150`,
  }));

  const { data: createdTraineeProfiles, error: trPErr } = await supabase
    .from("profiles")
    .insert(traineeProfiles)
    .select();
  if (trPErr) {
    console.error("Error inserting trainee profiles:", trPErr);
    return;
  }

  const tiers = ["Excellent", "Good", "Average", "Needs Improvement"];
  const traineeDetails = createdTraineeProfiles.map((tp, idx) => {
    const isTop = idx === 0;
    return {
      id: tp.id,
      batch_id: batches[idx % batches.length].id,
      trainer_id:
        createdTrainerProfiles[idx % createdTrainerProfiles.length].id,
      attendance_percentage: isTop
        ? 99.2
        : Number((82 + ((idx * 0.8) % 17)).toFixed(1)),
      overall_score: isTop
        ? 98.5
        : Number((75 + ((idx * 1.2) % 23)).toFixed(1)),
      performance_tier: isTop ? "Excellent" : tiers[idx % tiers.length],
      is_trainee_of_the_month: isTop,
      dossier_documents: ["resume_v1.pdf", "cert_foundation.pdf"],
    };
  });

  const { error: trErr } = await supabase
    .from("trainees")
    .insert(traineeDetails);
  if (trErr) {
    console.error("Error inserting trainee details:", trErr);
    return;
  }
  console.log(`✅ Inserted ${traineeDetails.length} trainees`);

  console.log("✨ Database seeding successfully finished!");
}

seed();
