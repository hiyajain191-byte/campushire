"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Menu,
  X,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://campushire-xl9m.onrender.com";

type Application = {
  _id: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  name?: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  coverMessage?: string;
  status?: string;
  createdAt?: string;
};

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "student" | "recruiter";
};

export default function ApplicationsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    const savedUser =
      localStorage.getItem(
        "campushire_user"
      );

    if (savedUser) {
      try {
        const parsedUser: User =
          JSON.parse(savedUser);

        setUser(parsedUser);
      } catch {
        localStorage.removeItem(
          "campushire_user"
        );
      }
    }
  }, []);

  // =========================
  // FETCH APPLICATIONS
  // =========================

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "campushire_token"
        );

      const response = await fetch(
        `${API_URL}/applications`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch applications"
        );
      }

      const data =
        await response.json();

      const list: Application[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data.applications)
          ? data.applications
          : Array.isArray(data.data)
          ? data.data
          : [];

      setApplications(list);
    } catch (err) {
      console.error(
        "Failed to fetch applications:",
        err
      );

      setError(
        "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    localStorage.removeItem(
      "campushire_user"
    );

    localStorage.removeItem(
      "campushire_token"
    );

    setUser(null);
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          {/* LOGO */}

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

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-6 text-sm md:flex">

            <Link
              href="/jobs"
              className="text-slate-600 transition-colors hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
            >
              Find Jobs
            </Link>

            <Link
              href="/applications"
              className="font-medium text-purple-900 dark:text-purple-300"
            >
              My Applications
            </Link>

            <Link
              href="/profile"
              className="text-slate-600 transition-colors hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
            >
              Resume Analysis
            </Link>
          </nav>

          {/* DESKTOP AUTH */}

          <div className="hidden items-center gap-4 text-sm md:flex">

            {user ? (
              <>
                <span className="text-slate-600 dark:text-slate-300">
                  Hi{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </span>
                </span>

                <button
                  onClick={
                    handleLogout
                  }
                  className="font-medium text-purple-900 hover:underline dark:text-purple-300"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-purple-900 px-5 py-2.5 font-medium text-purple-900 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-950"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-purple-900 px-5 py-2.5 font-medium text-white hover:bg-purple-950"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            onClick={() =>
              setMenuOpen(
                (prev) => !prev
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">

            <div className="mx-auto flex max-w-6xl flex-col px-5 py-4 text-sm">

              <Link
                href="/jobs"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="border-b border-slate-100 py-3 text-slate-600 dark:border-slate-800 dark:text-slate-300"
              >
                Find Jobs
              </Link>

              <Link
                href="/applications"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="border-b border-slate-100 py-3 font-medium text-purple-900 dark:border-slate-800 dark:text-purple-300"
              >
                My Applications
              </Link>

              <Link
                href="/profile"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="border-b border-slate-100 py-3 text-slate-600 dark:border-slate-800 dark:text-slate-300"
              >
                Resume Analysis
              </Link>

              {user ? (
                <>
                  <div className="border-b border-slate-100 py-3 dark:border-slate-800">
                    Hi{" "}
                    <span className="font-medium">
                      {user.name}
                    </span>
                  </div>

                  <button
                    onClick={
                      handleLogout
                    }
                    className="py-3 text-left font-medium text-purple-900 dark:text-purple-300"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-3">

                  <Link
                    href="/login"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="rounded-full border border-purple-900 py-2.5 text-center font-medium text-purple-900 dark:border-purple-400 dark:text-purple-300"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="rounded-full bg-purple-900 py-2.5 text-center font-medium text-white"
                  >
                    Sign up
                  </Link>

                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================
          PAGE CONTENT
      ========================= */}

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">

        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-3xl">
            My Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track the jobs you have applied
            for.
          </p>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="py-20 text-center">

            <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-900 dark:text-purple-400" />

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading applications...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">

            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              onClick={
                fetchApplications
              }
              className="mt-4 rounded-full bg-purple-900 px-5 py-2 text-sm font-medium text-white hover:bg-purple-800"
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          applications.length ===
            0 && (
            <div className="rounded-2xl border border-slate-200 p-12 text-center dark:border-slate-800">

              <Briefcase className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />

              <h2 className="mt-4 text-lg font-semibold">
                No applications yet
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Start applying to jobs that
                match your skills.
              </p>

              <Link
                href="/jobs"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-purple-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-800"
              >
                Browse Jobs

                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>
          )}

        {/* APPLICATIONS */}

        {!loading &&
          !error &&
          applications.length >
            0 && (
            <div className="flex flex-col gap-5">

              {applications.map(
                (application) => (
                  <div
                    key={
                      application._id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div className="min-w-0">

                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {application.jobTitle ||
                            "Job Application"}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-purple-900 dark:text-purple-300">
                          {application.company ||
                            "Company not specified"}
                        </p>

                      </div>

                      {/* STATUS */}

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                          application.status
                            ?.toLowerCase() ===
                          "rejected"
                            ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : application.status
                                ?.toLowerCase() ===
                              "selected"
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-300"
                        }`}
                      >
                        {application.status ||
                          "Applied"}
                      </span>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 flex flex-wrap gap-2">

                      {application.phone && (
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {application.phone}
                        </span>
                      )}

                      {application.createdAt && (
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5" />

                          {new Date(
                            application.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>
                      )}

                    </div>

                    {/* COVER MESSAGE */}

                    {application.coverMessage && (
                      <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {application.coverMessage}
                      </p>
                    )}

                    {/* FOOTER */}

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

                      {application.resumeUrl ? (
                        <a
                          href={
                            application.resumeUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-purple-900 hover:underline dark:text-purple-300"
                        >
                          View Resume
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Resume not available
                        </span>
                      )}

                      {application.jobId && (
                        <Link
                          href={`/jobs/${application.jobId}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          View Job

                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-slate-200 dark:border-slate-800">

        <div className="mx-auto max-w-6xl px-5 py-6">

          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2026 CampusHire
          </p>

        </div>

      </footer>

    </main>
  );
}