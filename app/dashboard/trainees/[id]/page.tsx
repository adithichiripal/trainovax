"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import {
  User,
  GraduationCap,
  Users,
  Home,
  ShieldCheck,
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
  BookOpen,
  Calendar as CalendarIcon,
  Award,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Comprehensive International Countries with Dial Codes and Phone Lengths
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
  "United States": {
    dialCode: "+1",
    phoneDigits: 10,
    states: [
      "California",
      "Texas",
      "Florida",
      "New York",
      "Illinois",
      "Pennsylvania",
      "Ohio",
      "Georgia",
      "North Carolina",
      "Michigan",
      "New Jersey",
      "Virginia",
      "Washington",
      "Other",
    ],
  },
  "United Kingdom": {
    dialCode: "+44",
    phoneDigits: 10,
    states: ["England", "Scotland", "Wales", "Northern Ireland", "Other"],
  },
  "United Arab Emirates": {
    dialCode: "+971",
    phoneDigits: 9,
    states: [
      "Abu Dhabi",
      "Dubai",
      "Sharjah",
      "Ajman",
      "Umm Al Quwain",
      "Ras Al Khaimah",
      "Fujairah",
      "Other",
    ],
  },
  Canada: {
    dialCode: "+1",
    phoneDigits: 10,
    states: [
      "Ontario",
      "Quebec",
      "British Columbia",
      "Alberta",
      "Manitoba",
      "Nova Scotia",
      "Other",
    ],
  },
  Australia: {
    dialCode: "+61",
    phoneDigits: 9,
    states: [
      "New South Wales",
      "Victoria",
      "Queensland",
      "Western Australia",
      "South Australia",
      "Tasmania",
      "Other",
    ],
  },
  "New Zealand": {
    dialCode: "+64",
    phoneDigits: 9,
    states: [
      "Auckland",
      "Canterbury",
      "Wellington",
      "Waikato",
      "Bay of Plenty",
      "Other",
    ],
  },
  Singapore: {
    dialCode: "+65",
    phoneDigits: 8,
    states: [
      "Central Region",
      "East Region",
      "North Region",
      "North-East Region",
      "West Region",
      "Other",
    ],
  },
  Germany: {
    dialCode: "+49",
    phoneDigits: 11,
    states: [
      "Bavaria",
      "Baden-Württemberg",
      "North Rhine-Westphalia",
      "Hesse",
      "Berlin",
      "Other",
    ],
  },
  France: {
    dialCode: "+33",
    phoneDigits: 9,
    states: [
      "Île-de-France",
      "Auvergne-Rhône-Alpes",
      "Nouvelle-Aquitaine",
      "Occitanie",
      "Other",
    ],
  },
  "Saudi Arabia": {
    dialCode: "+966",
    phoneDigits: 9,
    states: ["Riyadh", "Makkah", "Eastern Province", "Madinah", "Other"],
  },
  Qatar: {
    dialCode: "+974",
    phoneDigits: 8,
    states: ["Doha", "Al Rayyan", "Al Wakrah", "Other"],
  },
  Kuwait: {
    dialCode: "+965",
    phoneDigits: 8,
    states: ["Al Asimah", "Hawalli", "Farwaniya", "Ahmadi", "Other"],
  },
  Oman: {
    dialCode: "+968",
    phoneDigits: 8,
    states: ["Muscat", "Dhofar", "Al Batinah", "Other"],
  },
  Bahrain: {
    dialCode: "+973",
    phoneDigits: 8,
    states: ["Capital", "Muharraq", "Northern", "Southern", "Other"],
  },
  Malaysia: {
    dialCode: "+60",
    phoneDigits: 10,
    states: [
      "Selangor",
      "Kuala Lumpur",
      "Penang",
      "Johor",
      "Sarawak",
      "Sabah",
      "Other",
    ],
  },
  Japan: {
    dialCode: "+81",
    phoneDigits: 10,
    states: [
      "Tokyo",
      "Osaka",
      "Kanagawa",
      "Aichi",
      "Hokkaido",
      "Fukuoka",
      "Other",
    ],
  },
  "South Africa": {
    dialCode: "+27",
    phoneDigits: 9,
    states: [
      "Gauteng",
      "Western Cape",
      "KwaZulu-Natal",
      "Eastern Cape",
      "Other",
    ],
  },
  Ireland: {
    dialCode: "+353",
    phoneDigits: 9,
    states: ["Leinster", "Munster", "Connacht", "Ulster", "Other"],
  },
  Other: {
    dialCode: "+1",
    phoneDigits: 10,
    states: ["Other"],
  },
};

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Transgender",
  "Do not want to disclose",
] as const;

interface TraineeFullData {
  id: string;
  photo_url: string | null;
  reg_number: string | null;
  application_number: string | null;
  program_branch: string | null;
  school_name: string | null;
  dob: string | null;
  gender: string | null;
  blood_group: string | null;
  native_language: string | null;
  native_state: string | null;
  nationality: string | null;
  nri_country: string | null;
  has_disability: boolean;
  aadhar_number: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  // Current Address
  current_country: string | null;
  current_address_line1: string | null;
  current_address_line2: string | null;
  current_city: string | null;
  current_state: string | null;
  current_pincode: string | null;
  // Permanent Address
  perm_country: string | null;
  perm_address_line1: string | null;
  perm_address_line2: string | null;
  perm_city: string | null;
  perm_state: string | null;
  perm_pincode: string | null;
  // Educational 10th
  edu_10th_school: string | null;
  edu_10th_board: string | null;
  edu_10th_percentage: string | null;
  edu_10th_year: string | null;
  // Educational 12th
  edu_12th_school: string | null;
  edu_12th_board: string | null;
  edu_12th_percentage: string | null;
  edu_12th_year: string | null;
  applied_degree: string | null;
  // Family
  father_name: string | null;
  father_country: string | null;
  father_phone_code: string | null;
  father_qualification: string | null;
  father_occupation: string | null;
  father_organization: string | null;
  father_mobile: string | null;
  father_email: string | null;
  annual_income: string | null;
  // Hostel
  is_hosteller: boolean;
  hostel_block: string | null;
  hostel_room_no: string | null;
  hostel_bed_type: string | null;
  hostel_mess: string | null;
  batch_id: string | null;
  trainer_id: string | null;
  overall_score: number;
  attendance_rate: number;
  profiles?: {
    full_name: string;
    email: string;
  };
  batches?: {
    batch_name: string;
  };
  trainers?: {
    id: string;
    employee_id: string | null;
    designation: string | null;
    department: string | null;
    cabin_number: string | null;
    mobile_number: string | null;
    profiles?: {
      full_name: string;
      email: string;
    };
  };
}

interface TraineeDocument {
  id: string;
  trainee_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

export default function TraineePortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const traineeId = resolvedParams.id;

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "profile" | "courses" | "attendance" | "events" | "performance"
  >("profile");

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [trainee, setTrainee] = useState<TraineeFullData | null>(null);

  // NRI Selectors
  const [selectedNriCountryDropdown, setSelectedNriCountryDropdown] =
    useState("New Zealand");
  const [customNriCountry, setCustomNriCountry] = useState("");

  // Father Selectors
  const [selectedFatherCountryDropdown, setSelectedFatherCountryDropdown] =
    useState("India");
  const [customFatherCountry, setCustomFatherCountry] = useState("");

  // Current & Permanent Address Selectors
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

