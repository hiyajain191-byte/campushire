"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowLeft,
  MapPin,
  Building2,
  Clock3,
  IndianRupee,
  FileText,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react";

const API_URL = "http://localhost:3000";

type RecruiterUser = {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  role?: string;
};

export default function PostJobPage() {
  const router = useRouter();

  // =====================================================
  // RECRUITER
  // =====================================================

  const [user, setUser] = useState<RecruiterUser | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  // =====================================================
  // FORM
  // =====================================================

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Internship");
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  // =====================================================
  // STATES
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // CHECK LOGGED-IN RECRUITER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("campushire_user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser: RecruiterUser = JSON.parse(storedUser);

      console.log("LOGGED IN RECRUITER:", parsedUser);

      if (parsedUser.role !== "recruiter") {
        router.push("/");
        return;
      }

      if (!parsedUser.name) {
        setError(
          "Recruiter name not found. Please login again."
        );
        setCheckingUser(false);
        return;
      }

      setUser(parsedUser);
      setCheckingUser(false);
    } catch (err) {
      console.error("Invalid stored user:", err);

      localStorage.removeItem("campushire_user");
      localStorage.removeItem("campushire_token");

      router.push("/login");
    }
  }, [router]);

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("campushire_user");
    localStorage.removeItem("campushire_token");

    router.push("/login");
  };

  // =====================================================
  // POST JOB
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    console.log("POST JOB CLICKED");

    setSuccess("");
    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (!company.trim()) {
      setError("Please enter the company name.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter the location.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter the job description.");
      return;
    }

    // ---------------------------------------------------
    // CHECK RECRUITER
    // ---------------------------------------------------

    if (!user) {
      setError(
        "Recruiter information not found. Please login again."
      );
      return;
    }

    const recruiterId = user.id || user._id;

    if (!recruiterId) {
      setError(
        "Recruiter ID is missing. Please login again."
      );
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // JOB DATA
      // -------------------------------------------------

      const jobData = {
        title: title.trim(),

        company: company.trim(),

        location: location.trim(),

        jobType: jobType,

        salary: salary.trim(),

        experience: experience.trim(),

        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),

        description: description.trim(),

        recruiterId: String(recruiterId),

        status: "Active",
      };

      console.log("SENDING JOB:", jobData);

      // -------------------------------------------------
      // TOKEN
      // -------------------------------------------------

      const token = localStorage.getItem("campushire_token");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // -------------------------------------------------
      // API
      // -------------------------------------------------

      const response = await fetch(
        `${API_URL}/recruiter-jobs`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(jobData),
        }
      );

      console.log(
        "RESPONSE STATUS:",
        response.status
      );

      const responseText = await response.text();

      console.log("RESPONSE:", responseText);

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {};
      }

      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to post job. Status: ${response.status}`
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      console.log(
        "JOB POSTED SUCCESSFULLY:",
        data
      );

      setSuccess("Job posted successfully!");

      // -------------------------------------------------
      // CLEAR FORM
      // -------------------------------------------------

      setTitle("");
      setCompany("");
      setLocation("");
      setJobType("Internship");
      setSalary("");
      setExperience("");
      setSkills("");
      setDescription("");

      // -------------------------------------------------
      // REDIRECT
      // -------------------------------------------------

      setTimeout(() => {
        router.push("/recruiter");
      }, 1000);
    } catch (error) {
      console.error("POST JOB ERROR:", error);

      if (error instanceof TypeError) {
        setError(
          "Unable to connect to backend. Make sure NestJS is running on port 3000."
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHECKING LOGIN
  // =====================================================

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9fc]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#5b21b6]" />
          Loading recruiter...
        </div>
      </main>
    );
  }

  // =====================================================
  // NO USER
  // =====================================================

  if (!user) {
    return null;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#faf9fc] text-[#24163a]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#32145f]">
              <Briefcase className="h-5 w-5 text-white" />
            </div>

            <span className="text-xl font-bold tracking-tight text-[#24163a]">
              Campus
              <span className="text-[#5b21b6]">
                Hire
              </span>
            </span>
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              href="/recruiter"
              className="text-sm font-medium text-gray-600 hover:text-[#4c1d95]"
            >
              Dashboard
            </Link>

            <Link
              href="/recruiter/jobs"
              className="text-sm font-medium text-gray-600 hover:text-[#4c1d95]"
            >
              My Jobs
            </Link>

            <Link
              href="/recruiter/applications"
              className="text-sm font-medium text-gray-600 hover:text-[#4c1d95]"
            >
              Applications
            </Link>

          </nav>

          {/* PROFILE */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold text-[#24163a]">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                Recruiter
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee7fa] text-sm font-bold text-[#4c1d95]">
              {getInitials(user.name)}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>

          </div>

        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* BACK */}

        <Link
          href="/recruiter"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#4c1d95]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* HEADER */}

        <div className="mb-8">

          <p className="mb-1 text-sm font-medium text-[#6d28d9]">
            RECRUITER
          </p>

          <h1 className="text-3xl font-bold text-[#24163a]">
            Post a New Job
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create a new opportunity and find the right candidate.
          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm sm:p-8">

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                {success}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <div className="mb-8">

              <div className="mb-5">

                <h2 className="text-lg font-semibold">
                  Basic Information
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Add the basic details about the job.
                </p>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* TITLE */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Job Title{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)
                      }
                      placeholder="e.g. Frontend Developer Intern"
                      className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />

                  </div>

                </div>

                {/* COMPANY */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Company Name{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={company}
                      onChange={(e) =>
                        setCompany(e.target.value)
                      }
                      placeholder="Company name"
                      className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />

                  </div>

                </div>

                {/* LOCATION */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Location{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={location}
                      onChange={(e) =>
                        setLocation(e.target.value)
                      }
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                JOB DETAILS
            ================================================= */}

            <div className="border-t border-gray-100 pt-8">

              <div className="mb-5">

                <h2 className="text-lg font-semibold">
                  Job Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Tell students more about this opportunity.
                </p>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* JOB TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Job Type
                  </label>

                  <div className="relative">

                    <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <select
                      value={jobType}
                      onChange={(e) =>
                        setJobType(e.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    >
                      <option>Internship</option>
                      <option>Full Time</option>
                      <option>Part Time</option>
                      <option>Contract</option>
                    </select>

                  </div>

                </div>

                {/* SALARY */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Salary / Stipend
                  </label>

                  <div className="relative">

                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={salary}
                      onChange={(e) =>
                        setSalary(e.target.value)
                      }
                      placeholder="e.g. ₹15,000 / month"
                      className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />

                  </div>

                </div>

                {/* EXPERIENCE */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Experience
                  </label>

                  <div className="relative">

                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={experience}
                      onChange={(e) =>
                        setExperience(e.target.value)
                      }
                      placeholder="e.g. 0-1 years"
                      className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />

                  </div>

                </div>

                {/* SKILLS */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Required Skills
                  </label>

                  <input
                    type="text"
                    value={skills}
                    onChange={(e) =>
                      setSkills(e.target.value)
                    }
                    placeholder="e.g. React, Next.js, JavaScript"
                    className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Separate multiple skills using commas.
                  </p>

                </div>

                {/* DESCRIPTION */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Job Description{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <FileText className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                    <textarea
                      rows={7}
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      placeholder="Describe the role, responsibilities and requirements..."
                      className="w-full resize-none rounded-lg border border-gray-200 pl-10 pr-4 pt-3 text-sm outline-none placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-purple-100"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <Link
                href="/recruiter"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 px-6 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#32145f] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#421b7a] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Post Job
                  </>
                )}

              </button>

            </div>

          </div>

        </form>

      </div>

    </main>
  );
}