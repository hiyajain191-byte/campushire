"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";

type RecruiterUser = {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  role?: string;
};

const formatName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

export default function RecruiterPage() {
  const router = useRouter();

  const [user, setUser] = useState<RecruiterUser | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

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

  useEffect(() => {
    const storedUser = localStorage.getItem("campushire_user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser: RecruiterUser = JSON.parse(storedUser);

      if (
        parsedUser.role !== "recruiter" ||
        (!parsedUser.id && !parsedUser._id)
      ) {
        localStorage.removeItem("campushire_user");
        localStorage.removeItem("campushire_token");
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("USER PARSE ERROR:", error);

      localStorage.removeItem("campushire_user");
      localStorage.removeItem("campushire_token");

      router.replace("/login");
    } finally {
      setCheckingUser(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("campushire_user");
    localStorage.removeItem("campushire_token");

    router.push("/login");
  };

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-[#6D16B8] dark:text-purple-400" />
          Loading recruiter...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white text-[#17121F] dark:bg-slate-950 dark:text-slate-100 transition-colors">

      {/* ================= NAVBAR ================= */}
      <header className="border-b border-[#E9E4EF] bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-[78px] max-w-[1450px] items-center justify-between px-8">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#5B16A8] shadow-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>

            <span className="text-[21px] font-bold tracking-[-0.02em] text-[#111018] dark:text-slate-100">
              CampusHire
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/recruiter"
              className="text-[15px] font-semibold text-[#6D00B5] transition dark:text-purple-300"
            >
              Home
            </Link>

            <Link
              href="/recruiter/dashboard"
              className="text-[15px] font-medium text-[#40394A] transition hover:text-[#6D00B5] dark:text-slate-300 dark:hover:text-purple-300"
            >
              Dashboard
            </Link>

            <Link
              href="/recruiter/jobs"
              className="text-[15px] font-medium text-[#40394A] transition hover:text-[#6D00B5] dark:text-slate-300 dark:hover:text-purple-300"
            >
              My Jobs
            </Link>

            <Link
              href="/recruiter/applications"
              className="text-[15px] font-medium text-[#40394A] transition hover:text-[#6D00B5] dark:text-slate-300 dark:hover:text-purple-300"
            >
              Applications
            </Link>
          </nav>

          {/* PROFILE */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:block">
              <span className="text-[15px] text-[#4B4553] dark:text-slate-300">
                Hi{" "}
                <span className="font-semibold text-[#17121F] dark:text-slate-100">
                  {formatName(user.name)}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[15px] font-semibold text-[#5B16A8] transition hover:text-[#7A00D4] dark:text-purple-300 dark:hover:text-purple-200"
            >
              Log out
            </button>

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

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-[1200px] px-6 pt-7 sm:px-8">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#8B2FE0] via-[#5B1F8F] to-[#150F26] shadow-[0_20px_60px_rgba(91,22,168,0.25)]">

          {/* DECORATIVE GLOW */}
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.06),transparent_60%)]" />

          {/* HERO CONTENT */}
          <div className="relative flex flex-col items-center justify-center px-6 py-9 text-center sm:py-11 md:py-12">

            {/* LABEL */}
            <div className="mb-3 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-sm">
              <p className="text-[10px] font-bold tracking-[0.2em] text-purple-100 sm:text-[11px]">
                RECRUITER PORTAL
              </p>
            </div>

            {/* HEADING */}
            <h1 className="max-w-3xl text-[32px] font-bold leading-tight tracking-[-0.025em] text-white sm:text-[40px] md:text-[46px]">
              Welcome back {formatName(user.name)}
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-3 max-w-[650px] text-[13.5px] leading-6 text-purple-100/90 sm:text-[15px]">
              Manage your job postings, discover talented students,
              and track applications from one place.
            </p>

            {/* FEATURES */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-medium text-purple-100/90 sm:gap-3 sm:text-[12.5px]">
              <span>Post Jobs</span>

              <span className="text-purple-300">•</span>

              <span>Find Candidates</span>

              <span className="text-purple-300">•</span>

              <span>Manage Applications</span>
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/recruiter/jobs/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[13.5px] font-bold text-[#5B16A8] shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[#F8F3FF] hover:shadow-lg"
              >
                <Plus className="h-4.5 w-4.5" />
                Post a New Job
              </Link>

              <Link
                href="/recruiter/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-[13.5px] font-bold text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/20"
              >
                View Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK ACTIONS ================= */}
      <section className="mx-auto max-w-[1450px] px-6 py-9 sm:px-8">

        {/* SECTION HEADING */}
        <div className="mb-5">
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#17121F] dark:text-slate-100">
            Quick Actions
          </h2>

          <p className="mt-1 text-[13px] text-[#777180] dark:text-slate-400">
            Manage your recruitment activities from here.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid gap-5 md:grid-cols-3">

          {/* POST JOB */}
          <Link
            href="/recruiter/jobs/new"
            className="group rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_3px_12px_rgba(30,20,40,0.03)] transition duration-200 hover:-translate-y-1 hover:border-[#D6C3E8] hover:shadow-[0_14px_35px_rgba(91,22,168,0.10)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#6D16B8] transition duration-200 group-hover:bg-[#6D16B8] group-hover:text-white dark:bg-purple-950 dark:text-purple-300">
              <Plus className="h-5.5 w-5.5" />
            </div>

            <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[#17121F] dark:text-slate-100">
              Post a Job
            </h3>

            <p className="mt-2 text-[13px] leading-5.5 text-[#777180] dark:text-slate-400">
              Create a new job opportunity and start receiving applications.
            </p>

            <div className="mt-5 flex items-center gap-1 text-[13px] font-bold text-[#6D16B8] dark:text-purple-300">
              Create Job
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* MY JOBS */}
          <Link
            href="/recruiter/jobs"
            className="group rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_3px_12px_rgba(30,20,40,0.03)] transition duration-200 hover:-translate-y-1 hover:border-[#D6C3E8] hover:shadow-[0_14px_35px_rgba(91,22,168,0.10)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#6D16B8] transition duration-200 group-hover:bg-[#6D16B8] group-hover:text-white dark:bg-purple-950 dark:text-purple-300">
              <Briefcase className="h-5.5 w-5.5" />
            </div>

            <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[#17121F] dark:text-slate-100">
              My Jobs
            </h3>

            <p className="mt-2 text-[13px] leading-5.5 text-[#777180] dark:text-slate-400">
              View and manage the jobs you have posted.
            </p>

            <div className="mt-5 flex items-center gap-1 text-[13px] font-bold text-[#6D16B8] dark:text-purple-300">
              View Jobs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* APPLICATIONS */}
          <Link
            href="/recruiter/applications"
            className="group rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_3px_12px_rgba(30,20,40,0.03)] transition duration-200 hover:-translate-y-1 hover:border-[#D6C3E8] hover:shadow-[0_14px_35px_rgba(91,22,168,0.10)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#6D16B8] transition duration-200 group-hover:bg-[#6D16B8] group-hover:text-white dark:bg-purple-950 dark:text-purple-300">
              <Users className="h-5.5 w-5.5" />
            </div>

            <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[#17121F] dark:text-slate-100">
              Applications
            </h3>

            <p className="mt-2 text-[13px] leading-5.5 text-[#777180] dark:text-slate-400">
              Review candidates and manage applications.
            </p>

            <div className="mt-5 flex items-center gap-1 text-[13px] font-bold text-[#6D16B8] dark:text-purple-300">
              View Applications
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

        </div>
      </section>
    </main>
  );
}