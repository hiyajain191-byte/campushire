"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  MapPin,
  Clock3,
  IndianRupee,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:3000";

type RecruiterUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "recruiter";
};

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary?: string;
  skills: string[];
  description: string;
  recruiterId: string;
  status: string;
  createdAt?: string;
};

export default function RecruiterJobsPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<RecruiterUser | null>(null);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  // =========================================
  // LOAD LOGGED-IN RECRUITER
  // =========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("campushire_user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser: RecruiterUser =
        JSON.parse(storedUser);

      if (parsedUser.role !== "recruiter") {
        router.push("/");
        return;
      }

      if (!parsedUser.id) {
        setError(
          "Recruiter ID not found. Please login again."
        );
        setLoading(false);
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem(
        "campushire_user"
      );

      localStorage.removeItem(
        "campushire_token"
      );

      router.push("/login");
    }
  }, [router]);

  // =========================================
  // LOAD RECRUITER JOBS
  // =========================================

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser =
        localStorage.getItem(
          "campushire_user"
        );

      if (!storedUser) {
        setError(
          "Recruiter login session not found. Please login again."
        );
        return;
      }

      let currentUser: RecruiterUser;

      try {
        currentUser =
          JSON.parse(storedUser);
      } catch {
        setError(
          "Invalid login session. Please login again."
        );
        return;
      }

      const recruiterId =
        currentUser?.id;

      if (!recruiterId) {
        setError(
          "Recruiter ID not found. Please login again."
        );
        return;
      }

      console.log(
        "RECRUITER ID:",
        recruiterId
      );

      const response =
        await fetch(
          `${API_URL}/recruiter-jobs/my-jobs?recruiterId=${encodeURIComponent(
            recruiterId
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      console.log(
        "MY JOBS RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message ||
                "Failed to load jobs"
        );
      }

      setJobs(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "MY JOBS ERROR:",
        err
      );

      if (
        err instanceof TypeError
      ) {
        setError(
          "Cannot connect to backend. Make sure NestJS is running on port 3000."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your jobs."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  // =========================================
  // DELETE JOB
  // =========================================

  const handleDeleteJob = async (
    jobId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this job?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(jobId);
      setError("");

      const storedUser =
        localStorage.getItem(
          "campushire_user"
        );

      if (!storedUser) {
        setError(
          "Recruiter login session not found. Please login again."
        );
        return;
      }

      let currentUser: RecruiterUser;

      try {
        currentUser =
          JSON.parse(storedUser);
      } catch {
        setError(
          "Invalid login session. Please login again."
        );
        return;
      }

      const recruiterId =
        currentUser?.id;

      if (!recruiterId) {
        setError(
          "Recruiter ID not found. Please login again."
        );
        return;
      }

      const token =
        localStorage.getItem(
          "campushire_token"
        );

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response =
        await fetch(
          `${API_URL}/recruiter-jobs/${jobId}?recruiterId=${encodeURIComponent(
            recruiterId
          )}`,
          {
            method: "DELETE",
            headers,
          }
        );

      const responseText =
        await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {};
      }

      console.log(
        "DELETE JOB RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message ||
                `Failed to delete job (${response.status})`
        );
      }

      // Remove deleted job immediately
      setJobs((currentJobs) =>
        currentJobs.filter(
          (job) =>
            job._id !== jobId
        )
      );

      console.log(
        "JOB DELETED:",
        jobId
      );
    } catch (err) {
      console.error(
        "DELETE JOB ERROR:",
        err
      );

      if (
        err instanceof TypeError
      ) {
        setError(
          "Cannot connect to backend. Make sure NestJS is running on port 3000."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete job."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "campushire_user"
    );

    localStorage.removeItem(
      "campushire_token"
    );

    router.push("/login");
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "Recently posted";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Recently posted";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================
  // INITIALS
  // =========================================

  const getInitials = (
    name?: string
  ) => {
    if (!name) return "R";

    return name
      .trim()
      .split(/\s+/)
      .map(
        (word) => word[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =========================================
  // LOADING USER
  // =========================================

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9fc]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#5b21b6]" />
          Loading recruiter...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9fc] text-[#24163a]">

      {/* =========================================
          NAVBAR
      ========================================= */}

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

            <span className="text-xl font-bold text-black">
  CampusHire
</span>
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              href="/recruiter/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-[#4c1d95]"
            >
              Dashboard
            </Link>

            <Link
              href="/recruiter/jobs"
              className="text-sm font-semibold text-[#4c1d95]"
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
              {getInitials(
                user.name
              )}
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

      {/* =========================================
          PAGE
      ========================================= */}

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* BACK */}

        <Link
          href="/recruiter/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#4c1d95]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-3xl font-bold">
              My Jobs
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage the jobs and opportunities you have posted.
            </p>
          </div>

          <Link
            href="/recruiter/jobs/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#32145f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#421b7a]"
          >
            <Plus className="h-4 w-4" />
            Post New Job
          </Link>

        </div>

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p>{error}</p>

              <button
                type="button"
                onClick={loadJobs}
                className="mt-2 font-bold underline"
              >
                Try Again
              </button>
            </div>

          </div>
        )}

        {/* =========================================
            LOADING
        ========================================= */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-purple-100 bg-white shadow-sm">

            <div className="flex flex-col items-center gap-3">

              <Loader2 className="h-8 w-8 animate-spin text-[#5b21b6]" />

              <p className="text-sm text-gray-500">
                Loading your jobs...
              </p>

            </div>

          </div>

        ) : jobs.length === 0 ? (

          /* =========================================
             EMPTY
          ========================================= */

          <div className="rounded-2xl border border-purple-100 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1ebfa]">
              <Briefcase className="h-7 w-7 text-[#5b21b6]" />
            </div>

            <h2 className="text-xl font-bold">
              No jobs posted yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Start by posting your first job opportunity.
            </p>

            <Link
              href="/recruiter/jobs/new"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#32145f] px-6 text-sm font-semibold text-white hover:bg-[#421b7a]"
            >
              <Plus className="h-4 w-4" />
              Post Your First Job
            </Link>

          </div>

        ) : (

          /* =========================================
             JOBS
          ========================================= */

          <div className="space-y-5">

            {jobs.map((job) => {

              const isDeleting =
                deletingId === job._id;

              return (
                <div
                  key={job._id}
                  className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    {/* JOB INFORMATION */}

                    <div className="flex-1">

                      {/* TITLE */}

                      <div className="mb-2 flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold text-[#24163a]">
                          {job.title}
                        </h2>

                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {job.status ||
                            "Active"}
                        </span>

                      </div>

                      {/* COMPANY */}

                      <p className="mb-4 text-sm font-medium text-gray-600">
                        {job.company}
                      </p>

                      {/* DETAILS */}

                      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">

                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#6d28d9]" />
                          {job.location}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-[#6d28d9]" />
                          {job.jobType}
                        </span>

                        {job.salary && (
                          <span className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-[#6d28d9]" />
                            {job.salary}
                          </span>
                        )}

                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#6d28d9]" />
                          Applications
                        </span>

                      </div>

                      {/* SKILLS */}

                      {job.skills?.length >
                        0 && (
                        <div className="mt-5 flex flex-wrap gap-2">

                          {job.skills.map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-md bg-[#f3eefb] px-3 py-1.5 text-xs font-medium text-[#5b21b6]"
                              >
                                {skill}
                              </span>
                            )
                          )}

                        </div>
                      )}

                      {/* DESCRIPTION */}

                      {job.description && (
                        <p className="mt-5 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                          {
                            job.description
                          }
                        </p>
                      )}

                      {/* DATE */}

                      <p className="mt-5 text-xs text-gray-400">
                        Posted on{" "}
                        {formatDate(
                          job.createdAt
                        )}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 flex-row gap-3 lg:flex-col">

                      {/* APPLICATIONS */}

                      <Link
                        href={`/recruiter/applications?jobId=${job._id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        <Users className="h-4 w-4" />
                        Applications
                      </Link>

                      {/* DELETE */}

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          handleDeleteJob(
                            job._id
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}