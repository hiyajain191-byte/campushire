"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";

type Job = {
  _id: string;
  externalJobId?: number;

  title: string;
  company?: string;

  location?: string;
  city?: string;

  roleCategory?: string;

  experience?: string;

  salary?:
    | string
    | number
    | {
        minLpa?: number;
        maxLpa?: number;
      };

  skills?: string[];

  description?: string;

  postedDate?: string;
  createdAt?: string;

  workMode?: string;

  jobUrl?: string;

  isFresherFriendly?: boolean;

  jobType?: string;
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     DARK MODE
  ========================= */

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("campushire_theme");

    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldUseDark = savedTheme
      ? savedTheme === "dark"
      : prefersDark;

    setDarkMode(shouldUseDark);

    document.documentElement.classList.toggle(
      "dark",
      shouldUseDark
    );
  }, []);

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;

      document.documentElement.classList.toggle(
        "dark",
        next
      );

      localStorage.setItem(
        "campushire_theme",
        next ? "dark" : "light"
      );

      return next;
    });
  }

  /* =========================
     FETCH JOB
  ========================= */

  useEffect(() => {
    if (!jobId) return;

    fetchJob();
  }, [jobId]);

  async function fetchJob() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:3000/jobs/${jobId}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Job not found");
      }

      const data = await response.json();

      console.log("JOB DETAILS:", data);
      console.log("EXPERIENCE:", data?.experience);

      setJob(data);
    } catch (error) {
      console.error(
        "Failed to fetch job:",
        error
      );

      setError(
        "Unable to load this job. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     SALARY
  ========================= */

  function formatSalary() {
    if (!job?.salary) {
      return "Salary not specified";
    }

    const salary = job.salary;

    // STRING SALARY
    if (typeof salary === "string") {
      const value = salary.trim();

      if (!value) {
        return "Salary not specified";
      }

      return value;
    }

    // NUMBER SALARY
    if (
      typeof salary === "number" &&
      Number.isFinite(salary) &&
      salary > 0
    ) {
      return `₹${salary}`;
    }

    // OBJECT SALARY
    if (
      typeof salary === "object" &&
      salary !== null
    ) {
      const min = salary.minLpa;
      const max = salary.maxLpa;

      // Both available
      if (
        typeof min === "number" &&
        typeof max === "number" &&
        min > 0 &&
        max > 0
      ) {
        return `₹${min}–${max} LPA`;
      }

      // Only minimum
      if (
        typeof min === "number" &&
        min > 0
      ) {
        return `From ₹${min} LPA`;
      }

      // Only maximum
      if (
        typeof max === "number" &&
        max > 0
      ) {
        return `Up to ₹${max} LPA`;
      }
    }

    return "Salary not specified";
  }

  /* =========================
     EXPERIENCE
  ========================= */

  function formatExperience() {
    const experience = job?.experience;

    if (
      typeof experience === "string" &&
      experience.trim()
    ) {
      return experience.trim();
    }

    return "Not specified";
  }

  /* =========================
     POSTED DATE
  ========================= */

  function formatPostedDate() {
    if (!job) {
      return "Recently";
    }

    // Existing dataset postedDate
    if (
      typeof job.postedDate === "string" &&
      job.postedDate.trim()
    ) {
      return job.postedDate.trim();
    }

    // createdAt fallback
    if (job.createdAt) {
      const parsedDate = new Date(
        job.createdAt
      );

      if (
        !Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return parsedDate.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        );
      }
    }

    return "Recently";
  }

  /* =========================
     DARK MODE TOGGLE (shared markup)
  ========================= */

  function DarkModeToggleButton() {
    return (
      <button
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
          darkMode
            ? "bg-purple-900"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full shadow transition-transform ${
            darkMode
              ? "translate-x-3.5 bg-purple-200"
              : "translate-x-0.5 bg-purple-900"
          }`}
        />
      </button>
    );
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">

        <div className="mx-auto max-w-5xl px-5 py-20 text-center">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-900 dark:text-purple-400" />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading job details...
          </p>

        </div>

      </main>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !job) {
    return (
      <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">

        <div className="mx-auto max-w-5xl px-5 py-20">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900 dark:bg-red-950">

            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Job not found
            </h1>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error ||
                "This job is no longer available."}
            </p>

            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-900 px-6 py-3 text-sm font-medium text-white hover:bg-purple-800"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to jobs
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* =========================
     MAIN
  ========================= */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex items-center gap-2"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-900">

              <Briefcase className="h-4 w-4 text-white" />

            </div>

            <span className="text-lg font-bold">
              CampusHire
            </span>

          </Link>

          <div className="flex items-center gap-4">

            <Link
              href="/jobs"
              className="text-sm text-slate-600 hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
            >
              Find Jobs
            </Link>

            {/* DARK MODE TOGGLE */}

            <DarkModeToggleButton />

          </div>

        </div>

      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <section className="mx-auto max-w-5xl px-5 py-10">

        {/* BACK */}

        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-purple-900 dark:text-slate-400 dark:hover:text-purple-300"
        >

          <ArrowLeft className="h-4 w-4" />

          Back to jobs

        </button>

        {/* =========================
            JOB HEADER
        ========================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-10 dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl dark:text-slate-100">
                {job.title}
              </h1>

              <p className="mt-2 text-lg font-semibold text-purple-900 dark:text-purple-300">
                {job.company ||
                  "Company not specified"}
              </p>

              {/* TAGS */}

              <div className="mt-5 flex flex-wrap gap-3">

                {job.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-sm text-purple-900 dark:bg-purple-950 dark:text-purple-300">

                    <MapPin className="h-4 w-4" />

                    {job.location}

                  </span>
                )}

                {job.workMode && (
                  <span className="rounded-full bg-rose-50 px-3 py-1.5 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {job.workMode}
                  </span>
                )}

                {job.jobType && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {job.jobType}
                  </span>
                )}

                {job.isFresherFriendly && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">

                    <CheckCircle2 className="h-4 w-4" />

                    Fresher Friendly

                  </span>
                )}

              </div>

            </div>

            {/* APPLY */}

            <Link
              href={`/apply/${job._id}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-purple-900 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-800"
            >

              Apply Now

              <ArrowRight className="h-4 w-4" />

            </Link>

          </div>

        </div>

        {/* =========================
            JOB INFO
        ========================= */}

        <div className="mt-6 grid gap-5 md:grid-cols-3">

          {/* EXPERIENCE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center gap-2 text-slate-400">

              <Briefcase className="h-4 w-4" />

              <span className="text-xs uppercase tracking-wide">
                Experience
              </span>

            </div>

            <p
              className={`mt-2 font-semibold ${
                formatExperience() ===
                "Not specified"
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {formatExperience()}
            </p>

          </div>

          {/* SALARY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center gap-2 text-slate-400">

              <IndianRupee className="h-4 w-4" />

              <span className="text-xs uppercase tracking-wide">
                Salary
              </span>

            </div>

            <p
              className={`mt-2 font-semibold ${
                formatSalary() ===
                "Salary not specified"
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {formatSalary()}
            </p>

          </div>

          {/* POSTED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center gap-2 text-slate-400">

              <Clock className="h-4 w-4" />

              <span className="text-xs uppercase tracking-wide">
                Posted
              </span>

            </div>

            <p className="mt-2 font-semibold dark:text-slate-100">
              {formatPostedDate()}
            </p>

          </div>

        </div>

        {/* =========================
            DESCRIPTION
        ========================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 md:p-8 dark:border-slate-800 dark:bg-slate-900">

          <h2 className="text-xl font-semibold dark:text-slate-100">
            Job Description
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
            {job.description ||
              "No detailed job description is available for this position."}
          </p>

        </div>

        {/* =========================
            SKILLS
        ========================= */}

        {job.skills &&
          job.skills.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 md:p-8 dark:border-slate-800 dark:bg-slate-900">

              <h2 className="text-xl font-semibold dark:text-slate-100">
                Required Skills
              </h2>

              <div className="mt-5 flex flex-wrap gap-2.5">

                {job.skills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>

            </div>
          )}

        {/* =========================
            APPLY CTA
        ========================= */}

        <div className="mt-6 flex flex-col gap-5 rounded-2xl bg-purple-900 p-7 md:flex-row md:items-center md:justify-between md:p-8">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Interested in this role?
            </h2>

            <p className="mt-1 text-sm text-purple-200">
              Submit your application directly
              through CampusHire.
            </p>

          </div>

          <Link
            href={`/apply/${job._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-900 transition-colors hover:bg-purple-50"
          >

            Apply Now

            <ArrowRight className="h-4 w-4" />

          </Link>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="mt-10 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">

        <div className="mx-auto max-w-6xl px-5 py-6">

          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2026 CampusHire
          </p>

        </div>

      </footer>

    </main>
  );
}