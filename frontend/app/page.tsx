"use client";

import { useEffect, useState } from "react";
import type { MouseEvent, KeyboardEvent } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const JOBS_PER_PAGE = 5;

type Job = {
  _id: string;
  externalJobId?: number;
  title: string;
  company?: string;
  location?: string;
  city?: string;
  roleCategory?: string;

  experience?: {
    minYears?: number;
    maxYears?: number;
  };

  salary?:
    | {
        minLpa?: number;
        maxLpa?: number;
      }
    | number
    | string;

  skills?: string[];
  description?: string;
  postedDate?: string;
  workMode?: string;
  jobUrl?: string;
  isFresherFriendly?: boolean;
};

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "student" | "recruiter";
};

const categories = [
  "Programming",
  "Data Science",
  "Designing",
  "Networking",
  "Management",
  "Marketing",
  "Cybersecurity",
];

const locations = [
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Noida",
  "Gurugram",
  "Kolkata",
  "Chennai",
  "Delhi",
  "Remote",
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [selectedLocations, setSelectedLocations] =
    useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [heroMouse, setHeroMouse] = useState({
    x: 0,
    y: 0,
  });

  const [darkMode, setDarkMode] = useState(false);

  /* =========================
     DARK MODE
  ========================= */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("campushire_theme");

    const prefersDark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

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
     HERO MOUSE EFFECT
  ========================= */

  function handleHeroMouseMove(
    e: MouseEvent<HTMLDivElement>
  ) {
    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width - 0.5) *
      2;

    const y =
      ((e.clientY - rect.top) / rect.height - 0.5) *
      2;

    setHeroMouse({
      x,
      y,
    });
  }

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {
    const savedUser =
      localStorage.getItem("campushire_user");

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

  /* =========================
     FETCH JOBS
  ========================= */

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoadingJobs(true);
      setJobsError("");

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://campushire-xl9m.onrender.com";

      const response = await fetch(
        `${API_URL}/jobs`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch jobs"
        );
      }

      const data = await response.json();

      const jobList: Job[] = Array.isArray(data)
        ? data
        : Array.isArray(data.jobs)
        ? data.jobs
        : Array.isArray(data.data)
        ? data.data
        : [];

      setJobs(jobList);
    } catch (error) {
      console.error(
        "Failed to fetch jobs:",
        error
      );

      setJobsError(
        "Unable to load jobs. Please make sure the backend is running."
      );
    } finally {
      setLoadingJobs(false);
    }
  }

  /* =========================
     LOGOUT
  ========================= */

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

  /* =========================
     FILTERS
  ========================= */

  function toggleCategory(
    category: string
  ) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter(
            (item) => item !== category
          )
        : [...prev, category]
    );

    setCurrentPage(1);
  }

  function toggleLocation(
    location: string
  ) {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter(
            (item) => item !== location
          )
        : [...prev, location]
    );

    setCurrentPage(1);
  }

  /* =========================
     SEARCH
  ========================= */

  function handleSearch() {
    setCurrentPage(1);
  }

  function handleSearchKeyDown(
    e: KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  /* =========================
     FILTER JOBS
  ========================= */

  const filteredJobs = jobs.filter(
    (job) => {
      const searchValue =
        search.toLowerCase().trim();

      const locationValue =
        searchLocation
          .toLowerCase()
          .trim();

      const matchesSearch =
        !searchValue ||
        job.title
          ?.toLowerCase()
          .includes(searchValue) ||
        job.company
          ?.toLowerCase()
          .includes(searchValue) ||
        job.roleCategory
          ?.toLowerCase()
          .includes(searchValue) ||
        job.description
          ?.toLowerCase()
          .includes(searchValue) ||
        job.skills?.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchValue)
        );

      const matchesSearchLocation =
        !locationValue ||
        job.location
          ?.toLowerCase()
          .includes(locationValue) ||
        job.city
          ?.toLowerCase()
          .includes(locationValue);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some(
          (category) => {
            const value =
              category.toLowerCase();

            return (
              job.title
                ?.toLowerCase()
                .includes(value) ||
              job.roleCategory
                ?.toLowerCase()
                .includes(value) ||
              job.skills?.some(
                (skill) =>
                  skill
                    .toLowerCase()
                    .includes(value)
              )
            );
          }
        );

      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.some(
          (location) => {
            const value =
              location.toLowerCase();

            return (
              job.location
                ?.toLowerCase()
                .includes(value) ||
              job.city
                ?.toLowerCase()
                .includes(value) ||
              job.workMode
                ?.toLowerCase()
                .includes(value)
            );
          }
        );

      return (
        matchesSearch &&
        matchesSearchLocation &&
        matchesCategory &&
        matchesLocation
      );
    }
  );

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredJobs.length /
        JOBS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedJobs =
    filteredJobs.slice(
      (safeCurrentPage - 1) *
        JOBS_PER_PAGE,
      safeCurrentPage *
        JOBS_PER_PAGE
    );

  function goToPage(
    page: number
  ) {
    setCurrentPage(
      Math.min(
        Math.max(page, 1),
        totalPages
      )
    );

    window.scrollTo({
      top: 500,
      behavior: "smooth",
    });
  }

  /* =========================
     SALARY
  ========================= */

  function formatSalary(
    job: Job
  ) {
    const salary = job.salary;

    if (
      salary === undefined ||
      salary === null ||
      salary === ""
    ) {
      return "Salary not specified";
    }

    if (
      typeof salary === "number"
    ) {
      if (salary <= 0) {
        return "Salary not specified";
      }

      return `₹${salary.toLocaleString(
        "en-IN"
      )}`;
    }

    if (
      typeof salary === "string"
    ) {
      const trimmedSalary =
        salary.trim();

      if (!trimmedSalary) {
        return "Salary not specified";
      }

      const numericSalary =
        Number(
          trimmedSalary.replace(
            /,/g,
            ""
          )
        );

      if (
        !Number.isNaN(
          numericSalary
        ) &&
        numericSalary > 0
      ) {
        return `₹${numericSalary.toLocaleString(
          "en-IN"
        )}`;
      }

      return trimmedSalary;
    }

    const min =
      salary.minLpa ?? 0;

    const max =
      salary.maxLpa ?? 0;

    if (!min && !max) {
      return "Salary not specified";
    }

    if (min && max) {
      return `₹${min}–₹${max} LPA`;
    }

    if (min) {
      return `From ₹${min} LPA`;
    }

    return `Up to ₹${max} LPA`;
  }

  const isRecruiter =
    user?.role === "recruiter";

  const isStudent =
    user?.role === "student";

  return (
    <main className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* =========================
          ANIMATIONS
      ========================= */}

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatGlow {
          0%,
          100% {
            transform: translate(0, 0)
              scale(1);
          }

          50% {
            transform: translate(
                15px,
                -15px
              )
              scale(1.05);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0%
              50%;
          }

          50% {
            background-position: 100%
              50%;
          }

          100% {
            background-position: 0%
              50%;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(
                -120%
              )
              skewX(-20deg);
          }

          100% {
            transform: translateX(
                220%
              )
              skewX(-20deg);
          }
        }

        .hero-animate {
          animation: fadeSlideUp
            0.7s ease-out both;
        }

        .hero-delay-1 {
          animation-delay: 0.1s;
        }

        .hero-delay-2 {
          animation-delay: 0.25s;
        }

        .hero-delay-3 {
          animation-delay: 0.4s;
        }

        .glow-blob {
          animation: floatGlow
            6s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(
            90deg,
            #ffffff,
            #d8b4fe,
            #ffffff
          );

          background-size: 200% auto;

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;

          animation: gradientShift
            4s ease-in-out infinite;
        }

        .search-glow {
          transition: box-shadow
            0.3s ease;
        }

        .search-glow:focus-within {
          box-shadow:
            0 0 0 4px
              rgba(
                216,
                180,
                254,
                0.35
              ),
            0 10px 30px
              rgba(
                88,
                28,
                135,
                0.35
              );
        }

        .shine-btn {
          position: relative;
          overflow: hidden;
        }

        .shine-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(
              255,
              255,
              255,
              0.4
            ),
            transparent
          );

          transform: translateX(
              -120%
            )
            skewX(-20deg);
        }

        .shine-btn:hover::after {
          animation: shine
            0.9s ease forwards;
        }
      `}</style>

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="border-b border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <Link
            href={
              isRecruiter
                ? "/recruiter"
                : "/"
            }
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

            {isStudent && (
              <>
                <Link
                  href="/jobs"
                  className="text-slate-600 transition-colors hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
                >
                  Find Jobs
                </Link>

                <Link
                  href="/applications"
                  className="text-slate-600 transition-colors hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
                >
                  My Applications
                </Link>

                <Link
                  href="/profile"
                  className="text-slate-600 transition-colors hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
                >
                  Resume Analysis
                </Link>
              </>
            )}

            {isRecruiter && (
              <>
                <Link
                  href="/recruiter"
                  className="font-medium text-purple-900 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-200"
                >
                  Dashboard
                </Link>

                <Link
                  href="/recruiter/jobs"
                  className="text-slate-600 transition-colors hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
                >
                  My Jobs
                </Link>

                <Link
                  href="/recruiter/applications"
                  className="text-slate-600 transition-colors hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
                >
                  Applications
                </Link>
              </>
            )}

          </nav>

          {/* AUTH */}

          <div className="hidden items-center gap-3 text-sm md:flex">

            {user ? (
              <>
                <span className="mr-1 text-slate-600 dark:text-slate-300">
                  Hi{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </span>
                </span>

                <button
                  onClick={handleLogout}
                  className="font-medium text-purple-900 hover:underline dark:text-purple-300"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-purple-900 px-5 py-2.5 font-medium text-purple-900 transition-colors hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-950"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-purple-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-purple-950"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* DARK MODE */}

            <button
              onClick={
                toggleDarkMode
              }
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

          {/* MOBILE BUTTONS */}

          <div className="flex items-center gap-2 md:hidden">

            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700"
              aria-label="Toggle menu"
              onClick={() =>
                setMenuOpen(
                  (value) => !value
                )
              }
            >
              {menuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={
                toggleDarkMode
              }
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

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-sm">

              {isStudent && (
                <>
                  <Link
                    href="/jobs"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="border-b border-slate-100 py-2.5 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                  >
                    Find Jobs
                  </Link>

                  <Link
                    href="/applications"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="border-b border-slate-100 py-2.5 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                  >
                    My Applications
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="border-b border-slate-100 py-2.5 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                  >
                    Resume Analysis
                  </Link>
                </>
              )}

              {isRecruiter && (
                <>
                  <Link
                    href="/recruiter"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="border-b border-slate-100 py-2.5 font-medium text-purple-900 dark:border-slate-800 dark:text-purple-300"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/recruiter/jobs"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="border-b border-slate-100 py-2.5 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                  >
                    My Jobs
                  </Link>

                  <Link
                    href="/recruiter/applications"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="border-b border-slate-100 py-2.5 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                  >
                    Applications
                  </Link>
                </>
              )}

              {user ? (
                <>
                  <div className="border-b border-slate-100 py-2.5 dark:border-slate-800 dark:text-slate-300">
                    Hi{" "}
                    <span className="font-medium">
                      {user.name}
                    </span>
                  </div>

                  <button
                    onClick={
                      handleLogout
                    }
                    className="py-2.5 text-left font-medium text-purple-900 dark:text-purple-300"
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
          HERO
      ========================= */}

      <section className="mx-auto max-w-6xl px-5 pt-8 sm:pt-10">

        <div
          onMouseMove={
            handleHeroMouseMove
          }
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-purple-900 to-indigo-950 px-5 py-12 text-center sm:px-6 sm:py-16 md:py-20"
        >

          <div
            className="glow-blob pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl"
            style={{
              transform: `translate(
                ${heroMouse.x * 12}px,
                ${heroMouse.y * 12}px
              )`,
            }}
          />

          <div
            className="glow-blob pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl"
            style={{
              animationDelay: "2s",
              transform: `translate(
                ${heroMouse.x * -12}px,
                ${heroMouse.y * -12}px
              )`,
            }}
          />

          <h1 className="hero-animate gradient-text relative mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Find your next opportunity
          </h1>

          <p className="hero-animate hero-delay-1 relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-purple-200 md:text-base">
            Explore real job opportunities from
            companies and find the right role for
            your skills.
          </p>

          <div className="hero-animate hero-delay-2 relative mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-purple-200 md:text-sm">
            <span>
              500+ Active Jobs
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-purple-400 sm:block" />

            <span>
              200+ Companies
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-purple-400 sm:block" />

            <span>
              10k+ Candidates
            </span>
          </div>

          {/* SEARCH */}

          <div className="hero-animate hero-delay-3 search-glow relative mx-auto mt-8 flex max-w-2xl flex-col items-stretch gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row dark:bg-slate-900">

            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">

              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                type="text"
                placeholder="Search for jobs or skills"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleSearchKeyDown
                }
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />

            </div>

            <div className="my-1.5 hidden w-px bg-slate-200 sm:block dark:bg-slate-700" />

            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">

              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) =>
                  setSearchLocation(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleSearchKeyDown
                }
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />

            </div>

            <button
              onClick={
                handleSearch
              }
              className="shine-btn shrink-0 rounded-xl bg-purple-900 px-7 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.03] hover:bg-purple-800 active:scale-[0.98]"
            >
              Search
            </button>

          </div>
        </div>
      </section>

      {/* =========================
          JOB SECTION
      ========================= */}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">

        <div className="mb-8">
          <h2 className="text-xl font-semibold md:text-2xl">
            Latest opportunities
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find roles that match your skills and
            career goals.
          </p>
        </div>

        {/* MOBILE FILTER BUTTON */}

        <div className="mb-6 lg:hidden">

          <button
            onClick={() =>
              setFilterOpen(true)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >

            <Search className="h-4 w-4" />

            Filters

            {(selectedCategories.length >
              0 ||
              selectedLocations.length >
                0) && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-900 px-1.5 text-[10px] text-white">
                {selectedCategories.length +
                  selectedLocations.length}
              </span>
            )}

          </button>

        </div>

        <div className="grid gap-10 lg:grid-cols-[210px_1fr]">

          {/* DESKTOP FILTER SIDEBAR */}

          <aside className="hidden flex-col gap-8 lg:flex">

            <div>

              <h3 className="mb-3 text-sm font-semibold">
                Search by Categories
              </h3>

              <div className="flex flex-col gap-2.5">

                {categories.map(
                  (category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                    >

                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(
                          category
                        )}
                        onChange={() =>
                          toggleCategory(
                            category
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-purple-900 focus:ring-purple-900 dark:border-slate-600"
                      />

                      {category}

                    </label>
                  )
                )}

              </div>
            </div>

            <div>

              <h3 className="mb-3 text-sm font-semibold">
                Search by Location
              </h3>

              <div className="flex flex-col gap-2.5">

                {locations.map(
                  (location) => (
                    <label
                      key={location}
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                    >

                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(
                          location
                        )}
                        onChange={() =>
                          toggleLocation(
                            location
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-purple-900 focus:ring-purple-900 dark:border-slate-600"
                      />

                      {location}

                    </label>
                  )
                )}

              </div>
            </div>

          </aside>

          {/* =========================
              MOBILE FILTER DRAWER
          ========================= */}

          {filterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">

              {/* BACKDROP */}

              <div
                className="absolute inset-0 bg-black/40"
                onClick={() =>
                  setFilterOpen(false)
                }
              />

              {/* DRAWER */}

              <div className="absolute right-0 top-0 h-full w-[75%] max-w-xs overflow-y-auto bg-white p-5 shadow-xl dark:bg-slate-950">

                {/* HEADER */}

                <div className="mb-5 flex items-center justify-between">

                  <div>
                    <h2 className="text-lg font-semibold">
                      Filters
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Refine your job search
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setFilterOpen(false)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

                {/* CATEGORIES */}

                <div>

                  <h3 className="mb-3 text-sm font-semibold">
                    Search by Categories
                  </h3>

                  <div className="flex flex-col gap-2.5">

                    {categories.map(
                      (category) => (
                        <label
                          key={category}
                          className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                        >

                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(
                              category
                            )}
                            onChange={() =>
                              toggleCategory(
                                category
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 text-purple-900 focus:ring-purple-900 dark:border-slate-600"
                          />

                          {category}

                        </label>
                      )
                    )}

                  </div>

                </div>

                {/* LOCATIONS */}

                <div className="mt-7">

                  <h3 className="mb-3 text-sm font-semibold">
                    Search by Location
                  </h3>

                  <div className="flex flex-col gap-2.5">

                    {locations.map(
                      (location) => (
                        <label
                          key={location}
                          className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                        >

                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(
                              location
                            )}
                            onChange={() =>
                              toggleLocation(
                                location
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 text-purple-900 focus:ring-purple-900 dark:border-slate-600"
                          />

                          {location}

                        </label>
                      )
                    )}

                  </div>

                </div>

                {/* APPLY */}

                <button
                  onClick={() =>
                    setFilterOpen(false)
                  }
                  className="mt-7 w-full rounded-xl bg-purple-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
                >
                  Apply Filters
                </button>

              </div>
            </div>
          )}

          {/* =========================
              JOB LIST
          ========================= */}

          <div className="flex flex-col gap-5">

            {/* LOADING */}

            {loadingJobs && (
              <div className="py-20 text-center">

                <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-900 dark:text-purple-400" />

                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Loading latest jobs...
                </p>

              </div>
            )}

            {/* ERROR */}

            {!loadingJobs &&
              jobsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">

                  <p className="text-sm text-red-600 dark:text-red-400">
                    {jobsError}
                  </p>

                  <button
                    onClick={
                      fetchJobs
                    }
                    className="mt-4 rounded-full bg-purple-900 px-5 py-2 text-sm font-medium text-white hover:bg-purple-800"
                  >
                    Try Again
                  </button>

                </div>
              )}

            {/* JOBS */}

            {!loadingJobs &&
              !jobsError &&
              paginatedJobs.length >
                0 && (
                <div className="flex flex-col gap-4">

                  {paginatedJobs.map(
                    (job) => (
                      <div
                        key={job._id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6 dark:border-slate-800 dark:bg-slate-900"
                      >

                        {/* TITLE + SALARY */}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {job.title}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-purple-900 dark:text-purple-300">
                              {job.company ||
                                "Company not specified"}
                            </p>

                          </div>

                          <div className="shrink-0">

                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {formatSalary(
                                job
                              )}
                            </p>

                          </div>

                        </div>

                        {/* TAGS */}

                        <div className="mt-4 flex flex-wrap items-center gap-2">

                          {job.location && (
                            <span className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-900 dark:bg-purple-950 dark:text-purple-300">

                              <MapPin className="h-3.5 w-3.5" />

                              {job.location}

                            </span>
                          )}

                          {job.workMode && (
                            <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              {job.workMode}
                            </span>
                          )}

                          {job.experience && (
                            <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">

                              Experience:{" "}

                              {job.experience
                                .minYears ??
                                0}

                              –

                              {job.experience
                                .maxYears ??
                                0}{" "}
                              years

                            </span>
                          )}

                          {job.isFresherFriendly && (
                            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                              Fresher friendly
                            </span>
                          )}

                        </div>

                        {/* DESCRIPTION */}

                        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {job.description ||
                            "No detailed description available."}
                        </p>

                        {/* SKILLS */}

                        {job.skills &&
                          job.skills.length >
                            0 && (
                            <div className="mt-4 flex flex-wrap gap-2">

                              {job.skills
                                .slice(
                                  0,
                                  5
                                )
                                .map(
                                  (
                                    skill
                                  ) => (
                                    <span
                                      key={
                                        skill
                                      }
                                      className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                                    >
                                      {
                                        skill
                                      }
                                    </span>
                                  )
                                )}

                            </div>
                          )}

                        {/* BOTTOM */}

                        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

                          <span className="flex items-center gap-1.5 text-xs text-slate-400">

                            <Clock className="h-3.5 w-3.5" />

                            {job.postedDate ||
                              "Recently"}

                          </span>

                          <div className="flex w-full gap-2 sm:w-auto">

                            <Link
                              href={`/jobs/${job._id}`}
                              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:flex-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Learn more
                            </Link>

                            {isStudent && (
                              <Link
                                href={`/jobs/${job._id}/apply`}
                                className="flex-1 rounded-full bg-purple-900 px-5 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-purple-800 sm:flex-none"
                              >
                                Apply now
                              </Link>
                            )}

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            {/* NO JOBS */}

            {!loadingJobs &&
              !jobsError &&
              filteredJobs.length ===
                0 && (
                <div className="rounded-2xl border border-slate-200 p-12 text-center dark:border-slate-800">

                  <Search className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />

                  <h3 className="mt-4 text-lg font-semibold">
                    No jobs found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Try changing your search
                    or filters.
                  </p>

                </div>
              )}

            {/* PAGINATION */}

            {!loadingJobs &&
              !jobsError &&
              filteredJobs.length >
                0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">

                  <button
                    onClick={() =>
                      goToPage(
                        safeCurrentPage -
                          1
                      )
                    }
                    disabled={
                      safeCurrentPage ===
                      1
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, i) =>
                      i + 1
                  ).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() =>
                          goToPage(
                            page
                          )
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          page ===
                          safeCurrentPage
                            ? "bg-purple-900 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      goToPage(
                        safeCurrentPage +
                          1
                      )
                    }
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                </div>
              )}

          </div>
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}

      {!isRecruiter && (
        <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">

          <div className="mx-auto max-w-6xl px-5 py-14">

            <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950">

              <div>

                <h2 className="text-xl font-semibold md:text-2xl">
                  Ready for your next opportunity?
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Upload your resume and discover
                  jobs that match your skills.
                </p>

              </div>

              <Link
                href="/profile"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-purple-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-800"
              >
                Analyze Resume

                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </section>
      )}

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