  // Verification & Document States
  const [citizenshipType, setCitizenshipType] = useState<"INDIAN" | "NRI">(
    "INDIAN",
  );
  const [selectedGovtIdType, setSelectedGovtIdType] = useState("aadhaar_card");
  const [docCategory, setDocCategory] = useState<
    "govt_id" | "cert_10th" | "cert_12th" | "disability_cert" | "other"
  >("govt_id");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState({
    personal: true,
    educational: true,
    family: true,
    proctor: true,
    hostel: true,
    documents: true,
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [documents, setDocuments] = useState<TraineeDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [traineeRes, docRes] = await Promise.all([
          supabase
            .from("trainees")
            .select(
              `
              *,
              profiles(full_name, email),
              batches(batch_name),
              trainers(id, employee_id, designation, department, cabin_number, mobile_number, profiles(full_name, email))
            `,
            )
            .eq("id", traineeId)
            .single(),
          supabase
            .from("trainee_documents")
            .select("*")
            .eq("trainee_id", traineeId)
            .order("created_at", { ascending: false }),
        ]);

        if (traineeRes.error) throw traineeRes.error;
        if (isMounted) {
          const tData = traineeRes.data as unknown as TraineeFullData;
          setTrainee(tData);
          setDocuments((docRes.data as unknown as TraineeDocument[]) || []);

          const isNri =
            tData.nationality?.toUpperCase() === "NRI" ||
            tData.nationality?.toUpperCase() === "NON-INDIAN";
          setCitizenshipType(isNri ? "NRI" : "INDIAN");

          // Initialize NRI country selector
          const nCountry = tData.nri_country || "New Zealand";
          if (GLOBAL_COUNTRIES_DATA[nCountry]) {
            setSelectedNriCountryDropdown(nCountry);
          } else {
            setSelectedNriCountryDropdown("Other");
            setCustomNriCountry(nCountry);
          }

          // Initialize Father country selector
          const fCountry = tData.father_country || "India";
          if (GLOBAL_COUNTRIES_DATA[fCountry]) {
            setSelectedFatherCountryDropdown(fCountry);
          } else {
            setSelectedFatherCountryDropdown("Other");
            setCustomFatherCountry(fCountry);
          }

          // Initialize Current Address Selectors
          const cCountry = tData.current_country || "India";
          if (GLOBAL_COUNTRIES_DATA[cCountry]) {
            setSelectedCurrentCountryDropdown(cCountry);
          } else {
            setSelectedCurrentCountryDropdown("Other");
            setCustomCurrentCountry(cCountry);
          }

          const cState = tData.current_state || "Andhra Pradesh";
          const validCurrentStates =
            GLOBAL_COUNTRIES_DATA[cCountry]?.states || [];
          if (validCurrentStates.includes(cState)) {
            setSelectedCurrentStateDropdown(cState);
          } else {
            setSelectedCurrentStateDropdown("Other");
            setCustomCurrentState(cState);
          }

          // Initialize Permanent Address Selectors
          const pCountry = tData.perm_country || "India";
          if (GLOBAL_COUNTRIES_DATA[pCountry]) {
            setSelectedPermCountryDropdown(pCountry);
          } else {
            setSelectedPermCountryDropdown("Other");
            setCustomPermCountry(pCountry);
          }

          const pState = tData.perm_state || "Andhra Pradesh";
          const validPermStates = GLOBAL_COUNTRIES_DATA[pCountry]?.states || [];
          if (validPermStates.includes(pState)) {
            setSelectedPermStateDropdown(pState);
          } else {
            setSelectedPermStateDropdown("Other");
            setCustomPermState(pState);
          }
        }
      } catch (err) {
        console.error("Failed to load candidate profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (traineeId) loadData();
    return () => {
      isMounted = false;
    };
  }, [traineeId]);

  const handleFieldChange = <K extends keyof TraineeFullData>(
    key: K,
    value: TraineeFullData[K],
  ) => {
    if (!trainee) return;
    setTrainee({ ...trainee, [key]: value });
  };

  const validatePhoneNumber = (rawNumber: string, countryKey: string) => {
    const digitsOnly = rawNumber.replace(/\D/g, "");
    const countryConfig =
      GLOBAL_COUNTRIES_DATA[countryKey] || GLOBAL_COUNTRIES_DATA.Other;
    if (digitsOnly.length === 0) {
      setPhoneError(null);
      return;
    }
    if (digitsOnly.length !== countryConfig.phoneDigits) {
      setPhoneError(
        `Phone number for ${countryKey} must be ${countryConfig.phoneDigits} digits.`,
      );
    } else {
      setPhoneError(null);
    }
  };

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "");
    handleFieldChange("phone_number", digitsOnly);
    const activeCountry =
      citizenshipType === "NRI"
        ? selectedNriCountryDropdown
        : selectedCurrentCountryDropdown;
    validatePhoneNumber(digitsOnly, activeCountry);
  };

  const handleCitizenshipChange = (type: "INDIAN" | "NRI") => {
    setCitizenshipType(type);
    if (!trainee) return;
    handleFieldChange("nationality", type);

    if (type === "NRI") {
      const nriCountry =
        selectedNriCountryDropdown === "Other"
          ? customNriCountry
          : selectedNriCountryDropdown;
      const config =
        GLOBAL_COUNTRIES_DATA[nriCountry] || GLOBAL_COUNTRIES_DATA.Other;
      handleFieldChange("phone_country_code", config.dialCode);
      if (trainee.phone_number)
        validatePhoneNumber(trainee.phone_number, nriCountry);
    } else {
      const currentCountry =
        selectedCurrentCountryDropdown === "Other"
          ? customCurrentCountry
          : selectedCurrentCountryDropdown;
      const config =
        GLOBAL_COUNTRIES_DATA[currentCountry] || GLOBAL_COUNTRIES_DATA.Other;
      handleFieldChange("phone_country_code", config.dialCode);
      if (trainee.phone_number)
        validatePhoneNumber(trainee.phone_number, currentCountry);
    }
  };

  const handleNriCountryDropdownChange = (country: string) => {
    setSelectedNriCountryDropdown(country);
    const config =
      GLOBAL_COUNTRIES_DATA[country] || GLOBAL_COUNTRIES_DATA.Other;
    const resolved =
      country === "Other" ? customNriCountry || "Other" : country;

    handleFieldChange("nri_country", resolved);
    handleFieldChange("phone_country_code", config.dialCode);

    if (trainee?.phone_number) {
      validatePhoneNumber(trainee.phone_number, resolved);
    }
  };

  const handleFatherCountryDropdownChange = (country: string) => {
    setSelectedFatherCountryDropdown(country);
    const config =
      GLOBAL_COUNTRIES_DATA[country] || GLOBAL_COUNTRIES_DATA.Other;
    const resolved =
      country === "Other" ? customFatherCountry || "Other" : country;

    handleFieldChange("father_country", resolved);
    handleFieldChange("father_phone_code", config.dialCode);
  };

  const handleCurrentCountryDropdownChange = (country: string) => {
    setSelectedCurrentCountryDropdown(country);
    const config =
      GLOBAL_COUNTRIES_DATA[country] || GLOBAL_COUNTRIES_DATA.Other;
    const resolvedCountryName =
      country === "Other" ? customCurrentCountry || "Other" : country;
    const defaultState =
      config.states && config.states.length > 0 ? config.states[0] : "";

    setSelectedCurrentStateDropdown(defaultState);
    handleFieldChange("current_country", resolvedCountryName);
    handleFieldChange("current_state", defaultState);

    if (citizenshipType === "INDIAN") {
      handleFieldChange("phone_country_code", config.dialCode);
      if (trainee?.phone_number) {
        validatePhoneNumber(trainee.phone_number, resolvedCountryName);
      }
    }
  };

  const handlePermCountryDropdownChange = (country: string) => {
    setSelectedPermCountryDropdown(country);
    const config =
      GLOBAL_COUNTRIES_DATA[country] || GLOBAL_COUNTRIES_DATA.Other;
    const resolvedCountryName =
      country === "Other" ? customPermCountry || "Other" : country;
    const defaultState =
      config.states && config.states.length > 0 ? config.states[0] : "";

    setSelectedPermStateDropdown(defaultState);
    handleFieldChange("perm_country", resolvedCountryName);
    handleFieldChange("perm_state", defaultState);
  };

  const handleSaveProfile = async () => {
    if (!trainee) return;
    if (phoneError) {
      alert(`Please fix the phone number error: ${phoneError}`);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      if (trainee.profiles?.full_name) {
        await supabase
          .from("profiles")
          .update({ full_name: trainee.profiles.full_name })
          .eq("id", traineeId);
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

      const activeCallingCode =
        citizenshipType === "NRI"
          ? (GLOBAL_COUNTRIES_DATA[selectedNriCountryDropdown]?.dialCode ??
            trainee.phone_country_code ??
            "+1")
          : (GLOBAL_COUNTRIES_DATA[selectedCurrentCountryDropdown]?.dialCode ??
            trainee.phone_country_code ??
            "+91");

      const { error } = await supabase
        .from("trainees")
        .update({
          reg_number: trainee.reg_number || "NA",
          application_number: trainee.application_number || "NA",
          program_branch: trainee.program_branch || "NA",
          school_name: trainee.school_name || "NA",
          dob: trainee.dob || "NA",
          gender: trainee.gender || "Female",
          blood_group: trainee.blood_group || "NA",
          native_language: trainee.native_language || "NA",
          native_state: trainee.native_state || "NA",
          nationality: trainee.nationality || "NA",
          nri_country: citizenshipType === "NRI" ? finalNriCountry : "NA",
          has_disability: trainee.has_disability,
          aadhar_number: trainee.aadhar_number || "NA",
          phone_country_code: activeCallingCode,
          phone_number: trainee.phone_number || "NA",
          current_country: finalCurrentCountry,
          current_address_line1: trainee.current_address_line1 || "NA",
          current_address_line2: trainee.current_address_line2 || "NA",
          current_city: trainee.current_city || "NA",
          current_state: finalCurrentState,
          current_pincode: trainee.current_pincode || "NA",
          perm_country: finalPermCountry,
          perm_address_line1: trainee.perm_address_line1 || "NA",
          perm_address_line2: trainee.perm_address_line2 || "NA",
          perm_city: trainee.perm_city || "NA",
          perm_state: finalPermState,
          perm_pincode: trainee.perm_pincode || "NA",
          edu_10th_school: trainee.edu_10th_school || "NA",
          edu_10th_board: trainee.edu_10th_board || "NA",
          edu_10th_percentage: trainee.edu_10th_percentage || "NA",
          edu_10th_year: trainee.edu_10th_year || "NA",
          edu_12th_school: trainee.edu_12th_school || "NA",
          edu_12th_board: trainee.edu_12th_board || "NA",
          edu_12th_percentage: trainee.edu_12th_percentage || "NA",
          edu_12th_year: trainee.edu_12th_year || "NA",
          applied_degree: trainee.applied_degree || "NA",
          father_name: trainee.father_name || "NA",
          father_country: finalFatherCountry,
          father_phone_code:
            trainee.father_phone_code ||
            (GLOBAL_COUNTRIES_DATA[selectedFatherCountryDropdown]?.dialCode ??
              "+91"),
          father_qualification: trainee.father_qualification || "NA",
          father_occupation: trainee.father_occupation || "NA",
          father_organization: trainee.father_organization || "NA",
          father_mobile: trainee.father_mobile || "NA",
          father_email: trainee.father_email || "NA",
          annual_income: trainee.annual_income || "NA",
          is_hosteller: trainee.is_hosteller,
          hostel_block: trainee.hostel_block || "NA",
          hostel_room_no: trainee.hostel_room_no || "NA",
          hostel_bed_type: trainee.hostel_bed_type || "NA",
          hostel_mess: trainee.hostel_mess || "NA",
          photo_url: trainee.photo_url || "NA",
        })
        .eq("id", traineeId);

      if (error) throw error;
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
    if (!file || !trainee) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${traineeId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("trainee-vault")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("trainee-vault")
        .getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      await supabase
        .from("trainees")
        .update({ photo_url: publicUrl })
        .eq("id", traineeId);
      setTrainee({ ...trainee, photo_url: publicUrl });
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
      let finalDocType = docCategory as string;
      if (docCategory === "govt_id") {
        finalDocType =
          citizenshipType === "INDIAN" ? selectedGovtIdType : "nri_certificate";
      }

      const cleanFileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `${traineeId}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("trainee-vault")
        .upload(filePath, selectedFile);
      if (uploadError) throw uploadError;

      await supabase.from("trainee_documents").insert([
        {
          trainee_id: traineeId,
          document_type: finalDocType,
          file_name: selectedFile.name,
          file_path: filePath,
        },
      ]);

      const { data: updatedDocs } = await supabase
        .from("trainee_documents")
        .select("*")
        .eq("trainee_id", traineeId)
        .order("created_at", { ascending: false });

      setDocuments((updatedDocs as unknown as TraineeDocument[]) || []);
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage
      .from("trainee-vault")
      .download(filePath);
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
    await supabase.from("trainee_documents").delete().eq("id", id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading || !trainee) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const proctor = trainee.trainers;

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

  const has10thCert = documents.some((d) => d.document_type === "cert_10th");
  const has12thCert = documents.some((d) => d.document_type === "cert_12th");
  const hasDisabilityDoc = documents.some(
    (d) => d.document_type === "disability_cert",
  );

  const currentStatesList = GLOBAL_COUNTRIES_DATA[
    selectedCurrentCountryDropdown
  ]?.states || ["Other"];
  const permStatesList = GLOBAL_COUNTRIES_DATA[selectedPermCountryDropdown]
    ?.states || ["Other"];

  const dynamicCallingCode =
    citizenshipType === "NRI"
      ? (GLOBAL_COUNTRIES_DATA[selectedNriCountryDropdown]?.dialCode ??
        trainee.phone_country_code ??
        "+1")
      : (GLOBAL_COUNTRIES_DATA[selectedCurrentCountryDropdown]?.dialCode ??
        trainee.phone_country_code ??
        "+91");

  // Calendar Helpers for August 2026
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const currentYear = currentCalendarDate.getFullYear();
  const currentMonth = currentCalendarDate.getMonth();
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const holidays: Record<string, string> = {
    "2026-08-15": "Independence Day",
    "2026-08-28": "Raksha Bandhan / Institutional Holiday",
  };

  const attendanceLog: Record<
    number,
    "Present" | "Absent" | "Late" | "Holiday" | "Weekend"
  > = {
    1: "Weekend",
    2: "Weekend",
    3: "Present",
    4: "Present",
    5: "Present",
    6: "Present",
    7: "Present",
    8: "Weekend",
    9: "Weekend",
    10: "Present",
    11: "Present",
    12: "Late",
    13: "Present",
    14: "Present",
    15: "Holiday",
    16: "Weekend",
    17: "Present",
    18: "Present",
    19: "Absent",
    20: "Present",
    21: "Present",
    22: "Weekend",
    23: "Weekend",
    24: "Present",
    25: "Present",
    26: "Present",
    27: "Present",
    28: "Holiday",
    29: "Weekend",
    30: "Weekend",
    31: "Present",
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/trainees"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/70 border border-white text-xs font-bold text-slate-700 hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>

        {activeTab === "profile" && (
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Updated
                Successfully
              </span>
            )}

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Update Details</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !!phoneError}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
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
        )}
      </div>

      {/* Header Profile Identity Glass Card */}
      <div className="p-6 rounded-3xl bg-white/80 border border-white/90 shadow-xl shadow-blue-500/5 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center group relative">
            <div className="w-28 h-32 rounded-2xl bg-gradient-to-b from-blue-100 to-indigo-200 border-2 border-blue-400/40 flex items-center justify-center shadow-inner overflow-hidden relative">
              {trainee.photo_url && trainee.photo_url !== "NA" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainee.photo_url}
                  alt="Candidate Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-blue-700/60" />
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
              {trainee.profiles?.full_name || "NA"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 flex-1 text-xs w-full">
            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                REGISTER NUMBER:{" "}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={trainee.reg_number ?? "NA"}
                  onChange={(e) =>
                    handleFieldChange("reg_number", e.target.value)
                  }
                  className="font-bold text-slate-800 bg-white/70 border border-slate-300 px-2 py-0.5 rounded ml-1"
                />
              ) : (
                <span className="font-bold text-slate-800">
                  {trainee.reg_number || "NA"}
                </span>
              )}
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                PORTAL EMAIL:{" "}
              </span>
              <span className="font-bold text-slate-800">
                {trainee.profiles?.email || "NA"}
              </span>
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                PROGRAM & BRANCH:{" "}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={trainee.program_branch ?? "NA"}
                  onChange={(e) =>
                    handleFieldChange("program_branch", e.target.value)
                  }
                  className="font-bold text-slate-800 bg-white/70 border border-slate-300 px-2 py-0.5 rounded ml-1 w-2/3"
                />
              ) : (
                <span className="font-bold text-slate-800">
                  {trainee.program_branch || "NA"}
                </span>
              )}
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                SCHOOL NAME:{" "}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={trainee.school_name ?? "NA"}
                  onChange={(e) =>
                    handleFieldChange("school_name", e.target.value)
                  }
                  className="font-bold text-slate-800 bg-white/70 border border-slate-300 px-2 py-0.5 rounded ml-1 w-2/3"
                />
              ) : (
                <span className="font-bold text-slate-800">
                  {trainee.school_name || "NA"}
                </span>
              )}
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                ASSIGNED BATCH:{" "}
              </span>
              <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                {trainee.batches?.batch_name || "NA"}
              </span>
            </div>

            <div>
              <span className="font-bold text-rose-800 tracking-wide uppercase">
                STATUS:{" "}
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PORTAL SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Verification</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === "courses"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses & Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === "attendance"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Attendance Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === "events"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Events & Assessments</span>
        </button>

        <button
          onClick={() => setActiveTab("performance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === "performance"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Performance & Feedback</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE & DOCUMENT VAULT */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* PERSONAL INFORMATION */}
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
                    {isEditing ? (
                      <input
                        type="text"
                        value={trainee.application_number ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange(
                            "application_number",
                            e.target.value,
                          )
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.application_number || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      STUDENT NAME
                    </span>
                    <span className="font-semibold text-slate-800">
                      {trainee.profiles?.full_name || "NA"}
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
                          trainee.dob && trainee.dob !== "NA" ? trainee.dob : ""
                        }
                        onChange={(e) =>
                          handleFieldChange("dob", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2 cursor-pointer font-medium"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.dob && trainee.dob !== "NA"
                          ? new Date(trainee.dob).toLocaleDateString("en-GB", {
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
                        value={trainee.gender || "Female"}
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
                        {trainee.gender || "Female"}
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
                        value={trainee.native_language ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange("native_language", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.native_language || "NA"}
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
                        value={trainee.blood_group ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange("blood_group", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.blood_group || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      PERSON WITH DISABILITY (PwD)
                    </span>
                    {isEditing ? (
                      <select
                        value={trainee.has_disability ? "YES" : "NO"}
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
                        {trainee.has_disability
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
                          onChange={(e) =>
                            handleCitizenshipChange(
                              e.target.value as "INDIAN" | "NRI",
                            )
                          }
                          className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                        >
                          <option value="INDIAN">INDIAN</option>
                          <option value="NRI">NRI / OVERSEAS</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {citizenshipType === "NRI"
                            ? `NRI (${trainee.nri_country || "Overseas"})`
                            : "INDIAN"}
                        </span>
                      )}
                    </div>

                    {citizenshipType === "NRI" && isEditing && (
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-blue-900 uppercase text-[11px]">
                          NRI COUNTRY OF RESIDENCE
                        </span>
                        <div className="w-1/2 flex flex-col gap-1">
                          <select
                            value={selectedNriCountryDropdown}
                            onChange={(e) =>
                              handleNriCountryDropdownChange(e.target.value)
                            }
                            className="bg-white/90 border border-blue-300 px-2 py-1 rounded text-xs"
                          >
                            {Object.keys(GLOBAL_COUNTRIES_DATA).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          {selectedNriCountryDropdown === "Other" && (
                            <input
                              type="text"
                              placeholder="Type Country Name..."
                              value={customNriCountry}
                              onChange={(e) => {
                                setCustomNriCountry(e.target.value);
                                handleFieldChange(
                                  "nri_country",
                                  e.target.value,
                                );
                              }}
                              className="bg-white border border-blue-400 px-2 py-1 rounded text-xs"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4 md:col-span-2">
                    <span className="font-bold text-slate-700 uppercase">
                      MOBILE PHONE NUMBER
                    </span>
                    {isEditing ? (
                      <div className="flex flex-col w-1/2">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-xs font-bold text-blue-900">
                            {dynamicCallingCode}
                          </span>
                          <input
                            type="tel"
                            required
                            placeholder="Phone Number"
                            value={trainee.phone_number ?? ""}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className={`flex-1 bg-white/80 border px-2.5 py-1 rounded font-medium ${
                              phoneError
                                ? "border-rose-500 bg-rose-50"
                                : "border-slate-200"
                            }`}
                          />
                        </div>
                        {phoneError && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5">
                            {phoneError}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        {dynamicCallingCode} {trainee.phone_number || "NA"}
                      </span>
                    )}
                  </div>
                </div>

                {/* CURRENT RESIDENTIAL ADDRESS */}
                <div className="pt-4 space-y-3">
                  <div className="py-1 px-3 bg-blue-200/50 rounded font-bold text-blue-900 text-center tracking-wider uppercase">
                    CURRENT RESIDENTIAL ADDRESS
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Country
                        </label>
                        <select
                          value={selectedCurrentCountryDropdown}
                          onChange={(e) =>
                            handleCurrentCountryDropdownChange(e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                        >
                          {Object.keys(GLOBAL_COUNTRIES_DATA).map((c) => (
                            <option key={c} value={c}>
                              {c}{" "}
                              {c !== "Other"
                                ? `(${GLOBAL_COUNTRIES_DATA[c].dialCode})`
                                : ""}
                            </option>
                          ))}
                        </select>

                        {selectedCurrentCountryDropdown === "Other" && (
                          <input
                            type="text"
                            placeholder="Type Country Name..."
                            value={customCurrentCountry}
                            onChange={(e) => {
                              setCustomCurrentCountry(e.target.value);
                              handleFieldChange(
                                "current_country",
                                e.target.value,
                              );
                            }}
                            className="w-full mt-1.5 bg-white/90 border border-blue-300 p-1.5 rounded text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          State / Province
                        </label>
                        <select
                          value={selectedCurrentStateDropdown}
                          onChange={(e) => {
                            setSelectedCurrentStateDropdown(e.target.value);
                            if (e.target.value !== "Other") {
                              handleFieldChange(
                                "current_state",
                                e.target.value,
                              );
                            }
                          }}
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                        >
                          {currentStatesList.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        {selectedCurrentStateDropdown === "Other" && (
                          <input
                            type="text"
                            placeholder="Type State / Province Name..."
                            value={customCurrentState}
                            onChange={(e) => {
                              setCustomCurrentState(e.target.value);
                              handleFieldChange(
                                "current_state",
                                e.target.value,
                              );
                            }}
                            className="w-full mt-1.5 bg-white/90 border border-blue-300 p-1.5 rounded text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          City / Town
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Visakhapatnam"
                          value={trainee.current_city ?? ""}
                          onChange={(e) =>
                            handleFieldChange("current_city", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Address Line 1{" "}
                          <span className="text-rose-500">* (Mandatory)</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Door / Flat No., Street, Locality"
                          value={trainee.current_address_line1 ?? ""}
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
                          Address Line 2{" "}
                          <span className="text-slate-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Landmark, Area / Sector"
                          value={trainee.current_address_line2 ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "current_address_line2",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          PIN / Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 530001"
                          value={trainee.current_pincode ?? ""}
                          onChange={(e) =>
                            handleFieldChange("current_pincode", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/60 border border-slate-100 text-slate-800 space-y-1 text-xs">
                      <p>
                        <strong>Address Line 1:</strong>{" "}
                        {trainee.current_address_line1 || "NA"}
                      </p>
                      <p>
                        <strong>Address Line 2:</strong>{" "}
                        {trainee.current_address_line2 || "NA"}
                      </p>
                      <p>
                        <strong>City:</strong> {trainee.current_city || "NA"}{" "}
                        &nbsp;|&nbsp;
                        <strong>State:</strong> {trainee.current_state || "NA"}{" "}
                        &nbsp;|&nbsp;
                        <strong>Country:</strong>{" "}
                        {trainee.current_country || "India"}
                      </p>
                      <p>
                        <strong>PIN / Postal Code:</strong>{" "}
                        {trainee.current_pincode || "NA"}
                      </p>
                    </div>
                  )}
                </div>

                {/* PERMANENT RESIDENTIAL ADDRESS */}
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
                          onChange={(e) =>
                            handlePermCountryDropdownChange(e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                        >
                          {Object.keys(GLOBAL_COUNTRIES_DATA).map((c) => (
                            <option key={c} value={c}>
                              {c}{" "}
                              {c !== "Other"
                                ? `(${GLOBAL_COUNTRIES_DATA[c].dialCode})`
                                : ""}
                            </option>
                          ))}
                        </select>

                        {selectedPermCountryDropdown === "Other" && (
                          <input
                            type="text"
                            placeholder="Type Country Name..."
                            value={customPermCountry}
                            onChange={(e) => {
                              setCustomPermCountry(e.target.value);
                              handleFieldChange("perm_country", e.target.value);
                            }}
                            className="w-full mt-1.5 bg-white/90 border border-blue-300 p-1.5 rounded text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          State / Province
                        </label>
                        <select
                          value={selectedPermStateDropdown}
                          onChange={(e) => {
                            setSelectedPermStateDropdown(e.target.value);
                            if (e.target.value !== "Other") {
                              handleFieldChange("perm_state", e.target.value);
                            }
                          }}
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs font-semibold"
                        >
                          {permStatesList.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        {selectedPermStateDropdown === "Other" && (
                          <input
                            type="text"
                            placeholder="Type State / Province Name..."
                            value={customPermState}
                            onChange={(e) => {
                              setCustomPermState(e.target.value);
                              handleFieldChange("perm_state", e.target.value);
                            }}
                            className="w-full mt-1.5 bg-white/90 border border-blue-300 p-1.5 rounded text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          City / Town
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hyderabad"
                          value={trainee.perm_city ?? ""}
                          onChange={(e) =>
                            handleFieldChange("perm_city", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Address Line 1{" "}
                          <span className="text-rose-500">* (Mandatory)</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Door / Flat No., Street, Locality"
                          value={trainee.perm_address_line1 ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "perm_address_line1",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Address Line 2{" "}
                          <span className="text-slate-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Landmark, Area / Sector"
                          value={trainee.perm_address_line2 ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "perm_address_line2",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          PIN / Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 500081"
                          value={trainee.perm_pincode ?? ""}
                          onChange={(e) =>
                            handleFieldChange("perm_pincode", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/60 border border-slate-100 text-slate-800 space-y-1 text-xs">
                      <p>
                        <strong>Address Line 1:</strong>{" "}
                        {trainee.perm_address_line1 || "NA"}
                      </p>
                      <p>
                        <strong>Address Line 2:</strong>{" "}
                        {trainee.perm_address_line2 || "NA"}
                      </p>
                      <p>
                        <strong>City:</strong> {trainee.perm_city || "NA"}{" "}
                        &nbsp;|&nbsp;
                        <strong>State:</strong> {trainee.perm_state || "NA"}{" "}
                        &nbsp;|&nbsp;
                        <strong>Country:</strong>{" "}
                        {trainee.perm_country || "India"}
                      </p>
                      <p>
                        <strong>PIN / Postal Code:</strong>{" "}
                        {trainee.perm_pincode || "NA"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACADEMIC RECORD */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("educational")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>10TH & 12TH ACADEMIC RECORD</span>
              </div>
              {openSections.educational ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.educational && (
              <div className="p-5 text-xs bg-amber-50/25 space-y-6">
                <div className="space-y-3">
                  <div className="py-1 px-3 bg-indigo-200/50 rounded font-bold text-indigo-950 tracking-wider uppercase">
                    10TH STANDARD (SECONDARY EDUCATION)
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          10th School Name{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. St. Xavier High School"
                          value={trainee.edu_10th_school ?? ""}
                          onChange={(e) =>
                            handleFieldChange("edu_10th_school", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          10th Board / Authority{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. CBSE / ICSE / State Board"
                          value={trainee.edu_10th_board ?? ""}
                          onChange={(e) =>
                            handleFieldChange("edu_10th_board", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          10th Percentage / CGPA{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 94.5% or 9.6 CGPA"
                          value={trainee.edu_10th_percentage ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "edu_10th_percentage",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          10th Year of Passing{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2022"
                          value={trainee.edu_10th_year ?? ""}
                          onChange={(e) =>
                            handleFieldChange("edu_10th_year", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/60 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          10TH SCHOOL:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {trainee.edu_10th_school || "NA"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          10TH BOARD:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {trainee.edu_10th_board || "NA"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          10TH SCORE (% / CGPA):
                        </span>
                        <span className="font-bold text-blue-700">
                          {trainee.edu_10th_percentage || "NA"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          10TH YEAR OF PASSING:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {trainee.edu_10th_year || "NA"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="py-1 px-3 bg-indigo-200/50 rounded font-bold text-indigo-950 tracking-wider uppercase">
                    12TH STANDARD / DIPLOMA (HIGHER SECONDARY)
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          12th School / Junior College{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sri Chaitanya / DPS Junior College"
                          value={trainee.edu_12th_school ?? ""}
                          onChange={(e) =>
                            handleFieldChange("edu_12th_school", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          12th Board / Council{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. CBSE / State Board / HSC"
                          value={trainee.edu_12th_board ?? ""}
                          onChange={(e) =>
                            handleFieldChange("edu_12th_board", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          12th Percentage / Cutoff{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 96.2%"
                          value={trainee.edu_12th_percentage ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "edu_12th_percentage",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          12th Year of Passing{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2024"
                          value={trainee.edu_12th_year ?? ""}
                          onChange={(e) =>
                            handleFieldChange("edu_12th_year", e.target.value)
                          }
                          className="w-full bg-white/80 border border-slate-200 p-2 rounded text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/60 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          12TH SCHOOL / COLLEGE:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {trainee.edu_12th_school || "NA"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          12TH BOARD:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {trainee.edu_12th_board || "NA"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          12TH SCORE (%):
                        </span>
                        <span className="font-bold text-blue-700">
                          {trainee.edu_12th_percentage || "NA"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">
                          12TH YEAR OF PASSING:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {trainee.edu_12th_year || "NA"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FAMILY DETAILS */}
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
                <div className="py-1 px-3 bg-blue-200/50 rounded font-bold text-blue-900 text-center tracking-wider uppercase">
                  FATHER / PRIMARY GUARDIAN DETAILS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      FATHER / GUARDIAN NAME
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={trainee.father_name ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange("father_name", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.father_name || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      COUNTRY OF RESIDENCE
                    </span>
                    {isEditing ? (
                      <div className="w-1/2 flex flex-col gap-1">
                        <select
                          value={selectedFatherCountryDropdown}
                          onChange={(e) =>
                            handleFatherCountryDropdownChange(e.target.value)
                          }
                          className="bg-white/80 border border-slate-200 px-2 py-1 rounded text-xs font-semibold"
                        >
                          {Object.keys(GLOBAL_COUNTRIES_DATA).map((c) => (
                            <option key={c} value={c}>
                              {c}{" "}
                              {c !== "Other"
                                ? `(${GLOBAL_COUNTRIES_DATA[c].dialCode})`
                                : ""}
                            </option>
                          ))}
                        </select>
                        {selectedFatherCountryDropdown === "Other" && (
                          <input
                            type="text"
                            placeholder="Type Country Name..."
                            value={customFatherCountry}
                            onChange={(e) => {
                              setCustomFatherCountry(e.target.value);
                              handleFieldChange(
                                "father_country",
                                e.target.value,
                              );
                            }}
                            className="bg-white border border-blue-300 px-2 py-1 rounded text-xs"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        {trainee.father_country || "India"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      QUALIFICATION
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={trainee.father_qualification ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange(
                            "father_qualification",
                            e.target.value,
                          )
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.father_qualification || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      OCCUPATION
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={trainee.father_occupation ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange("father_occupation", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.father_occupation || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      ORGANIZATION
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={trainee.father_organization ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange(
                            "father_organization",
                            e.target.value,
                          )
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.father_organization || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      MOBILE NUMBER
                    </span>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-1/2">
                        <span className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-xs font-bold text-blue-900">
                          {trainee.father_phone_code ||
                            (GLOBAL_COUNTRIES_DATA[
                              selectedFatherCountryDropdown
                            ]?.dialCode ??
                              "+91")}
                        </span>
                        <input
                          type="text"
                          placeholder="Phone number"
                          value={trainee.father_mobile ?? ""}
                          onChange={(e) =>
                            handleFieldChange("father_mobile", e.target.value)
                          }
                          className="flex-1 bg-white/80 border border-slate-200 px-2.5 py-1 rounded text-xs font-medium"
                        />
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        {trainee.father_phone_code || "+91"}{" "}
                        {trainee.father_mobile || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      EMAIL ADDRESS
                    </span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={trainee.father_email ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange("father_email", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.father_email || "NA"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pr-4">
                    <span className="font-bold text-slate-700 uppercase">
                      ANNUAL INCOME
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={trainee.annual_income ?? "NA"}
                        onChange={(e) =>
                          handleFieldChange("annual_income", e.target.value)
                        }
                        className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {trainee.annual_income || "NA"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PROCTOR DETAILS */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("proctor")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>PROCTOR & BATCH INFORMATION</span>
              </div>
              {openSections.proctor ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.proctor && (
              <div className="p-5 text-xs bg-amber-50/25">
                {proctor ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        FACULTY ID
                      </span>
                      <span className="font-semibold text-slate-800">
                        {proctor.employee_id || "NA"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        FACULTY NAME
                      </span>
                      <span className="font-bold text-blue-900">
                        {proctor.profiles?.full_name || "NA"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        FACULTY DESIGNATION
                      </span>
                      <span className="font-semibold text-slate-800">
                        {proctor.designation || "NA"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        DEPARTMENT
                      </span>
                      <span className="font-semibold text-slate-800">
                        {proctor.department || "NA"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        CABIN
                      </span>
                      <span className="font-semibold text-slate-800">
                        {proctor.cabin_number || "NA"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        FACULTY EMAIL
                      </span>
                      <span className="font-semibold text-slate-800">
                        {proctor.profiles?.email || "NA"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        FACULTY MOBILE
                      </span>
                      <span className="font-semibold text-slate-800">
                        {proctor.mobile_number || "NA"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-4">
                      <span className="font-bold text-slate-700 uppercase">
                        ENROLLED BATCH
                      </span>
                      <span className="font-bold text-emerald-800">
                        {trainee.batches?.batch_name || "NA"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 font-semibold">
                    No proctor / faculty assigned to this candidate yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* HOSTEL DETAILS */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/30 bg-white/70 backdrop-blur-xl">
            <button
              onClick={() => toggleSection("hostel")}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-amber-400 text-slate-900 shadow">
                  <Home className="w-4 h-4" />
                </div>
                <span>HOSTEL / ACCOMMODATION INFORMATION</span>
              </div>
              {openSections.hostel ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {openSections.hostel && (
              <div className="p-5 text-xs bg-amber-50/25 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center pr-4">
                  <span className="font-bold text-slate-700 uppercase">
                    APPLICATION NUMBER
                  </span>
                  <span className="font-semibold text-slate-800">
                    {trainee.application_number || "NA"}
                  </span>
                </div>

                <div className="flex justify-between items-center pr-4">
                  <span className="font-bold text-slate-700 uppercase">
                    REGISTER NUMBER
                  </span>
                  <span className="font-semibold text-slate-800">
                    {trainee.reg_number || "NA"}
                  </span>
                </div>

                <div className="flex justify-between items-center pr-4">
                  <span className="font-bold text-slate-700 uppercase">
                    BLOCK NAME
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={trainee.hostel_block ?? "NA"}
                      onChange={(e) =>
                        handleFieldChange("hostel_block", e.target.value)
                      }
                      className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">
                      {trainee.hostel_block || "NA"}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pr-4">
                  <span className="font-bold text-slate-700 uppercase">
                    ROOM NO.
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={trainee.hostel_room_no ?? "NA"}
                      onChange={(e) =>
                        handleFieldChange("hostel_room_no", e.target.value)
                      }
                      className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">
                      {trainee.hostel_room_no || "NA"}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pr-4">
                  <span className="font-bold text-slate-700 uppercase">
                    BED TYPE
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={trainee.hostel_bed_type ?? "NA"}
                      onChange={(e) =>
                        handleFieldChange("hostel_bed_type", e.target.value)
                      }
                      className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">
                      {trainee.hostel_bed_type || "NA"}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pr-4">
                  <span className="font-bold text-slate-700 uppercase">
                    MESS INFORMATION
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={trainee.hostel_mess ?? "NA"}
                      onChange={(e) =>
                        handleFieldChange("hostel_mess", e.target.value)
                      }
                      className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded w-1/2"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">
                      {trainee.hostel_mess || "NA"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DOCUMENT VAULT */}
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
                  DOCUMENT VERIFICATION & VAULT ({documents.length} Uploaded)
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
                <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Verification Status:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        hasGovtId
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                          : "bg-rose-50/80 border-rose-300 text-rose-900"
                      }`}
                    >
                      {hasGovtId ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold leading-tight">
                          {citizenshipType === "INDIAN"
                            ? "Indian Govt ID"
                            : "NRI Certificate"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {hasGovtId ? "Uploaded" : "Mandatory"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        has10thCert
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                          : "bg-rose-50/80 border-rose-300 text-rose-900"
                      }`}
                    >
                      {has10thCert ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold leading-tight">
                          10th Certificate
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {has10thCert ? "Uploaded" : "Mandatory"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        has12thCert
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                          : "bg-rose-50/80 border-rose-300 text-rose-900"
                      }`}
                    >
                      {has12thCert ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold leading-tight">
                          12th Certificate
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {has12thCert ? "Uploaded" : "Mandatory"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        hasDisabilityDoc
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                          : "bg-slate-50/80 border-slate-200 text-slate-700"
                      }`}
                    >
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${hasDisabilityDoc ? "text-emerald-600" : "text-slate-400"}`}
                      />
                      <div>
                        <p className="font-bold leading-tight">
                          PwD Certificate
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {hasDisabilityDoc ? "Uploaded" : "Optional / NA"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <form
                    onSubmit={handleFileUpload}
                    className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-3"
                  >
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                      Upload New Document Slot
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Select Document Category
                        </label>
                        <select
                          value={docCategory}
                          onChange={(e) =>
                            setDocCategory(
                              e.target.value as
                                | "govt_id"
                                | "cert_10th"
                                | "cert_12th"
                                | "disability_cert"
                                | "other",
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        >
                          <option value="govt_id">
                            {citizenshipType === "INDIAN"
                              ? "Indian Govt ID (Any 1)"
                              : "NRI Certificate"}
                          </option>
                          <option value="cert_10th">
                            10th Standard Certificate
                          </option>
                          <option value="cert_12th">
                            12th Standard Certificate
                          </option>
                          <option value="disability_cert">
                            Person with Disability (PwD) Certificate (Optional)
                          </option>
                          <option value="other">
                            Other Supporting Document
                          </option>
                        </select>
                      </div>

                      {docCategory === "govt_id" &&
                        citizenshipType === "INDIAN" && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Government ID Type
                            </label>
                            <select
                              value={selectedGovtIdType}
                              onChange={(e) =>
                                setSelectedGovtIdType(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                            >
                              <option value="aadhaar_card">Aadhaar Card</option>
                              <option value="pan_card">PAN Card</option>
                              <option value="voter_id">Voter ID</option>
                              <option value="driving_license">
                                Driving License
                              </option>
                              <option value="passport">Passport</option>
                            </select>
                          </div>
                        )}

                      <div className="flex flex-col justify-end">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Select PDF or Image
                        </label>
                        <input
                          type="file"
                          required
                          onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                          className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={uploadingDoc || !selectedFile}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {uploadingDoc ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>Upload & Verify Slot</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                    Attached Files in Vault
                  </span>

                  {documents.length === 0 ? (
                    <div className="text-center py-5 text-slate-400 font-medium">
                      No documents uploaded to this trainee vault yet.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-white/90 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {doc.file_name}
                          </p>
                          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                            {doc.document_type.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleDownload(doc.file_path, doc.file_name)
                            }
                            className="p-1.5 rounded-lg bg-slate-50 text-blue-600 hover:bg-blue-100 transition"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {isEditing && (
                            <button
                              onClick={() =>
                                handleDeleteDoc(doc.id, doc.file_path)
                              }
                              className="p-1.5 rounded-lg bg-slate-50 text-rose-600 hover:bg-rose-100 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COURSES & TIMETABLE */}
      {/* ========================================================================= */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Enrolled Training Modules
                </h3>
                <p className="text-xs text-slate-500">
                  Active subjects under assigned domain trainers
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-xl">
                4 Active Courses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  code: "CS601",
                  title: "Advanced Soft Computing & Hybrid AI",
                  trainer: "Dr. Ramesh Sundaram",
                  credits: 4,
                  files: 5,
                },
                {
                  code: "CS602",
                  title: "Cloud-Native Distributed Systems",
                  trainer: "Prof. Ananya Roy",
                  credits: 3,
                  files: 8,
                },
                {
                  code: "CS603",
                  title: "Full-Stack Next.js Architecture",
                  trainer: "Er. Rajesh Kumar",
                  credits: 4,
                  files: 12,
                },
                {
                  code: "CS604",
                  title: "Database Optimization & Supabase RLS",
                  trainer: "Dr. Ramesh Sundaram",
                  credits: 3,
                  files: 4,
                },
              ].map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                        {c.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Instructor: {c.trainer}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {c.credits} Credits
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {c.files} Materials Available
                    </span>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> View Materials
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              Weekly Schedule & Lecture Timetable
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-50/70 border-b border-blue-100 text-blue-900 font-bold">
                    <th className="p-3">Day</th>
                    <th className="p-3">09:00 - 10:30 AM</th>
                    <th className="p-3">11:00 - 12:30 PM</th>
                    <th className="p-3">02:00 - 03:30 PM</th>
                    <th className="p-3">04:00 - 05:30 PM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">
                      Monday
                    </td>
                    <td className="p-3 bg-blue-50/40 font-semibold text-blue-900">
                      CS601 (Hall A)
                    </td>
                    <td className="p-3">CS602 (Lab 2)</td>
                    <td className="p-3 bg-indigo-50/40 font-semibold text-indigo-900">
                      CS603 (Room 304)
                    </td>
                    <td className="p-3 text-slate-400">Library / Self-Study</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">
                      Tuesday
                    </td>
                    <td className="p-3">CS603 (Room 304)</td>
                    <td className="p-3 bg-blue-50/40 font-semibold text-blue-900">
                      CS601 (Hall A)
                    </td>
                    <td className="p-3">CS604 (Lab 5)</td>
                    <td className="p-3">Mentorship Session</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">
                      Wednesday
                    </td>
                    <td className="p-3">CS602 (Lab 2)</td>
                    <td className="p-3">CS604 (Lab 5)</td>
                    <td className="p-3 bg-blue-50/40 font-semibold text-blue-900">
                      CS601 (Hall A)
                    </td>
                    <td className="p-3 text-slate-400">
                      Sports / Club Activity
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">
                      Thursday
                    </td>
                    <td className="p-3 bg-indigo-50/40 font-semibold text-indigo-900">
                      CS603 (Room 304)
                    </td>
                    <td className="p-3">CS602 (Lab 2)</td>
                    <td className="p-3">CS604 (Lab 5)</td>
                    <td className="p-3">Project Lab</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">
                      Friday
                    </td>
                    <td className="p-3 bg-blue-50/40 font-semibold text-blue-900">
                      CS601 (Hall A)
                    </td>
                    <td className="p-3 bg-indigo-50/40 font-semibold text-indigo-900">
                      CS603 (Room 304)
                    </td>
                    <td className="p-3 text-slate-400">Trainer Evaluation</td>
                    <td className="p-3 text-slate-400">Weekly Review</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DYNAMIC ATTENDANCE CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === "attendance" &&
        (() => {
          const workingDays = Object.entries(attendanceLog).filter(
            ([, status]) => status !== "Weekend" && status !== "Holiday",
          );
          const presentDays = workingDays.filter(
            ([, status]) => status === "Present",
          ).length;
          const lateDays = workingDays.filter(
            ([, status]) => status === "Late",
          ).length;
          const absentDays = workingDays.filter(
            ([, status]) => status === "Absent",
          ).length;
          const totalWorkingDays = workingDays.length;

          const dynamicRate =
            totalWorkingDays > 0
              ? (((presentDays + lateDays) / totalWorkingDays) * 100).toFixed(1)
              : "100.0";

          return (
            <div className="space-y-6">
              <div className="rounded-3xl p-6 bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Academic Attendance Log
                    </h3>
                    <p className="text-xs text-slate-500">
                      {presentDays} Present &bull; {lateDays} Late &bull;{" "}
                      {absentDays} Absent out of {totalWorkingDays} Working Days
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Attendance Rate
                      </span>
                      <span
                        className={`text-xl font-extrabold ${Number(dynamicRate) >= 85 ? "text-emerald-600" : Number(dynamicRate) >= 75 ? "text-amber-600" : "text-rose-600"}`}
                      >
                        {dynamicRate}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                      <button
                        onClick={() =>
                          setCurrentCalendarDate(
                            new Date(currentYear, currentMonth - 1, 1),
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 px-2">
                        {currentCalendarDate.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentCalendarDate(
                            new Date(currentYear, currentMonth + 1, 1),
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visual Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div
                        key={d}
                        className="p-2 font-bold text-slate-500 uppercase tracking-wider text-[11px]"
                      >
                        {d}
                      </div>
                    ),
                  )}

                  {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div
                      key={`offset-${i}`}
                      className="p-3 bg-slate-50/40 rounded-xl border border-transparent"
                    />
                  ))}

                  {Array.from({ length: totalDays }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateKey = `2026-08-${String(dayNum).padStart(2, "0")}`;
                    const status = attendanceLog[dayNum] || "Present";
                    const holidayName = holidays[dateKey];

                    let bgClass =
                      "bg-emerald-50 border-emerald-200 text-emerald-900";
                    if (status === "Absent")
                      bgClass = "bg-rose-50 border-rose-200 text-rose-900";
                    if (status === "Late")
                      bgClass = "bg-amber-50 border-amber-200 text-amber-900";
                    if (status === "Holiday")
                      bgClass =
                        "bg-purple-50 border-purple-200 text-purple-900";
                    if (status === "Weekend")
                      bgClass = "bg-slate-100 border-slate-200 text-slate-400";

                    return (
                      <div
                        key={dayNum}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-between min-h-[70px] shadow-sm transition-all hover:scale-105 ${bgClass}`}
                      >
                        <span className="font-bold text-xs">{dayNum}</span>
                        <span className="text-[10px] font-semibold tracking-tight uppercase">
                          {holidayName ? holidayName : status}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />{" "}
                    Present ({presentDays})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500" /> Absent
                    ({absentDays})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" /> Late
                    ({lateDays})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />{" "}
                    Holidays ({Object.keys(holidays).length})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />{" "}
                    Weekends (9)
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ========================================================================= */}
      {/* TAB 4: UPCOMING EVENTS & ASSESSMENTS */}
      {/* ========================================================================= */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Deadlines, Quizzes & Examinations
              </h3>
              <p className="text-xs text-slate-500">
                Upcoming deliverables and scheduled performance evaluations
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Continuous Assessment Test 1 (CAT-1)",
                  type: "Exam",
                  course: "CS601 - Hybrid AI",
                  date: "Aug 24, 2026",
                  time: "10:00 AM",
                },
                {
                  title: "Next.js 16 SSR & Server Actions Assignment",
                  type: "Assignment",
                  course: "CS603 - Next.js Arch",
                  date: "Aug 26, 2026",
                  time: "11:59 PM",
                },
                {
                  title: "Internal Hackathon Sprint - Round 1",
                  type: "Hackathon",
                  course: "General Academic",
                  date: "Sep 02, 2026",
                  time: "09:00 AM",
                },
                {
                  title: "Distributed Systems Microservices Lab Assessment",
                  type: "Quiz",
                  course: "CS602 - Cloud Native",
                  date: "Sep 05, 2026",
                  time: "02:00 PM",
                },
              ].map((ev, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-xl text-white font-bold text-xs ${
                        ev.type === "Exam"
                          ? "bg-rose-500"
                          : ev.type === "Assignment"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }`}
                    >
                      {ev.type}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{ev.course}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      {ev.date}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {ev.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PERFORMANCE & FEEDBACK */}
      {/* ========================================================================= */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Cumulative Score
              </span>
              <h3 className="text-2xl font-extrabold text-blue-700 mt-1">
                {trainee.overall_score || 88.5}%
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Top 5% in Assigned Batch
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Current CGPA / GPA
              </span>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                9.2 / 10.0
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Grade A+ Standing
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Faculty Reviews
              </span>
              <h3 className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center gap-1">
                4.8 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Consistent positive feedback
              </p>
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              Subject-Wise Performance Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              {[
                {
                  subject: "Advanced Soft Computing & Hybrid AI",
                  code: "CS601",
                  internal: "48/50",
                  cat: "45/50",
                  total: "93%",
                },
                {
                  subject: "Cloud-Native Distributed Systems",
                  code: "CS602",
                  internal: "44/50",
                  cat: "42/50",
                  total: "86%",
                },
                {
                  subject: "Full-Stack Next.js Architecture",
                  code: "CS603",
                  internal: "50/50",
                  cat: "47/50",
                  total: "97%",
                },
                {
                  subject: "Database Optimization & Supabase RLS",
                  code: "CS604",
                  internal: "42/50",
                  cat: "44/50",
                  total: "86%",
                },
              ].map((m) => (
                <div
                  key={m.code}
                  className="p-3.5 bg-white/90 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900">
                      {m.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      ({m.code})
                    </span>
                  </div>
                  <div className="flex items-center gap-6 font-semibold text-slate-700">
                    <span>
                      Internal: <strong>{m.internal}</strong>
                    </span>
                    <span>
                      Assessments: <strong>{m.cat}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {m.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-white/80 border border-white/90 shadow-xl backdrop-blur-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              Faculty & Proctor Qualitative Feedback
            </h3>

            <div className="space-y-3">
              {[
                {
                  author: "Dr. Ramesh Sundaram",
                  role: "Chief Proctor & Soft Computing Trainer",
                  date: "Aug 10, 2026",
                  comment:
                    "Demonstrates exceptional problem-solving in neuro-fuzzy algorithms and data structures. Highly proactive during practical sessions.",
                },
                {
                  author: "Er. Rajesh Kumar",
                  role: "Next.js & Frontend Architect",
                  date: "Aug 04, 2026",
                  comment:
                    "Outstanding project execution in the Next.js and Supabase storage workflows. Code scaffolding is clean, performant, and well-typed.",
                },
              ].map((fb, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/30 border border-amber-200/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {fb.author} ({fb.role})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {fb.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                    "{fb.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
