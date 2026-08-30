"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Users,
  UserCheck,
  Clock3,
  Plus,
  ArrowRight,
  MapPin,
  Loader2,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = "https://campushire-xl9m.onrender.com";

type RecruiterUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "recruiter";
};

type Job = {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  jobType?: string;
  salary?: string;
  skills?: string[];
  description?: string;
  recruiterId?: string;
  status?: string;
  createdAt?: string;
};

type Application = {
  _id: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  name?: string;
  email?: string;
  status?: string;
  createdAt?: string;
};

type ApplicationsResponse =
  | Application[]
  | {
      applications?: Application[];
    };

export default function RecruiterDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<RecruiterUser | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD LOGGED-IN RECRUITER
  // ==========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("campushire_user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser: RecruiterUser = JSON.parse(storedUser);

      if (!parsedUser.id) {
        throw new Error("Recruiter ID not found");
      }

      if (parsedUser.role !== "recruiter") {
        router.push("/");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("User parsing error:", error);

      localStorage.removeItem("campushire_user");
      localStorage.removeItem("campushire_token");

      router.push("/login");
    }
  }, [router]);

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("campushire_token");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // ======================================
        // GET ONLY THIS RECRUITER'S JOBS
        // ======================================

        const jobsResponse = await fetch(
          `${API_URL}/recruiter-jobs/my-jobs?recruiterId=${encodeURIComponent(
            user.id
          )}`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        const jobsData = await jobsResponse.json();

        console.log("LOGGED-IN RECRUITER:", user);
        console.log("MY JOBS RESPONSE:", jobsData);

        if (!jobsResponse.ok) {
          throw new Error(
            Array.isArray(jobsData?.message)
              ? jobsData.message.join(", ")
              : jobsData?.message || "Failed to load your jobs."
          );
        }

        const recruiterJobs: Job[] = Array.isArray(jobsData)
          ? jobsData
          : [];

        console.log("MY JOBS:", recruiterJobs);

        setJobs(recruiterJobs);

        // ======================================
        // GET APPLICATIONS
        // ======================================

        try {
          const applicationsResponse = await fetch(
            `${API_URL}/applications`,
            {
              method: "GET",
              headers,
              cache: "no-store",
            }
          );

          if (!applicationsResponse.ok) {
            setApplications([]);
          } else {
            const applicationsData: ApplicationsResponse =
              await applicationsResponse.json();

            let allApplications: Application[] = [];

            if (Array.isArray(applicationsData)) {
              allApplications = applicationsData;
            } else if (applicationsData.applications) {
              allApplications = applicationsData.applications;
            }

            // IDs of this recruiter's jobs
            const recruiterJobIds = new Set(
              recruiterJobs.map((job) => String(job._id))
            );

            // Only applications for this recruiter's jobs
            const recruiterApplications =
              allApplications.filter((application) => {
                if (!application.jobId) return false;

                return recruiterJobIds.has(
                  String(application.jobId)
                );
              });

            console.log(
              "MY APPLICATIONS:",
              recruiterApplications
            );

            setApplications(recruiterApplications);
          }
        } catch (applicationError) {
          console.error(
            "Applications endpoint error:",
            applicationError
          );

          setApplications([]);
        }
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  // ==========================================
  // STATS
  // ==========================================

  const activeJobs = useMemo(() => {
    return jobs.filter(
      (job) =>
        !job.status ||
        job.status.toLowerCase() === "active"
    ).length;
  }, [jobs]);

  const totalApplications = applications.length;

  const shortlistedApplications = applications.filter(
    (application) =>
      application.status?.toLowerCase() === "shortlisted"
  ).length;

  const pendingApplications = applications.filter(
    (application) => {
      const status = application.status?.toLowerCase();

      return (
        !status ||
        status === "pending" ||
        status === "applied"
      );
    }
  ).length;

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("campushire_user");
    localStorage.removeItem("campushire_token");

    router.push("/login");
  };

  // ==========================================
  // GET INITIALS
  // ==========================================

  const getInitials = (name?: string) => {
    if (!name) return "R";

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!user || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9fc]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#5b21b6]" />
          Loading recruiter dashboard...
        </div>
      </main>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <main className="min-h-screen bg-[#faf9fc] text-[#24163a]">

      {/* ======================================
          NAVBAR
      ====================================== */}

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

          {/* NAV LINKS */}

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              href="/recruiter"
              className="text-sm font-semibold text-[#4c1d95]"
            >
              Dashboard
            </Link>

            <Link
              href="/recruiter/jobs"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4c1d95]"
            >
              My Jobs
            </Link>

            <Link
              href="/recruiter/applications"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4c1d95]"
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

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* PAGE HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="mb-1 text-sm font-medium text-[#6d28d9]">
              Welcome back, {user.name}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#24163a]">
              Recruiter Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your jobs and find the right candidates.
            </p>

          </div>

          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#32145f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#421b7a]"
          >
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* ======================================
            STATS
        ====================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* ACTIVE JOBS */}

          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Jobs
                </p>

                <p className="mt-2 text-2xl font-bold text-[#24163a]">
                  {activeJobs}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f1ebfb]">
                <Briefcase className="h-5 w-5 text-[#5b21b6]" />
              </div>

            </div>
          </div>

          {/* APPLICATIONS */}

          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Applications
                </p>

                <p className="mt-2 text-2xl font-bold text-[#24163a]">
                  {totalApplications}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f1ebfb]">
                <Users className="h-5 w-5 text-[#5b21b6]" />
              </div>

            </div>
          </div>

          {/* SHORTLISTED */}

          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Shortlisted
                </p>

                <p className="mt-2 text-2xl font-bold text-[#24163a]">
                  {shortlistedApplications}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f1ebfb]">
                <UserCheck className="h-5 w-5 text-[#5b21b6]" />
              </div>

            </div>
          </div>

          {/* PENDING */}

          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Review
                </p>

                <p className="mt-2 text-2xl font-bold text-[#24163a]">
                  {pendingApplications}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f1ebfb]">
                <Clock3 className="h-5 w-5 text-[#5b21b6]" />
              </div>

            </div>
          </div>

        </div>

        {/* ======================================
            JOBS + QUICK ACTIONS
        ====================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* MY JOBS */}

          <section className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between border-b border-purple-100 px-6 py-5">

              <div>
                <h2 className="font-semibold text-[#24163a]">
                  My Job Postings
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Jobs posted by you
                </p>
              </div>

              <Link
                href="/recruiter/jobs"
                className="flex items-center gap-1 text-sm font-semibold text-[#5b21b6] hover:text-[#421b7a]"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

            {jobs.length === 0 ? (

              /* NO JOBS */

              <div className="px-6 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1ebfb]">
                  <Briefcase className="h-5 w-5 text-[#5b21b6]" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#24163a]">
                  No jobs posted yet
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Create your first job opening.
                </p>

                <Link
                  href="/recruiter/jobs/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#32145f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#421b7a]"
                >
                  <Plus className="h-4 w-4" />
                  Post a Job
                </Link>

              </div>

            ) : (

              /* JOB LIST */

              <div className="divide-y divide-purple-50">

                {jobs.slice(0, 5).map((job) => (

                  <div
                    key={job._id}
                    className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#fcfaff] sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-[#24163a]">
                          {job.title}
                        </h3>

                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          {job.status || "Active"}
                        </span>

                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">

                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || "Location not specified"}
                        </span>

                        <span>
                          {job.jobType || "Job"}
                        </span>

                        <span>
                          {job.company || "Company"}
                        </span>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* ======================================
              QUICK ACTIONS
          ====================================== */}

          <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">

            <h2 className="font-semibold text-[#24163a]">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Manage your recruitment activities
            </p>

            <div className="mt-5 space-y-3">

              {/* POST JOB */}

              <Link
                href="/recruiter/jobs/new"
                className="group flex items-center justify-between rounded-lg border border-purple-100 p-4 transition hover:border-purple-200 hover:bg-[#faf7ff]"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1ebfb]">
                    <Plus className="h-4 w-4 text-[#5b21b6]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#24163a]">
                      Post a New Job
                    </p>

                    <p className="text-xs text-gray-500">
                      Create a job opening
                    </p>
                  </div>

                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#5b21b6]" />

              </Link>

              {/* APPLICATIONS */}

              <Link
                href="/recruiter/applications"
                className="group flex items-center justify-between rounded-lg border border-purple-100 p-4 transition hover:border-purple-200 hover:bg-[#faf7ff]"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1ebfb]">
                    <Users className="h-4 w-4 text-[#5b21b6]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#24163a]">
                      View Applications
                    </p>

                    <p className="text-xs text-gray-500">
                      Review candidates
                    </p>
                  </div>

                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#5b21b6]" />

              </Link>

              {/* MANAGE JOBS */}

              <Link
                href="/recruiter/jobs"
                className="group flex items-center justify-between rounded-lg border border-purple-100 p-4 transition hover:border-purple-200 hover:bg-[#faf7ff]"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1ebfb]">
                    <Briefcase className="h-4 w-4 text-[#5b21b6]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#24163a]">
                      Manage Jobs
                    </p>

                    <p className="text-xs text-gray-500">
                      Edit or close jobs
                    </p>
                  </div>

                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#5b21b6]" />

              </Link>

            </div>

          </section>

        </div>

        {/* ======================================
            RECENT APPLICATIONS
        ====================================== */}

        <section className="mt-6 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-purple-100 px-6 py-5">

            <div>
              <h2 className="font-semibold text-[#24163a]">
                Recent Applications
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest candidates for your jobs
              </p>
            </div>

            <Link
              href="/recruiter/applications"
              className="flex items-center gap-1 text-sm font-semibold text-[#5b21b6] hover:text-[#421b7a]"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

          {applications.length === 0 ? (

            <div className="px-6 py-10 text-center">

              <Users className="mx-auto h-8 w-8 text-gray-300" />

              <p className="mt-3 text-sm font-medium text-gray-500">
                No applications yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Applications for your jobs will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-purple-50">

              {applications.slice(0, 5).map((application) => (

                <div
                  key={application._id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#fcfaff] sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1ebfb] text-sm font-semibold text-[#5b21b6]">
                      {(application.name || "Candidate")
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-[#24163a]">
                        {application.name || "Candidate"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {application.jobTitle || "Job application"}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      application.status?.toLowerCase() ===
                      "shortlisted"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {application.status || "Applied"}
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}