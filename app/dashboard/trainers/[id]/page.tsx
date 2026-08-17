"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  User,
  GraduationCap,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Edit3,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  Phone,
  Globe,
  Plus,
  Clock,
  Layers,
  FolderArchive,
  Star,
  Award,
  DollarSign,
  CheckSquare,
} from "lucide-react";

const GLOBAL_COUNTRIES_DATA: Record<
  string,
  { dialCode: string; phoneDigits: number; states?: string[] }
> = {
  India: {
    dialCode: "+91",
    phoneDigits: 10,
    states: [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Delhi NCR",
      "Puducherry",
      "Chandigarh",
      "Other",
    ],
  },
  "United States": { dialCode: "+1", phoneDigits: 10 },
  "United Kingdom": { dialCode: "+44", phoneDigits: 10 },
  Other: { dialCode: "+1", phoneDigits: 10 },
};

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Transgender",
  "Do not want to disclose",
] as const;
const UG_DEGREE_OPTIONS = [
  "B.Tech / B.E.",
  "B.Sc",
  "B.C.A.",
  "B.B.A. / B.Com",
  "B.Arch",
  "Integrated M.Sc / Dual Degree",
  "Other",
];
const OTHER_DEGREE_OPTIONS = [
  "M.Tech / M.E.",
  "M.Sc",
  "M.C.A.",
  "M.B.A.",
  "Ph.D. / Doctorate",
  "Post Graduate Diploma (PGD)",
  "Other",
];

interface AdditionalDegree {
  id?: string;
  degree_type: string;
  stream: string;
  cgpa: string;
  college_name: string;
  college_place: string;
  year_joining: string;
  year_graduation: string;
}

interface WorkExperience {
  id?: string;
  company_name: string;
  position: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  role_description: string;
  location: string;
  stipend_or_ctc: string;
}

