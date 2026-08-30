"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  CalendarDays,
  Clock3,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type Application = {
  _id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverMessage?: string;
  status: string;
  createdAt?: string;
};

type User = {
  name: string;
  email: string;
  role?: "student" | "recruiter";
};

function getStatusStyle(status: string) {
  if (status === "Shortlisted") {
    return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900";
  }

  if (status === "Under Review") {
    return "bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900";
  }

  if (status === "Rejected") {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
  }

  return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
}

function formatDate(date?: string) {
  if (!date) return "Recently";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // DARK MODE
  // =========================

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

  useEffect(() => {
    loadUser();
    fetchApplications();
  }, []);

  function loadUser() {
    const savedUser = localStorage.getItem("campushire_user");

    if (!savedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser: User = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to read saved user:", error);
      localStorage.removeItem("campushire_user");
      setUser(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("campushire_user");
    localStorage.removeItem("campushire_token");

    setUser(null);
  }

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const savedUser = localStorage.getItem("campushire_user");

      if (!savedUser) {
        setError("Please login to view your applications.");
        return;
      }

      const loggedInUser: User = JSON.parse(savedUser);

      if (!loggedInUser.email) {
        setError("User email not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/applications/user?email=${encodeURIComponent(
          loggedInUser.email
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load your applications."
        );
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Applications error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-purple-900 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>

            <span className="font-bold text-lg">CampusHire</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/jobs" className="hover:text-purple-900 dark:hover:text-purple-300">
              Find Jobs
            </Link>

            <Link
              href="/applications"
              className="text-purple-900 font-medium dark:text-purple-300"
            >
              My Applications
            </Link>

            <Link href="/profile" className="hover:text-purple-900 dark:hover:text-purple-300">
              Resume Analysis
            </Link>
          </nav>

          <div className="flex items-center gap-4 text-sm">
            {/* USER / LOGOUT */}
            {user && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Hi{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </span>
                </span>

                <button
                  onClick={handleLogout}
                  className="text-purple-900 font-medium hover:underline dark:text-purple-300"
                >
                  Log out
                </button>
              </div>
            )}

            {/* DARK MODE TOGGLE */}
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
          </div>
        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="max-w-6xl mx-auto px-5 pt-10">
        <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-purple-900 to-indigo-950 px-6 md:px-8 py-12">
          <p className="text-sm text-purple-200 font-medium">
            APPLICATIONS
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">
            My Applications
          </h1>

          <p className="text-sm text-purple-200 mt-2">
            Keep track of the jobs and internships you&apos;ve applied for.
          </p>
        </div>
      </section>

      {/* APPLICATIONS */}
      <section className="max-w-6xl mx-auto px-5 py-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-900 animate-spin dark:text-purple-400" />

            <p className="text-sm text-slate-500 mt-4 dark:text-slate-400">
              Loading your applications...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="border border-red-200 bg-red-50 rounded-2xl p-6 text-center dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>

            <button
              onClick={fetchApplications}
              className="mt-4 bg-purple-900 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-purple-800"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {applications.length}
                </span>{" "}
                {applications.length === 1
                  ? "application"
                  : "applications"}
              </p>

              <Link
                href="/jobs"
                className="text-sm text-purple-900 font-medium hover:underline dark:text-purple-300"
              >
                Find more jobs
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="border border-slate-200 rounded-2xl p-10 text-center dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-purple-300 mx-auto dark:text-purple-500" />

                <h2 className="font-semibold mt-4">
                  No applications yet
                </h2>

                <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
                  Apply to jobs and internships to see them here.
                </p>

                <Link
                  href="/jobs"
                  className="inline-block bg-purple-900 text-white rounded-full px-5 py-2.5 mt-5 text-sm font-medium hover:bg-purple-800"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <article
                    key={application._id}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-purple-200 hover:shadow-sm transition dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                      <div className="flex gap-4">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 dark:bg-purple-950">
                          <Briefcase className="w-5 h-5 text-purple-900 dark:text-purple-300" />
                        </div>

                        <div>
                          <Link
                            href={`/jobs/${application.jobId}`}
                            className="font-semibold text-slate-900 hover:text-purple-900 dark:text-slate-100 dark:hover:text-purple-300"
                          >
                            {application.jobTitle}
                          </Link>

                          <p className="text-sm text-slate-600 mt-1 dark:text-slate-300">
                            {application.company}
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              Job location
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:border-slate-800">
                      <div className="flex flex-wrap gap-5 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Applied {formatDate(application.createdAt)}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock3 className="w-3.5 h-3.5" />
                          Application status
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {application.resumeUrl && (
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium border border-slate-300 rounded-full px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            View Resume
                          </a>
                        )}

                        <Link
                          href={`/jobs/${application.jobId}`}
                          className="text-sm font-medium border border-slate-300 rounded-full px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          View Job
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-8 border border-slate-200 rounded-2xl p-8 text-center dark:border-slate-800">
              <CheckCircle2 className="w-7 h-7 text-purple-300 mx-auto dark:text-purple-500" />

              <h2 className="font-medium mt-3">
                Looking for your next opportunity?
              </h2>

              <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                Explore more jobs and internships that match your profile.
              </p>

              <Link
                href="/jobs"
                className="inline-block bg-purple-900 text-white rounded-full px-5 py-2.5 mt-5 text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}