interface TrainerFullData {
  id: string;
  employee_id: string | null;
  designation: string | null;
  department: string | null;
  cabin_number: string | null;
  mobile_number: string | null;
  photo_url: string | null;
  application_number: string | null;
  dob: string | null;
  gender: string | null;
  blood_group: string | null;
  native_language: string | null;
  native_state: string | null;
  nationality: string | null;
  nri_country: string | null;
  has_disability: boolean;
  phone_country_code: string | null;
  experience_years: number;
  current_country: string | null;
  current_address_line1: string | null;
  current_address_line2: string | null;
  current_city: string | null;
  current_state: string | null;
  current_pincode: string | null;
  is_company_hostel: boolean;
  company_hostel_details: string | null;
  perm_country: string | null;
  perm_address_line1: string | null;
  perm_address_line2: string | null;
  perm_city: string | null;
  perm_state: string | null;
  perm_pincode: string | null;
  edu_10th_school: string | null;
  edu_10th_board: string | null;
  edu_10th_percentage: string | null;
  edu_10th_year: string | null;
  edu_12th_school: string | null;
  edu_12th_board: string | null;
  edu_12th_percentage: string | null;
  edu_12th_year: string | null;
  ug_degree_type: string | null;
  ug_stream: string | null;
  ug_cgpa: string | null;
  ug_college_name: string | null;
  ug_college_place: string | null;
  ug_year_joining: string | null;
  ug_year_graduation: string | null;
  father_name: string | null;
  father_country: string | null;
  father_phone_code: string | null;
  father_qualification: string | null;
  father_occupation: string | null;
  father_organization: string | null;
  father_mobile: string | null;
  father_email: string | null;
  annual_income: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface TrainerDocument {
  id: string;
  trainer_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface TimetableSlot {
  id: string;
  batch_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_code: string;
  subject_name: string;
  room_number: string;
  meeting_link: string | null;
}

interface TraineeSummary {
  id: string;
  application_number: string | null;
  batch_name: string | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface TraineeAttendanceRecord {
  id: string;
  trainee_id: string;
  session_date: string;
  subject_code: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  remarks: string | null;
}

interface TraineeEvaluation {
  id: string;
  trainee_id: string;
  batch_name: string;
  subject_code: string;
  rating: number;
  strengths: string | null;
  improvements: string | null;
  detailed_feedback: string;
  evaluation_date: string;
}

interface TraineeReviewForTrainer {
  id: string;
  trainee_id: string;
  rating: number;
  feedback: string;
  created_at: string;
  trainees?: {
    application_number: string | null;
    profiles?: { full_name: string };
  };
}

interface MaterialZip {
  id: string;
  subject_code: string;
  subject_title: string;
  batch_name: string;
  zip_title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_size_mb: number;
}

interface PayrollRecord {
  id: string;
  salary_month: string;
  salary_year: number;
  basic_pay: number;
  hra: number;
  special_allowance: number;
  performance_bonus: number;
  deductions: number;
  net_salary: number;
  payment_status: "Paid" | "Processing" | "Hold";
}

export default function TrainerWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const trainerId = resolvedParams.id;
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "timetable"
    | "trainee_access"
    | "feedback_and_reviews"
    | "materials"
    | "company_appraisal"
    | "payroll"
  >("profile");

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true",
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [trainer, setTrainer] = useState<TrainerFullData | null>(null);

  const [additionalDegrees, setAdditionalDegrees] = useState<
    AdditionalDegree[]
  >([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [documents, setDocuments] = useState<TrainerDocument[]>([]);

  // Timetable
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    batch_name: "",
    day_of_week: "Monday",
    start_time: "09:00 AM",
    end_time: "10:30 AM",
    subject_code: "CS602",
    subject_name: "Neural Networks & Deep Learning",
    room_number: "Lab 402",
    meeting_link: "",
  });

  // Dynamic Batches & Trainees
  const [allTrainees, setAllTrainees] = useState<TraineeSummary[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>("");
  const [traineeAttendanceLogs, setTraineeAttendanceLogs] = useState<
    TraineeAttendanceRecord[]
  >([]);

  // Evaluation & Reviews
  const [traineeEvaluations, setTraineeEvaluations] = useState<
    TraineeEvaluation[]
  >([]);
  const [trainerReviews, setTrainerReviews] = useState<
    TraineeReviewForTrainer[]
  >([]);
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    subject_code: "CS602",
    strengths: "",
    improvements: "",
    detailed_feedback: "",
  });

  // Attendance Form
  const [newAttStatus, setNewAttStatus] = useState<
    "Present" | "Absent" | "Late" | "Excused"
  >("Present");
  const [newAttDate, setNewAttDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [newAttSubject, setNewAttSubject] = useState("CS602");
  const [newAttRemarks, setNewAttRemarks] = useState("");

  // Materials & Payroll
  const [materials, setMaterials] = useState<MaterialZip[]>([]);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [zipForm, setZipForm] = useState({
    subject_code: "CS602",
    subject_title: "Deep Learning",
    batch_name: "",
    zip_title: "",
    description: "",
  });
  const [uploadingZip, setUploadingZip] = useState(false);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);

  // Country & State Dropdown State
  const [selectedNriCountryDropdown, setSelectedNriCountryDropdown] =
    useState("United States");
  const [customNriCountry, setCustomNriCountry] = useState("");
  const [selectedFatherCountryDropdown, setSelectedFatherCountryDropdown] =
    useState("India");
  const [customFatherCountry, setCustomFatherCountry] = useState("");
  const [selectedCurrentCountryDropdown, setSelectedCurrentCountryDropdown] =
    useState("India");
  const [customCurrentCountry, setCustomCurrentCountry] = useState("");
  const [selectedCurrentStateDropdown, setSelectedCurrentStateDropdown] =
    useState("Andhra Pradesh");
  const [customCurrentState, setCustomCurrentState] = useState("");
  const [selectedPermCountryDropdown, setSelectedPermCountryDropdown] =
    useState("India");
  const [customPermCountry, setCustomPermCountry] = useState("");
  const [selectedPermStateDropdown, setSelectedPermStateDropdown] =
    useState("Andhra Pradesh");
  const [customPermState, setCustomPermState] = useState("");

  const [citizenshipType, setCitizenshipType] = useState<"INDIAN" | "NRI">(
    "INDIAN",
  );
  const [selectedGovtIdType, setSelectedGovtIdType] = useState("pan_card");
  const [docCategory, setDocCategory] = useState<string>("ug_degree");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [openSections, setOpenSections] = useState({
    personal: true,
    educational: true,
    experience: true,
    family: true,
    documents: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    let isMounted = true;
    async function loadTrainerWorkspace() {
      setLoading(true);
      try {
        const [
          trainerRes,
          docRes,
          degreesRes,
          workRes,
          ttRes,
          traineeRes,
          evalRes,
          reviewsRes,
          matRes,
          payRes,
        ] = await Promise.all([
          supabase
            .from("trainers")
            .select("*, profiles(full_name, email)")
            .eq("id", trainerId)
            .single(),
          supabase
            .from("trainer_documents")
            .select("*")
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: false }),
          supabase
            .from("trainer_additional_degrees")
            .select("*")
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: true }),
          supabase
            .from("trainer_work_experiences")
            .select("*")
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: true }),
          supabase
            .from("batch_timetables")
            .select("*")
            .eq("trainer_id", trainerId)
            .order("start_time", { ascending: true }),
          supabase
            .from("trainees")
            .select(
              "id, application_number, batch_name, profiles(full_name, email)",
            )
            .order("application_number", { ascending: true }),
          supabase
            .from("trainee_evaluations")
            .select("*")
            .eq("trainer_id", trainerId)
            .order("evaluation_date", { ascending: false }),
          supabase
            .from("trainer_reviews_by_trainees")
            .select("*, trainees(application_number, profiles(full_name))")
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: false }),
          supabase
            .from("subject_materials")
            .select("*")
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: false }),
          supabase
            .from("trainer_payrolls")
            .select("*")
            .eq("trainer_id", trainerId)
            .order("salary_year", { ascending: false }),
        ]);

        if (trainerRes.error) throw trainerRes.error;

        if (isMounted) {
          const tData = trainerRes.data as unknown as TrainerFullData;
          setTrainer(tData);
          setDocuments((docRes.data as unknown as TrainerDocument[]) || []);
          setAdditionalDegrees(
            (degreesRes.data as unknown as AdditionalDegree[]) || [],
          );
          setWorkExperiences(
            (workRes.data as unknown as WorkExperience[]) || [],
          );
          setTimetableSlots((ttRes.data as unknown as TimetableSlot[]) || []);

          const fetchedTrainees =
            (traineeRes.data as unknown as TraineeSummary[]) || [];
          setAllTrainees(fetchedTrainees);

          const uniqueBatches = Array.from(
            new Set(fetchedTrainees.map((t) => t.batch_name).filter(Boolean)),
          ) as string[];

          setAvailableBatches(
            uniqueBatches.length > 0 ? uniqueBatches : ["Batch 1"],
          );
          const defaultBatch = uniqueBatches[0] || "Batch 1";
          setSelectedBatch(defaultBatch);
          setNewSlot((prev) => ({ ...prev, batch_name: defaultBatch }));
          setZipForm((prev) => ({ ...prev, batch_name: defaultBatch }));

          setTraineeEvaluations(
            (evalRes.data as unknown as TraineeEvaluation[]) || [],
          );
          setTrainerReviews(
            (reviewsRes.data as unknown as TraineeReviewForTrainer[]) || [],
          );
          setMaterials((matRes.data as unknown as MaterialZip[]) || []);
          setPayrolls((payRes.data as unknown as PayrollRecord[]) || []);

          const isNri = tData.nationality?.toUpperCase() === "NRI";
          setCitizenshipType(isNri ? "NRI" : "INDIAN");

          const nCountry = tData.nri_country || "United States";
          if (GLOBAL_COUNTRIES_DATA[nCountry])
            setSelectedNriCountryDropdown(nCountry);
          else {
            setSelectedNriCountryDropdown("Other");
            setCustomNriCountry(nCountry);
          }

          const fCountry = tData.father_country || "India";
          if (GLOBAL_COUNTRIES_DATA[fCountry])
            setSelectedFatherCountryDropdown(fCountry);
          else {
            setSelectedFatherCountryDropdown("Other");
            setCustomFatherCountry(fCountry);
          }

          const cCountry = tData.current_country || "India";
          if (GLOBAL_COUNTRIES_DATA[cCountry])
            setSelectedCurrentCountryDropdown(cCountry);
          else {
            setSelectedCurrentCountryDropdown("Other");
            setCustomCurrentCountry(cCountry);
          }

          const cState = tData.current_state || "Andhra Pradesh";
          const validCStates = GLOBAL_COUNTRIES_DATA[cCountry]?.states || [];
          if (validCStates.includes(cState))
            setSelectedCurrentStateDropdown(cState);
          else {
            setSelectedCurrentStateDropdown("Other");
            setCustomCurrentState(cState);
          }

          const pCountry = tData.perm_country || "India";
          if (GLOBAL_COUNTRIES_DATA[pCountry])
            setSelectedPermCountryDropdown(pCountry);
          else {
            setSelectedPermCountryDropdown("Other");
            setCustomPermCountry(pCountry);
          }

          const pState = tData.perm_state || "Andhra Pradesh";
          const validPStates = GLOBAL_COUNTRIES_DATA[pCountry]?.states || [];
          if (validPStates.includes(pState))
            setSelectedPermStateDropdown(pState);
          else {
            setSelectedPermStateDropdown("Other");
            setCustomPermState(pState);
          }
        }
      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (trainerId) loadTrainerWorkspace();
    return () => {
      isMounted = false;
    };
  }, [trainerId]);

  useEffect(() => {
    async function loadSelectedTraineeAttendance() {
      if (!selectedTraineeId) {
        setTraineeAttendanceLogs([]);
        return;
      }
      const { data } = await supabase
        .from("trainee_attendance_records")
        .select("*")
        .eq("trainee_id", selectedTraineeId)
        .order("session_date", { ascending: false });
      setTraineeAttendanceLogs(
        (data as unknown as TraineeAttendanceRecord[]) || [],
      );
    }
    loadSelectedTraineeAttendance();
  }, [selectedTraineeId]);

  const batchTrainees = allTrainees.filter(
    (t) => t.batch_name === selectedBatch,
  );
  const selectedTraineeObj = allTrainees.find(
    (t) => t.id === selectedTraineeId,
  );

  const handleFieldChange = <K extends keyof TrainerFullData>(
    key: K,
    value: TrainerFullData[K],
  ) => {
    if (!trainer) return;
    setTrainer({ ...trainer, [key]: value });
  };

  const handleSaveProfile = async () => {
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

      const finalCurrentCountry =
        selectedCurrentCountryDropdown === "Other"
          ? customCurrentCountry || "Other"
          : selectedCurrentCountryDropdown;
      const finalCurrentState =
        selectedCurrentStateDropdown === "Other"
          ? customCurrentState || "Other"
          : selectedCurrentStateDropdown;
      const finalPermCountry =
        selectedPermCountryDropdown === "Other"
          ? customPermCountry || "Other"
          : selectedPermCountryDropdown;
      const finalPermState =
        selectedPermStateDropdown === "Other"
          ? customPermState || "Other"
          : selectedPermStateDropdown;
      const finalNriCountry =
        selectedNriCountryDropdown === "Other"
          ? customNriCountry || "Other"
          : selectedNriCountryDropdown;
      const finalFatherCountry =
        selectedFatherCountryDropdown === "Other"
          ? customFatherCountry || "Other"
          : selectedFatherCountryDropdown;

      await supabase
        .from("trainers")
        .update({
          employee_id: trainer.employee_id || "NA",
          designation: trainer.designation || "NA",
          department: trainer.department || "NA",
          cabin_number: trainer.cabin_number || "NA",
          experience_years: trainer.experience_years || 0,
          application_number: trainer.application_number || "NA",
          dob: trainer.dob || null,
          gender: trainer.gender || "Female",
          blood_group: trainer.blood_group || "NA",
          native_language: trainer.native_language || "NA",
          native_state: trainer.native_state || "NA",
          nationality: citizenshipType,
          nri_country: citizenshipType === "NRI" ? finalNriCountry : "NA",
          has_disability: trainer.has_disability,
          mobile_number: trainer.mobile_number || "NA",
          current_country: finalCurrentCountry,
          current_address_line1: trainer.current_address_line1 || "NA",
          current_address_line2: trainer.current_address_line2 || "NA",
          current_city: trainer.current_city || "NA",
          current_state: finalCurrentState,
          current_pincode: trainer.current_pincode || "NA",
          is_company_hostel: trainer.is_company_hostel,
          company_hostel_details: trainer.company_hostel_details || "NA",
          perm_country: finalPermCountry,
          perm_address_line1: trainer.perm_address_line1 || "NA",
          perm_address_line2: trainer.perm_address_line2 || "NA",
          perm_city: trainer.perm_city || "NA",
          perm_state: finalPermState,
          perm_pincode: trainer.perm_pincode || "NA",
          edu_10th_school: trainer.edu_10th_school || "NA",
          edu_10th_board: trainer.edu_10th_board || "NA",
          edu_10th_percentage: trainer.edu_10th_percentage || "NA",
          edu_10th_year: trainer.edu_10th_year || "NA",
          edu_12th_school: trainer.edu_12th_school || "NA",
          edu_12th_board: trainer.edu_12th_board || "NA",
          edu_12th_percentage: trainer.edu_12th_percentage || "NA",
          edu_12th_year: trainer.edu_12th_year || "NA",
          ug_degree_type: trainer.ug_degree_type || "B.Tech / B.E.",
          ug_stream: trainer.ug_stream || "Computer Science",
          ug_cgpa: trainer.ug_cgpa || "NA",
          ug_college_name: trainer.ug_college_name || "NA",
          ug_college_place: trainer.ug_college_place || "NA",
          ug_year_joining: trainer.ug_year_joining || "NA",
          ug_year_graduation: trainer.ug_year_graduation || "NA",
          father_name: trainer.father_name || "NA",
          father_country: finalFatherCountry,
          father_qualification: trainer.father_qualification || "NA",
          father_occupation: trainer.father_occupation || "NA",
          father_mobile: trainer.father_mobile || "NA",
          father_email: trainer.father_email || "NA",
        })
        .eq("id", trainerId);

      await supabase
        .from("trainer_additional_degrees")
        .delete()
        .eq("trainer_id", trainerId);
      if (additionalDegrees.length > 0) {
        await supabase.from("trainer_additional_degrees").insert(
          additionalDegrees.map((d) => ({
            trainer_id: trainerId,
            degree_type: d.degree_type,
            stream: d.stream,
            cgpa: d.cgpa,
            college_name: d.college_name,
            college_place: d.college_place,
            year_joining: d.year_joining,
            year_graduation: d.year_graduation,
          })),
        );
      }

      await supabase
        .from("trainer_work_experiences")
        .delete()
        .eq("trainer_id", trainerId);
      if (workExperiences.length > 0) {
        await supabase.from("trainer_work_experiences").insert(
          workExperiences.map((w) => ({
            trainer_id: trainerId,
            company_name: w.company_name,
            position: w.position,
            start_date: w.start_date,
            end_date: w.end_date,
            currently_working: w.currently_working,
            role_description: w.role_description,
            location: w.location,
            stipend_or_ctc: w.stipend_or_ctc,
          })),
        );
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !trainer) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/trainer_${trainerId}_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from("trainee-vault")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage
        .from("trainee-vault")
        .getPublicUrl(filePath);
      await supabase
        .from("trainers")
        .update({ photo_url: data.publicUrl })
        .eq("id", trainerId);
      setTrainer({ ...trainer, photo_url: data.publicUrl });
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadingDoc(true);
    try {
      const finalDocType =
        docCategory === "govt_id"
          ? citizenshipType === "INDIAN"
            ? selectedGovtIdType
            : "nri_certificate"
          : docCategory;

      const cleanFileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `trainer_${trainerId}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("trainee-vault")
        .upload(filePath, selectedFile);
      if (uploadError) throw uploadError;

      await supabase.from("trainer_documents").insert([
        {
          trainer_id: trainerId,
          document_type: finalDocType,
          file_name: selectedFile.name,
          file_path: filePath,
        },
      ]);

      const { data: updatedDocs } = await supabase
        .from("trainer_documents")
        .select("*")
        .eq("trainer_id", trainerId)
        .order("created_at", { ascending: false });

      setDocuments((updatedDocs as unknown as TrainerDocument[]) || []);
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDownloadFile = async (path: string, fileName: string) => {
    const { data } = await supabase.storage
      .from("trainee-vault")
      .download(path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    }
  };

  const handleDeleteDoc = async (id: string, path: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    await supabase.storage.from("trainee-vault").remove([path]);
    await supabase.from("trainer_documents").delete().eq("id", id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleMarkTraineeAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraineeId) return;

    try {
      await supabase.from("trainee_attendance_records").insert([
        {
          trainee_id: selectedTraineeId,
          trainer_id: trainerId,
          batch_name: selectedBatch,
          session_date: newAttDate,
          subject_code: newAttSubject,
          status: newAttStatus,
          remarks: newAttRemarks || "Recorded by Faculty",
        },
      ]);

      const { data } = await supabase
        .from("trainee_attendance_records")
        .select("*")
        .eq("trainee_id", selectedTraineeId)
        .order("session_date", { ascending: false });
      setTraineeAttendanceLogs(
        (data as unknown as TraineeAttendanceRecord[]) || [],
      );
      setNewAttRemarks("");
      alert("Trainee attendance status updated!");
    } catch (err) {
      console.error("Failed to log attendance:", err);
    }
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraineeId) {
      alert("Select a trainee first");
      return;
    }

    try {
      if (editingEvalId) {
        await supabase
          .from("trainee_evaluations")
          .update({
            rating: Number(feedbackForm.rating),
            subject_code: feedbackForm.subject_code,
            strengths: feedbackForm.strengths,
            improvements: feedbackForm.improvements,
            detailed_feedback: feedbackForm.detailed_feedback,
          })
          .eq("id", editingEvalId);
      } else {
        await supabase.from("trainee_evaluations").insert([
          {
            trainer_id: trainerId,
            trainee_id: selectedTraineeId,
            batch_name: selectedBatch,
            subject_code: feedbackForm.subject_code,
            rating: Number(feedbackForm.rating),
            strengths: feedbackForm.strengths,
            improvements: feedbackForm.improvements,
            detailed_feedback: feedbackForm.detailed_feedback,
          },
        ]);
      }

      const { data } = await supabase
        .from("trainee_evaluations")
        .select("*")
        .eq("trainer_id", trainerId)
        .order("evaluation_date", { ascending: false });
      setTraineeEvaluations((data as unknown as TraineeEvaluation[]) || []);
      setEditingEvalId(null);
      setFeedbackForm({
        rating: 5,
        subject_code: "CS602",
        strengths: "",
        improvements: "",
        detailed_feedback: "",
      });
      alert(
        editingEvalId
          ? "Feedback updated successfully!"
          : "Feedback submitted successfully!",
      );
    } catch (err) {
      console.error("Evaluation save error:", err);
    }
  };

  const handleDeleteEvaluation = async (evalId: string) => {
    if (!confirm("Are you sure you want to remove this feedback record?"))
      return;
    await supabase.from("trainee_evaluations").delete().eq("id", evalId);
    setTraineeEvaluations(traineeEvaluations.filter((ev) => ev.id !== evalId));
  };

  const handleAddTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from("batch_timetables").insert([
        {
          trainer_id: trainerId,
          batch_name: newSlot.batch_name,
          day_of_week: newSlot.day_of_week,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          subject_code: newSlot.subject_code,
          subject_name: newSlot.subject_name,
          room_number: newSlot.room_number,
          meeting_link: newSlot.meeting_link,
        },
      ]);

      const { data } = await supabase
        .from("batch_timetables")
        .select("*")
        .eq("trainer_id", trainerId)
        .order("start_time", { ascending: true });
      setTimetableSlots((data as unknown as TimetableSlot[]) || []);
      alert("Timetable session added!");
    } catch (err) {
      console.error("Failed to create timetable slot:", err);
    }
  };

  if (loading || !trainer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const totalAtt = traineeAttendanceLogs.length;
  const presentAtt = traineeAttendanceLogs.filter(
    (a) => a.status === "Present" || a.status === "Late",
  ).length;
  const traineeAttRate =
    totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : "100.0";

  const avgTrainerRating =
    trainerReviews.length > 0
      ? (
          trainerReviews.reduce((acc, r) => acc + r.rating, 0) /
          trainerReviews.length
        ).toFixed(1)
      : "5.0";

  const has10thCert = documents.some((d) => d.document_type === "cert_10th");
  const has12thCert = documents.some((d) => d.document_type === "cert_12th");
  const hasUgCert = documents.some((d) => d.document_type === "ug_degree");
  const hasGovtId =
    citizenshipType === "INDIAN"
      ? documents.some((d) =>
          [
            "aadhaar_card",
            "pan_card",
            "voter_id",
            "driving_license",
            "passport",
          ].includes(d.document_type),
        )
      : documents.some((d) => d.document_type === "nri_certificate");
  const hasOtherDegreeCert = documents.some(
    (d) => d.document_type === "other_degree",
  );
  const hasPwcCert = documents.some(
    (d) => d.document_type === "pwc_certificate",
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Controls with Update Details Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/trainers"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trainers Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Updated
              Successfully
            </span>
          )}

          {!isEditing ? (
            <button
              onClick={() => {
                setActiveTab("profile");
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Identity Card */}
      <div className="p-6 rounded-3xl bg-white/80 border border-white/90 shadow-xl shadow-blue-500/5 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center group relative">
            <div className="w-24 h-28 rounded-2xl bg-gradient-to-b from-blue-100 to-indigo-200 border-2 border-blue-400/40 flex items-center justify-center shadow-inner overflow-hidden relative">
              {trainer.photo_url && trainer.photo_url !== "NA" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt="Trainer Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-blue-700/60" />
              )}

              {isEditing && (
                <label className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold mt-1">Change</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              )}
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 uppercase tracking-wide text-center">
              {trainer.profiles?.full_name || "NA"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 flex-1 text-xs w-full">
            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                TRAINER ID:{" "}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={
                    trainer.employee_id === "NA"
                      ? ""
                      : (trainer.employee_id ?? "")
                  }
                  onChange={(e) =>
                    handleFieldChange("employee_id", e.target.value)
                  }
                  className="font-bold text-slate-800 bg-white/70 border border-slate-300 px-2 py-0.5 rounded ml-1"
                />
              ) : (
                <span className="font-bold text-slate-800">
                  {trainer.employee_id || "NA"}
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                PORTAL EMAIL:{" "}
              </span>
              <span className="font-bold text-slate-800">
                {trainer.profiles?.email || "NA"}
              </span>
            </div>
            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                DEPARTMENT:{" "}
              </span>
              {isEditing ? (
                <div className="inline-flex gap-1 ml-1 w-2/3">
                  <input
                    type="text"
                    placeholder="Designation"
                    value={
                      trainer.designation === "NA"
                        ? ""
                        : (trainer.designation ?? "")
                    }
                    onChange={(e) =>
                      handleFieldChange("designation", e.target.value)
                    }
                    className="font-bold text-slate-800 bg-white/70 border border-slate-300 px-2 py-0.5 rounded w-1/2"
                  />
                  <input
                    type="text"
                    placeholder="Dept"
                    value={
                      trainer.department === "NA"
                        ? ""
                        : (trainer.department ?? "")
                    }
                    onChange={(e) =>
                      handleFieldChange("department", e.target.value)
                    }
                    className="font-bold text-slate-800 bg-white/70 border border-slate-300 px-2 py-0.5 rounded w-1/2"
                  />
                </div>
              ) : (
                <span className="font-bold text-slate-800">
                  {trainer.designation || "Head"} &bull;{" "}
                  {trainer.department || "System Architecture"}
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                OVERALL TRAINEE RATING:{" "}
              </span>
              <span className="font-bold text-amber-600 inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> {avgTrainerRating}{" "}
                / 5.0 ({trainerReviews.length} Trainees Rated)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: "profile", label: "Trainer Profile & Vault", icon: User },
          { id: "timetable", label: "Timetable", icon: Clock },
          {
            id: "trainee_access",
            label: "Trainee Operations & Attendance",
            icon: Layers,
          },
          {
            id: "feedback_and_reviews",
            label: "Trainee Feedback & Reviews",
            icon: Star,
          },
          { id: "materials", label: "Subject Zip Vault", icon: FolderArchive },
          { id: "company_appraisal", label: "Company Appraisal", icon: Award },
          { id: "payroll", label: "Payroll & CTC", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                  : "bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FULL TRAINER PROFILE & CERTIFICATE VAULT */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <User className="w-4 h-4" />
                </div>
                <span>PERSONAL INFORMATION</span>
              </div>
              {openSections.personal ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.personal && (
              <div className="p-5 text-xs bg-amber-50/25 divide-y divide-amber-200/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5">
                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      APPLICATION NUMBER
                    </span>
                    <span className="font-semibold text-slate-800">
                      {trainer.application_number || "NA"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      TRAINER FULL NAME
                    </span>
                    <span className="font-semibold text-slate-800">
                      {trainer.profiles?.full_name || "NA"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      DATE OF BIRTH
                    </span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          trainer.dob && trainer.dob !== "NA" ? trainer.dob : ""
                        }
                        onChange={(e) =>
                          handleFieldChange("dob", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2 cursor-pointer font-medium"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainer.dob && trainer.dob !== "NA"
                          ? new Date(trainer.dob).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      GENDER
                    </span>
                    {isEditing ? (
                      <select
                        value={trainer.gender || "Female"}
                        onChange={(e) =>
                          handleFieldChange("gender", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2 font-medium"
                      >
                        {GENDER_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainer.gender || "Female"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      NATIVE LANGUAGE
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          trainer.native_language === "NA"
                            ? ""
                            : (trainer.native_language ?? "")
                        }
                        onChange={(e) =>
                          handleFieldChange("native_language", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainer.native_language || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      BLOOD GROUP
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          trainer.blood_group === "NA"
                            ? ""
                            : (trainer.blood_group ?? "")
                        }
                        onChange={(e) =>
                          handleFieldChange("blood_group", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainer.blood_group || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      PERSON WITH DISABILITY (PwD)
                    </span>
                    {isEditing ? (
                      <select
                        value={trainer.has_disability ? "YES" : "NO"}
                        onChange={(e) =>
                          handleFieldChange(
                            "has_disability",
                            e.target.value === "YES",
                          )
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      >
                        <option value="NO">NO</option>
                        <option value="YES">YES</option>
                      </select>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainer.has_disability
                          ? "YES (PwD Certificate Applicable)"
                          : "NO / NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pr-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700 uppercase">
                        CITIZENSHIP / NATIONALITY
                      </span>
                      {isEditing ? (
                        <select
                          value={citizenshipType}
                          onChange={(e) => {
                            const val = e.target.value as "INDIAN" | "NRI";
                            setCitizenshipType(val);
                            handleFieldChange("nationality", val);
                          }}
                          className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                        >
                          <option value="INDIAN">INDIAN</option>
                          <option value="NRI">NRI / OVERSEAS</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {citizenshipType === "NRI"
                            ? `NRI (${trainer.nri_country || "Overseas"})`
                            : "INDIAN"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pr-4 md:col-span-2">
                    <span className="font-bold text-slate-700 uppercase">
                      MOBILE PHONE NUMBER
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          trainer.mobile_number === "NA"
                            ? ""
                            : (trainer.mobile_number ?? "")
                        }
                        onChange={(e) =>
                          handleFieldChange("mobile_number", e.target.value)
                        }
                        className="w-1/2 bg-white/80 border border-slate-200 px-2.5 py-1 rounded"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />{" "}
                        {trainer.mobile_number || "NA"}
                      </span>
                    )}
                  </div>
                </div>

                {/* CURRENT RESIDENTIAL ADDRESS & COMPANY HOUSING */}
                <div className="pt-4 space-y-3">
                  <div className="py-1 px-3 bg-blue-200/50 rounded font-bold text-blue-900 text-center tracking-wider uppercase">
                    CURRENT LOCATION &amp; COMPANY HOUSING
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                        <input
                          type="checkbox"
                          id="hostelCheck"
                          checked={trainer.is_company_hostel}
                          onChange={(e) =>
                            handleFieldChange(
                              "is_company_hostel",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor="hostelCheck"
                          className="text-xs font-bold text-slate-800"
                        >
                          Company Accommodation / Trainer Quarters Provided
                        </label>
                      </div>

                      {trainer.is_company_hostel && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Accommodation Details
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Faculty Block C, Suite 402"
                            value={
                              trainer.company_hostel_details === "NA"
                                ? ""
                                : (trainer.company_hostel_details ?? "")
                            }
                            onChange={(e) =>
                              handleFieldChange(
                                "company_hostel_details",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Country
                          </label>
                          <select
                            value={selectedCurrentCountryDropdown}
                            onChange={(e) => {
                              setSelectedCurrentCountryDropdown(e.target.value);
                              handleFieldChange(
                                "current_country",
                                e.target.value,
                              );
                            }}
                            className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                          >
                            {Object.keys(GLOBAL_COUNTRIES_DATA).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            State
                          </label>
                          <select
                            value={selectedCurrentStateDropdown}
                            onChange={(e) => {
                              setSelectedCurrentStateDropdown(e.target.value);
                              handleFieldChange(
                                "current_state",
                                e.target.value,
                              );
                            }}
                            className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                          >
                            {(
                              GLOBAL_COUNTRIES_DATA[
                                selectedCurrentCountryDropdown
                              ]?.states || ["Other"]
                            ).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="City"
                            value={
                              trainer.current_city === "NA"
                                ? ""
                                : (trainer.current_city ?? "")
                            }
                            onChange={(e) =>
                              handleFieldChange("current_city", e.target.value)
                            }
                            className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={
                              trainer.current_address_line1 === "NA"
                                ? ""
                                : (trainer.current_address_line1 ?? "")
                            }
                            onChange={(e) =>
                              handleFieldChange(
                                "current_address_line1",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            placeholder="Postal Code"
                            value={
                              trainer.current_pincode === "NA"
                                ? ""
                                : (trainer.current_pincode ?? "")
                            }
                            onChange={(e) =>
                              handleFieldChange(
                                "current_pincode",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/60 border border-slate-100 text-slate-800 space-y-1 text-xs">
                      {trainer.is_company_hostel && (
                        <p className="text-blue-700 font-bold">
                          🏢 Company Housing:{" "}
                          {trainer.company_hostel_details || "Provided"}
                        </p>
                      )}
                      <p>
                        <strong>Address:</strong>{" "}
                        {trainer.current_address_line1 || "NA"},{" "}
                        {trainer.current_city || "NA"},{" "}
                        {trainer.current_state || "NA"},{" "}
                        {trainer.current_country || "India"} -{" "}
                        {trainer.current_pincode || "NA"}
                      </p>
                    </div>
                  )}
                </div>

                {/* PERMANENT ADDRESS */}
                <div className="pt-4 space-y-3">
                  <div className="py-1 px-3 bg-blue-200/50 rounded font-bold text-blue-900 text-center tracking-wider uppercase">
                    PERMANENT RESIDENTIAL ADDRESS
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Country
                        </label>
                        <select
                          value={selectedPermCountryDropdown}
                          onChange={(e) => {
                            setSelectedPermCountryDropdown(e.target.value);
                            handleFieldChange("perm_country", e.target.value);
                          }}
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                        >
                          {Object.keys(GLOBAL_COUNTRIES_DATA).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          State
                        </label>
                        <select
                          value={selectedPermStateDropdown}
                          onChange={(e) => {
                            setSelectedPermStateDropdown(e.target.value);
                            handleFieldChange("perm_state", e.target.value);
                          }}
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                        >
                          {(
                            GLOBAL_COUNTRIES_DATA[selectedPermCountryDropdown]
                              ?.states || ["Other"]
                          ).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="City"
                          value={
                            trainer.perm_city === "NA"
                              ? ""
                              : (trainer.perm_city ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange("perm_city", e.target.value)
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          placeholder="Address Line 1"
                          value={
                            trainer.perm_address_line1 === "NA"
                              ? ""
                              : (trainer.perm_address_line1 ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "perm_address_line1",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={
                            trainer.perm_pincode === "NA"
                              ? ""
                              : (trainer.perm_pincode ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange("perm_pincode", e.target.value)
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/60 border border-slate-100 text-slate-800 space-y-1 text-xs">
                      <p>
                        <strong>Address:</strong>{" "}
                        {trainer.perm_address_line1 || "NA"},{" "}
                        {trainer.perm_city || "NA"},{" "}
                        {trainer.perm_state || "NA"},{" "}
                        {trainer.perm_country || "India"} -{" "}
                        {trainer.perm_pincode || "NA"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ACADEMIC QUALIFICATIONS */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("educational")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>ACADEMIC QUALIFICATIONS &amp; DEGREE DETAILS</span>
              </div>
              {openSections.educational ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.educational && (
              <div className="p-5 text-xs bg-amber-50/25 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 10th Standard with Labels */}
                  <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-indigo-950 uppercase block text-xs">
                      10TH STANDARD
                    </span>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            School Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. St. Xavier's High School"
                            value={
                              trainer.edu_10th_school === "NA"
                                ? ""
                                : (trainer.edu_10th_school ?? "")
                            }
                            onChange={(e) =>
                              handleFieldChange(
                                "edu_10th_school",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Board
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. CBSE"
                              value={
                                trainer.edu_10th_board === "NA"
                                  ? ""
                                  : (trainer.edu_10th_board ?? "")
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "edu_10th_board",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Percentage / CGPA
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 92.4%"
                              value={
                                trainer.edu_10th_percentage === "NA"
                                  ? ""
                                  : (trainer.edu_10th_percentage ?? "")
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "edu_10th_percentage",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-800 text-xs">
                        <strong>{trainer.edu_10th_school || "NA"}</strong>{" "}
                        &bull; {trainer.edu_10th_board || "NA"} &bull;{" "}
                        <span className="font-bold text-blue-700">
                          {trainer.edu_10th_percentage || "NA"}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* 12th Standard with Labels */}
                  <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-indigo-950 uppercase block text-xs">
                      12TH / DIPLOMA
                    </span>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            College / School Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Junior College"
                            value={
                              trainer.edu_12th_school === "NA"
                                ? ""
                                : (trainer.edu_12th_school ?? "")
                            }
                            onChange={(e) =>
                              handleFieldChange(
                                "edu_12th_school",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Board
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. State Board"
                              value={
                                trainer.edu_12th_board === "NA"
                                  ? ""
                                  : (trainer.edu_12th_board ?? "")
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "edu_12th_board",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Percentage / CGPA
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 88.6%"
                              value={
                                trainer.edu_12th_percentage === "NA"
                                  ? ""
                                  : (trainer.edu_12th_percentage ?? "")
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "edu_12th_percentage",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-800 text-xs">
                        <strong>{trainer.edu_12th_school || "NA"}</strong>{" "}
                        &bull; {trainer.edu_12th_board || "NA"} &bull;{" "}
                        <span className="font-bold text-blue-700">
                          {trainer.edu_12th_percentage || "NA"}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* COMPULSORY UG DEGREE DETAILS */}
                <div className="space-y-3">
                  <div className="py-1 px-3 bg-indigo-200/50 rounded font-bold text-indigo-950 tracking-wider uppercase flex items-center justify-between">
                    <span>
                      UNDERGRADUATE (UG) DEGREE DETAILS{" "}
                      <span className="text-rose-600">* (Compulsory)</span>
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">
                      Mandatory
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white/90 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Type of Degree
                        </label>
                        <select
                          value={trainer.ug_degree_type || "B.Tech / B.E."}
                          onChange={(e) =>
                            handleFieldChange("ug_degree_type", e.target.value)
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs font-semibold"
                        >
                          {UG_DEGREE_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Stream
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={
                            trainer.ug_stream === "NA"
                              ? ""
                              : (trainer.ug_stream ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange("ug_stream", e.target.value)
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          UG CGPA
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 8.9 CGPA"
                          value={
                            trainer.ug_cgpa === "NA"
                              ? ""
                              : (trainer.ug_cgpa ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange("ug_cgpa", e.target.value)
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          College Name
                        </label>
                        <input
                          type="text"
                          placeholder="College Name"
                          value={
                            trainer.ug_college_name === "NA"
                              ? ""
                              : (trainer.ug_college_name ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange("ug_college_name", e.target.value)
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Place
                        </label>
                        <input
                          type="text"
                          placeholder="Place of College"
                          value={
                            trainer.ug_college_place === "NA"
                              ? ""
                              : (trainer.ug_college_place ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "ug_college_place",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Year Joining
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2016"
                          value={
                            trainer.ug_year_joining === "NA"
                              ? ""
                              : (trainer.ug_year_joining ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange("ug_year_joining", e.target.value)
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Year Graduation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2020"
                          value={
                            trainer.ug_year_graduation === "NA"
                              ? ""
                              : (trainer.ug_year_graduation ?? "")
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "ug_year_graduation",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white/70 rounded-2xl border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-900 text-sm">
                        {trainer.ug_degree_type || "B.Tech"} -{" "}
                        {trainer.ug_stream || "CSE"}
                      </p>
                      <p className="text-slate-600">
                        {trainer.ug_college_name || "NA"},{" "}
                        {trainer.ug_college_place || "NA"}
                      </p>
                      <p className="text-slate-500 font-medium">
                        Batch: {trainer.ug_year_joining || "NA"} -{" "}
                        {trainer.ug_year_graduation || "NA"} &bull; CGPA:{" "}
                        <strong className="text-blue-700">
                          {trainer.ug_cgpa || "NA"}
                        </strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* ADDITIONAL DEGREES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1 px-3 bg-indigo-200/50 rounded font-bold text-indigo-950 uppercase tracking-wider">
                    <span>OTHER / HIGHER DEGREES</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalDegrees([
                            ...additionalDegrees,
                            {
                              degree_type: "M.Tech / M.E.",
                              stream: "Computer Science",
                              cgpa: "",
                              college_name: "",
                              college_place: "",
                              year_joining: "",
                              year_graduation: "",
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Degree
                      </button>
                    )}
                  </div>

                  {additionalDegrees.map((deg, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white/90 rounded-2xl border border-slate-200 relative space-y-3"
                    >
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() =>
                            setAdditionalDegrees(
                              additionalDegrees.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-3 right-3 p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Degree Type
                            </label>
                            <select
                              value={deg.degree_type}
                              onChange={(e) => {
                                const up = [...additionalDegrees];
                                up[idx].degree_type = e.target.value;
                                setAdditionalDegrees(up);
                              }}
                              className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                            >
                              {OTHER_DEGREE_OPTIONS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Stream
                            </label>
                            <input
                              type="text"
                              value={deg.stream}
                              onChange={(e) => {
                                const up = [...additionalDegrees];
                                up[idx].stream = e.target.value;
                                setAdditionalDegrees(up);
                              }}
                              className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              CGPA
                            </label>
                            <input
                              type="text"
                              value={deg.cgpa}
                              onChange={(e) => {
                                const up = [...additionalDegrees];
                                up[idx].cgpa = e.target.value;
                                setAdditionalDegrees(up);
                              }}
                              className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="font-bold text-slate-900">
                          {deg.degree_type} - {deg.stream} &bull;{" "}
                          {deg.college_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: WORK EXPERIENCE */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("experience")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>
                  WORK EXPERIENCE &amp; INDUSTRY BACKGROUND (
                  {workExperiences.length} Roles)
                </span>
              </div>
              {openSections.experience ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.experience && (
              <div className="p-5 text-xs bg-amber-50/25 space-y-4">
                <div className="flex items-center justify-between py-1 px-3 bg-blue-200/50 rounded font-bold text-blue-900 uppercase tracking-wider">
                  <span>WORK EXPERIENCES</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setWorkExperiences([
                          ...workExperiences,
                          {
                            company_name: "",
                            position: "",
                            start_date: "",
                            end_date: "",
                            currently_working: false,
                            role_description: "",
                            location: "",
                            stipend_or_ctc: "",
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Experience
                    </button>
                  )}
                </div>

                {workExperiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/90 rounded-2xl border border-slate-200 relative space-y-3"
                  >
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          setWorkExperiences(
                            workExperiences.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-3 right-3 p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Company
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Infosys"
                            value={exp.company_name}
                            onChange={(e) => {
                              const up = [...workExperiences];
                              up[idx].company_name = e.target.value;
                              setWorkExperiences(up);
                            }}
                            className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Position
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Lead Architect"
                            value={exp.position}
                            onChange={(e) => {
                              const up = [...workExperiences];
                              up[idx].position = e.target.value;
                              setWorkExperiences(up);
                            }}
                            className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            CTC / Package
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 18 LPA"
                            value={exp.stipend_or_ctc}
                            onChange={(e) => {
                              const up = [...workExperiences];
                              up[idx].stipend_or_ctc = e.target.value;
                              setWorkExperiences(up);
                            }}
                            className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {exp.position} &bull;{" "}
                          <span className="text-blue-700">
                            {exp.company_name}
                          </span>
                        </h4>
                        <p className="text-slate-500 font-medium">
                          {exp.start_date} -{" "}
                          {exp.currently_working ? "Present" : exp.end_date}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: FAMILY / GUARDIAN */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("family")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <Users className="w-4 h-4" />
                </div>
                <span>FAMILY / GUARDIAN INFORMATION</span>
              </div>
              {openSections.family ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.family && (
              <div className="p-5 text-xs bg-amber-50/25 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      FATHER / GUARDIAN NAME
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          trainer.father_name === "NA"
                            ? ""
                            : (trainer.father_name ?? "")
                        }
                        onChange={(e) =>
                          handleFieldChange("father_name", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainer.father_name || "NA"}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      MOBILE NUMBER
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          trainer.father_mobile === "NA"
                            ? ""
                            : (trainer.father_mobile ?? "")
                        }
                        onChange={(e) =>
                          handleFieldChange("father_mobile", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />{" "}
                        {trainer.father_mobile || "NA"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: CERTIFICATION VAULT & VERIFICATION */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("documents")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <FileText className="w-4 h-4" />
                </div>
                <span>
                  CERTIFICATION VAULT &amp; VERIFICATION ({documents.length}{" "}
                  Uploaded)
                </span>
              </div>
              {openSections.documents ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.documents && (
              <div className="p-5 text-xs bg-amber-50/25 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${has10thCert ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}
                  >
                    {has10thCert ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <p className="font-bold">10th Marksheet</p>
                      <p className="text-[10px] text-slate-500">
                        {has10thCert ? "Uploaded" : "Mandatory"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${has12thCert ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}
                  >
                    {has12thCert ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <p className="font-bold">12th Marksheet</p>
                      <p className="text-[10px] text-slate-500">
                        {has12thCert ? "Uploaded" : "Mandatory"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${hasUgCert ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}
                  >
                    {hasUgCert ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <p className="font-bold">UG Degree</p>
                      <p className="text-[10px] text-slate-500">
                        {hasUgCert ? "Uploaded" : "Mandatory"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${hasGovtId ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}
                  >
                    {hasGovtId ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <p className="font-bold">Govt ID</p>
                      <p className="text-[10px] text-slate-500">
                        {hasGovtId ? "Uploaded" : "Mandatory"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${hasOtherDegreeCert ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-slate-200"}`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${hasOtherDegreeCert ? "text-emerald-600" : "text-slate-400"}`}
                    />
                    <div>
                      <p className="font-bold">Higher Degree</p>
                      <p className="text-[10px] text-slate-500">
                        {hasOtherDegreeCert ? "Uploaded" : "Optional"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${hasPwcCert ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-slate-200"}`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${hasPwcCert ? "text-emerald-600" : "text-slate-400"}`}
                    />
                    <div>
                      <p className="font-bold">PwD Cert</p>
                      <p className="text-[10px] text-slate-500">
                        {hasPwcCert ? "Uploaded" : "Optional"}
                      </p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <form
                    onSubmit={handleFileUpload}
                    className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-3"
                  >
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                      Upload Document Slot
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Category
                        </label>
                        <select
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        >
                          <option value="ug_degree">
                            UG Degree Certificate (Compulsory)
                          </option>
                          <option value="cert_10th">
                            10th Marksheet (Compulsory)
                          </option>
                          <option value="cert_12th">
                            12th Marksheet (Compulsory)
                          </option>
                          <option value="govt_id">
                            Government ID (Compulsory)
                          </option>
                          <option value="other_degree">
                            Higher Degree Certificate
                          </option>
                          <option value="pwc_certificate">
                            PwD Certificate
                          </option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Select File
                        </label>
                        <input
                          type="file"
                          required
                          onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                          className="text-xs"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={uploadingDoc || !selectedFile}
                          className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          {uploadingDoc ? "Uploading..." : "Upload Document"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white/90 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {doc.file_name}
                        </p>
                        <p className="text-[10px] text-blue-600 font-semibold uppercase">
                          {doc.document_type.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleDownloadFile(doc.file_path, doc.file_name)
                          }
                          className="p-1.5 bg-slate-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {isEditing && (
                          <button
                            onClick={() =>
                              handleDeleteDoc(doc.id, doc.file_path)
                            }
                            className="p-1.5 bg-slate-50 text-rose-600 rounded hover:bg-rose-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TIMETABLE */}
      {activeTab === "timetable" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddTimetableSlot}
            className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4"
          >
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Schedule Faculty Lecture / Lab Session
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Batch
                </label>
                <select
                  value={newSlot.batch_name}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, batch_name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2 rounded-xl font-medium"
                >
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={newSlot.day_of_week}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, day_of_week: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2 rounded-xl font-medium"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  placeholder="09:00 AM"
                  value={newSlot.start_time}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, start_time: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  placeholder="10:30 AM"
                  value={newSlot.end_time}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, end_time: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  placeholder="CS602"
                  value={newSlot.subject_code}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, subject_code: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2 rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="Neural Networks & Deep Learning"
                  value={newSlot.subject_name}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, subject_name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Room / Venue
                </label>
                <input
                  type="text"
                  placeholder="Lab 402"
                  value={newSlot.room_number}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, room_number: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> Add Session to Timetable
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map((day) => {
              const daySlots = timetableSlots.filter(
                (t) => t.day_of_week === day,
              );
              return (
                <div
                  key={day}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
                      {day}
                    </span>
                    <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {daySlots.length} Sessions
                    </span>
                  </div>

                  {daySlots.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-2 text-center">
                      No scheduled slots
                    </p>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {slot.start_time} - {slot.end_time}
                          </span>
                          <span className="font-bold text-[10px] text-emerald-700">
                            {slot.batch_name}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">
                          {slot.subject_code}: {slot.subject_name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Room: {slot.room_number}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TRAINEE OPERATIONS & ATTENDANCE */}
      {activeTab === "trainee_access" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
                1. Select Assigned Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  setSelectedTraineeId("");
                }}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-2xl text-xs font-bold text-slate-800"
              >
                {availableBatches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
                2. Select Trainee under {selectedBatch}
              </label>
              <select
                value={selectedTraineeId}
                onChange={(e) => setSelectedTraineeId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 rounded-2xl text-xs font-bold text-slate-800"
              >
                <option value="">
                  -- Choose Trainee by Application ID / Name --
                </option>
                {batchTrainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.application_number || "REG: NA"} -{" "}
                    {t.profiles?.full_name || "Trainee"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTraineeId && selectedTraineeObj ? (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                    {selectedTraineeObj.application_number}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {selectedTraineeObj.profiles?.full_name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {selectedTraineeObj.profiles?.email}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Calculated Attendance
                  </span>
                  <p className="text-2xl font-black text-blue-700">
                    {traineeAttRate}%
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleMarkTraineeAttendance}
                className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4"
              >
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                  Mark / Update Trainee Attendance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Session Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newAttDate}
                      onChange={(e) => setNewAttDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={newAttSubject}
                      onChange={(e) => setNewAttSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newAttStatus}
                      onChange={(e) =>
                        setNewAttStatus(e.target.value as typeof newAttStatus)
                      }
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl font-medium"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Excused">Excused Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lab task completed"
                      value={newAttRemarks}
                      onChange={(e) => setNewAttRemarks(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    Save Attendance Status
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-white/60 rounded-3xl border border-slate-200 text-slate-500 text-xs font-semibold">
              Select a batch and trainee to manage attendance and records.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TRAINEE FEEDBACK & REVIEWS */}
      {activeTab === "feedback_and_reviews" && (
        <div className="space-y-6">
          <form
            onSubmit={handleSaveEvaluation}
            className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4"
          >
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              {editingEvalId
                ? "Update Trainee Feedback"
                : "Give Trainee Feedback & Rating"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Trainee
                </label>
                <select
                  required
                  value={selectedTraineeId}
                  onChange={(e) => setSelectedTraineeId(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                >
                  <option value="">-- Choose Trainee --</option>
                  {allTrainees.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.profiles?.full_name || "Trainee"} (
                      {t.application_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  required
                  value={feedbackForm.subject_code}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      subject_code: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rating
                </label>
                <select
                  value={feedbackForm.rating}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      rating: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                >
                  <option value={5}>5 Stars - Outstanding</option>
                  <option value={4}>4 Stars - Exceeds Expectations</option>
                  <option value={3}>3 Stars - Meets Standards</option>
                  <option value={2}>2 Stars - Needs Improvement</option>
                  <option value={1}>1 Star - Unsatisfactory</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Key Strengths
                </label>
                <input
                  type="text"
                  placeholder="e.g. Excellent problem solving"
                  value={feedbackForm.strengths}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      strengths: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Areas for Development
                </label>
                <input
                  type="text"
                  placeholder="e.g. Practice dynamic programming"
                  value={feedbackForm.improvements}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      improvements: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Remarks
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide structured notes on the trainee's progress..."
                  value={feedbackForm.detailed_feedback}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      detailed_feedback: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {editingEvalId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEvalId(null);
                    setFeedbackForm({
                      rating: 5,
                      subject_code: "CS602",
                      strengths: "",
                      improvements: "",
                      detailed_feedback: "",
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                <Save className="w-4 h-4" />{" "}
                {editingEvalId ? "Update Feedback" : "Submit Feedback"}
              </button>
            </div>
          </form>

          {/* Feedback Given to Trainees */}
          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Feedback Given to Trainees ({traineeEvaluations.length})
            </h3>

            <div className="space-y-3">
              {traineeEvaluations.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex justify-between items-start gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {ev.subject_code}
                      </span>
                      <span className="font-bold text-slate-900">
                        {ev.evaluation_date}
                      </span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: ev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 italic">
                      &ldquo;{ev.detailed_feedback}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingEvalId(ev.id);
                        setSelectedTraineeId(ev.trainee_id);
                        setFeedbackForm({
                          rating: ev.rating,
                          subject_code: ev.subject_code,
                          strengths: ev.strengths || "",
                          improvements: ev.improvements || "",
                          detailed_feedback: ev.detailed_feedback,
                        });
                      }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvaluation(ev.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Received from Trainees */}
          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Reviews &amp; Ratings Received from Trainees (
              {trainerReviews.length})
            </h3>

            <div className="space-y-3">
              {trainerReviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No reviews submitted by trainees yet.
                </p>
              ) : (
                trainerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">
                        {rev.trainees?.profiles?.full_name || "Trainee"} (
                        {rev.trainees?.application_number || "REG: NA"})
                      </span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 italic">
                      &ldquo;{rev.feedback}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUBJECT ZIP VAULT */}
      {activeTab === "materials" && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedZipFile) return;
              setUploadingZip(true);
              try {
                const sanitized = `${Date.now()}_${selectedZipFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
                const filePath = `materials/${zipForm.subject_code}/${sanitized}`;
                await supabase.storage
                  .from("trainee-vault")
                  .upload(filePath, selectedZipFile);
                const sizeMb = Number(
                  (selectedZipFile.size / (1024 * 1024)).toFixed(2),
                );
                await supabase.from("subject_materials").insert([
                  {
                    trainer_id: trainerId,
                    subject_code: zipForm.subject_code,
                    subject_title: zipForm.subject_title,
                    batch_name: zipForm.batch_name,
                    zip_title: zipForm.zip_title,
                    description: zipForm.description,
                    file_name: selectedZipFile.name,
                    file_path: filePath,
                    file_size_mb: sizeMb,
                  },
                ]);
                const { data } = await supabase
                  .from("subject_materials")
                  .select("*")
                  .eq("trainer_id", trainerId);
                setMaterials((data as unknown as MaterialZip[]) || []);
                setSelectedZipFile(null);
                setZipForm({ ...zipForm, zip_title: "", description: "" });
                alert("Course material bundle published!");
              } finally {
                setUploadingZip(false);
              }
            }}
            className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-4"
          >
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Publish Subject Material (.ZIP Bundle for Trainees)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  required
                  value={zipForm.subject_code}
                  onChange={(e) =>
                    setZipForm({ ...zipForm, subject_code: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Batch
                </label>
                <select
                  value={zipForm.batch_name}
                  onChange={(e) =>
                    setZipForm({ ...zipForm, batch_name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                >
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Archive Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Lab Codes"
                  value={zipForm.zip_title}
                  onChange={(e) =>
                    setZipForm({ ...zipForm, zip_title: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Datasets and notebooks"
                  value={zipForm.description}
                  onChange={(e) =>
                    setZipForm({ ...zipForm, description: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Archive (.zip)
                </label>
                <input
                  type="file"
                  required
                  accept=".zip,.rar,.tar.gz"
                  onChange={(e) =>
                    setSelectedZipFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploadingZip || !selectedZipFile}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {uploadingZip ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>Publish Material</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: COMPANY APPRAISAL */}
      {activeTab === "company_appraisal" && (
        <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Company Appraisal &amp; Performance Metrics
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Faculty benchmarks and organization reviews
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                KPI Rating Trend
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Top 5% Faculty Band
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-slate-300 uppercase block font-semibold">
                  Teaching Efficacy
                </span>
                <p className="text-xl font-black text-amber-300 mt-1">
                  4.9 / 5.0
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-slate-300 uppercase block font-semibold">
                  Punctuality Score
                </span>
                <p className="text-xl font-black text-emerald-300 mt-1">
                  98.4%
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-slate-300 uppercase block font-semibold">
                  Trainee Clearance
                </span>
                <p className="text-xl font-black text-cyan-300 mt-1">94.2%</p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-slate-300 uppercase block font-semibold">
                  Overall Grade
                </span>
                <p className="text-xl font-black text-violet-300 mt-1">
                  Grade A+
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PAYROLL */}
      {activeTab === "payroll" && (
        <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            Faculty Payroll &amp; Compensation Records
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase">
                  <th className="p-3">Period</th>
                  <th className="p-3">Basic Pay</th>
                  <th className="p-3">Allowances</th>
                  <th className="p-3">Bonus</th>
                  <th className="p-3">Net Disbursed</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {payrolls.map((pay) => (
                  <tr key={pay.id}>
                    <td className="p-3 font-bold text-slate-900">
                      {pay.salary_month} {pay.salary_year}
                    </td>
                    <td className="p-3">
                      ₹{Number(pay.basic_pay).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      ₹
                      {(
                        Number(pay.hra) + Number(pay.special_allowance)
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-emerald-700 font-bold">
                      +₹{Number(pay.performance_bonus).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">
                      ₹{Number(pay.net_salary).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {pay.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
