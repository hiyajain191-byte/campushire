"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  X,
  ArrowUpRight,
} from "lucide-react";

const JOBS_PER_PAGE = 6;

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
  jobType?: string;

  jobUrl?: string;

  isFresherFriendly?: boolean;

  recruiterId?: string;
  status?: string;
};

type User = {
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

export default function JobsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [selectedLocations, setSelectedLocations] =
    useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  /* =====================================================
     DARK MODE
  ===================================================== */

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

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    const savedUser = localStorage.getItem("campushire_user");

    if (!savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser);

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("campushire_user");
    }
  }, []);

  /* =====================================================
     FETCH JOBS
  ===================================================== */

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:3000/jobs",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      console.log("JOBS FROM BACKEND:", data);

      let jobList: Job[] = [];

      if (Array.isArray(data)) {
        jobList = data;
      } else if (Array.isArray(data.jobs)) {
        jobList = data.jobs;
      } else if (Array.isArray(data.data)) {
        jobList = data.data;
      }

      console.log("TOTAL JOBS:", jobList.length);

      setJobs(jobList);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);

      setError(
        "Unable to load jobs. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {
    localStorage.removeItem("campushire_user");
    localStorage.removeItem("campushire_token");

    setUser(null);
  }

  /* =====================================================
     TOGGLE CATEGORY
  ===================================================== */

  function toggleCategory(category: string) {
    setSelectedCategories((previous) => {
      if (previous.includes(category)) {
        return previous.filter(
          (item) => item !== category
        );
      }

      return [...previous, category];
    });

    setCurrentPage(1);
  }

  /* =====================================================
     TOGGLE LOCATION
  ===================================================== */

  function toggleLocation(location: string) {
    setSelectedLocations((previous) => {
      if (previous.includes(location)) {
        return previous.filter(
          (item) => item !== location
        );
      }

      return [...previous, location];
    });

    setCurrentPage(1);
  }

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedLocations([]);

    setSearch("");
    setLocationSearch("");

    setCurrentPage(1);
  }

  /* =====================================================
     FILTER JOBS
  ===================================================== */

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const locationValue = locationSearch
        .toLowerCase()
        .trim();

      const title =
        job.title?.toLowerCase() || "";

      const company =
        job.company?.toLowerCase() || "";

      const roleCategory =
        job.roleCategory?.toLowerCase() || "";

      const description =
        job.description?.toLowerCase() || "";

      const location =
        job.location?.toLowerCase() || "";

      const city =
        job.city?.toLowerCase() || "";

      const workMode =
        job.workMode?.toLowerCase() || "";

      const jobType =
        job.jobType?.toLowerCase() || "";

      const skills = Array.isArray(job.skills)
        ? job.skills
        : [];

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        company.includes(searchValue) ||
        roleCategory.includes(searchValue) ||
        description.includes(searchValue) ||
        jobType.includes(searchValue) ||
        skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchValue)
        );

      const matchesLocationSearch =
        !locationValue ||
        location.includes(locationValue) ||
        city.includes(locationValue) ||
        workMode.includes(locationValue);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) => {
          const value =
            category.toLowerCase();

          return (
            title.includes(value) ||
            roleCategory.includes(value) ||
            skills.some((skill) =>
              skill
                .toLowerCase()
                .includes(value)
            )
          );
        });

      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.some(
          (selectedLocation) => {
            const value =
              selectedLocation.toLowerCase();

            return (
              location.includes(value) ||
              city.includes(value) ||
              workMode.includes(value)
            );
          }
        );

      return (
        matchesSearch &&
        matchesLocationSearch &&
        matchesCategory &&
        matchesLocation
      );
    });
  }, [
    jobs,
    search,
    locationSearch,
    selectedCategories,
    selectedLocations,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredJobs.length / JOBS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedJobs = filteredJobs.slice(
    (safePage - 1) * JOBS_PER_PAGE,
    safePage * JOBS_PER_PAGE
  );

  function goToPage(page: number) {
    const nextPage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     SALARY
  ===================================================== */

  function formatSalary(job: Job) {
    const salary = job.salary;

    /* STRING SALARY */

    if (typeof salary === "string") {
      const value = salary.trim();

      if (!value) {
        return "Salary not specified";
      }

      return value;
    }

    /* NUMBER SALARY */

    if (
      typeof salary === "number" &&
      Number.isFinite(salary) &&
      salary > 0
    ) {
      return `₹${salary}`;
    }

    /* OBJECT SALARY */

    if (
      salary &&
      typeof salary === "object"
    ) {
      const min = salary.minLpa;
      const max = salary.maxLpa;

      /*
        IMPORTANT:
        Do not show ₹0–0 LPA.
        0 means salary was not available
        in the dataset.
      */

      if (
        typeof min === "number" &&
        typeof max === "number" &&
        min > 0 &&
        max > 0
      ) {
        return `₹${min}–${max} LPA`;
      }

      if (
        typeof min === "number" &&
        min > 0
      ) {
        return `From ₹${min} LPA`;
      }

      if (
        typeof max === "number" &&
        max > 0
      ) {
        return `Up to ₹${max} LPA`;
      }
    }

    return "Salary not specified";
  }

  /* =====================================================
     POSTED DATE
  ===================================================== */

  function formatPostedDate(job: Job) {
    const date =
      job.postedDate ||
      job.createdAt;

    if (!date) {
      return "Recently";
    }

    /*
      Dataset contains values like:
      "5 days ago"
      "3+ weeks ago"

      These are not JavaScript dates.
      Display them directly.
    */

    if (
      typeof job.postedDate === "string" &&
      job.postedDate.trim()
    ) {
      const posted = job.postedDate.trim();

      if (
        posted.includes("ago") ||
        posted.includes("week") ||
        posted.includes("day") ||
        posted.includes("month") ||
        posted.includes("Starts")
      ) {
        return posted;
      }
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "Recently";
      }

      return parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Recently";
    }
  }

  /* =====================================================
     FILTER SIDEBAR
  ===================================================== */

  function FilterSidebar() {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-700 dark:text-slate-300" />

            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Filters
            </h2>
          </div>

          <button
            onClick={clearFilters}
            className="text-xs font-medium text-purple-900 hover:underline dark:text-purple-300"
          >
            Clear all
          </button>
        </div>

        {/* CATEGORY */}

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Job category
          </h3>

          <div className="mt-4 space-y-3">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(
                    category
                  )}
                  onChange={() =>
                    toggleCategory(category)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-purple-900 focus:ring-purple-900 dark:border-slate-600"
                />

                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* LOCATION */}

        <div className="mt-7 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Location
          </h3>

          <div className="mt-4 space-y-3">
            {locations.map((location) => (
              <label
                key={location}
                className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(
                    location
                  )}
                  onChange={() =>
                    toggleLocation(location)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-purple-900 focus:ring-purple-900 dark:border-slate-600"
                />

                <span>{location}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">

      {/* NAVBAR */}

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

          <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex dark:text-slate-300">
            <Link
              href="/jobs"
              className="font-medium text-purple-900 dark:text-purple-300"
            >
              Find Jobs
            </Link>

            <Link
              href="/applications"
              className="transition hover:text-purple-900 dark:hover:text-purple-300"
            >
              My Applications
            </Link>

            <Link
              href="/profile"
              className="transition hover:text-purple-900 dark:hover:text-purple-300"
            >
              Resume Analysis
            </Link>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden text-slate-600 sm:block dark:text-slate-300">
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
                  className="rounded-full border border-purple-900 px-4 py-2 font-medium text-purple-900 transition hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-950"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-purple-900 px-4 py-2 font-medium text-white transition hover:bg-purple-800"
                >
                  Sign up
                </Link>
              </>
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

      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-5 py-10">

          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">
              Find a job that fits you
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Search through real job opportunities and
              find roles that match your skills and
              interests.
            </p>
          </div>

          {/* SEARCH */}

          <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_0.75fr_auto] dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Job title, company or skill"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                type="text"
                value={locationSearch}
                onChange={(event) => {
                  setLocationSearch(
                    event.target.value
                  );

                  setCurrentPage(1);
                }}
                placeholder="Location"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </div>

            <button
              onClick={() => setCurrentPage(1)}
              className="rounded-xl bg-purple-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-purple-800"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* JOB AREA */}

      <section className="mx-auto max-w-6xl px-5 py-10">

        {/* MOBILE FILTER */}

        <button
          onClick={() =>
            setMobileFilters(true)
          }
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium md:hidden dark:border-slate-800 dark:bg-slate-900"
        >
          <SlidersHorizontal className="h-4 w-4" />

          Filters
        </button>

        <div className="grid gap-8 md:grid-cols-[220px_1fr]">

          {/* DESKTOP SIDEBAR */}

          <div className="hidden md:block">
            <FilterSidebar />
          </div>

          {/* JOB LIST */}

          <div>

            {/* RESULTS HEADER */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  Available jobs
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1
                    ? "job"
                    : "jobs"}{" "}
                  found
                </p>
              </div>

              {(selectedCategories.length > 0 ||
                selectedLocations.length > 0 ||
                search ||
                locationSearch) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 self-start text-xs font-medium text-purple-900 hover:underline dark:text-purple-300"
                >
                  <X className="h-3.5 w-3.5" />

                  Reset filters
                </button>
              )}
            </div>

            {/* LOADING */}

            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center dark:border-slate-800 dark:bg-slate-900">

                <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-900 dark:text-purple-400" />

                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Loading jobs...
                </p>

              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-white p-10 text-center dark:border-red-900 dark:bg-slate-900">

                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>

                <button
                  onClick={fetchJobs}
                  className="mt-5 rounded-full bg-purple-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-800"
                >
                  Try Again
                </button>

              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              filteredJobs.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center dark:border-slate-800 dark:bg-slate-900">

                  <Search className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />

                  <h3 className="mt-4 text-lg font-semibold">
                    No jobs found
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    Try changing your search keywords or
                    removing some filters.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-5 rounded-full bg-purple-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-800"
                  >
                    Clear filters
                  </button>

                </div>
              )}

            {/* JOB CARDS */}

            {!loading &&
              !error &&
              paginatedJobs.length > 0 && (
                <div className="space-y-4">

                  {paginatedJobs.map((job) => (
                    <article
                      key={job._id}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-purple-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
                    >

                      {/* TOP */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-purple-900 dark:text-slate-100 dark:group-hover:text-purple-300">
                            {job.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-purple-900 dark:text-purple-300">
                            {job.company ||
                              "Company not specified"}
                          </p>

                        </div>

                        {job.isFresherFriendly && (
                          <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                            Fresher friendly
                          </span>
                        )}

                      </div>

                      {/* TAGS */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">

                        {job.location && (
                          <span className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-900 dark:bg-purple-950 dark:text-purple-300">

                            <MapPin className="h-3 w-3" />

                            {job.location}

                          </span>
                        )}

                        {job.workMode && (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {job.workMode}
                          </span>
                        )}

                        {job.jobType && (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {job.jobType}
                          </span>
                        )}

                        {job.roleCategory && (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {job.roleCategory}
                          </span>
                        )}

                      </div>

                      {/* DESCRIPTION */}

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {job.description ||
                          "No detailed description available for this job."}
                      </p>

                      {/* SKILLS */}

                      {Array.isArray(job.skills) &&
                        job.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">

                            {job.skills
                              .slice(0, 6)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    key={`${skill}-${index}`}
                                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                            {job.skills.length >
                              6 && (
                              <span className="px-1 py-1 text-xs text-slate-400 dark:text-slate-500">
                                +
                                {job.skills
                                  .length - 6}{" "}
                                more
                              </span>
                            )}

                          </div>
                        )}

                      {/* BOTTOM */}

                      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

                        <div className="flex flex-wrap items-center gap-4">

                          {/* SALARY */}

                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {formatSalary(job)}
                          </span>

                          {/* EXPERIENCE */}

                          {job.experience && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">

                              {job.experience
                                .minYears ??
                                0}
                              –
                              {job.experience
                                .maxYears ??
                                0}{" "}
                              years experience

                            </span>
                          )}

                          {/* POSTED */}

                          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">

                            <Clock className="h-3.5 w-3.5" />

                            {formatPostedDate(
                              job
                            )}

                          </span>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex gap-2">

                          <Link
                            href={`/jobs/${job._id}`}
                            className="flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Details

                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>

                          <Link
                            href={`/jobs/${job._id}/apply`}
                            className="rounded-full bg-purple-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-800"
                          >
                            Apply
                          </Link>

                        </div>

                      </div>

                    </article>
                  ))}

                </div>
              )}

            {/* PAGINATION */}

            {!loading &&
              !error &&
              filteredJobs.length > 0 && (
                <div className="mt-8 flex items-center justify-center gap-2">

                  <button
                    onClick={() =>
                      goToPage(
                        safePage - 1
                      )
                    }
                    disabled={safePage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        goToPage(page)
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                        page === safePage
                          ? "bg-purple-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      goToPage(
                        safePage + 1
                      )
                    }
                    disabled={
                      safePage === totalPages
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                </div>
              )}

          </div>
        </div>
      </section>

      {/* MOBILE FILTER DRAWER */}

      {mobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="absolute inset-0 bg-black/30"
            onClick={() =>
              setMobileFilters(false)
            }
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-slate-950">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-lg font-semibold">
                Filters
              </h2>

              <button
                onClick={() =>
                  setMobileFilters(false)
                }
                className="rounded-full border border-slate-200 p-2 dark:border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <FilterSidebar />

            <button
              onClick={() =>
                setMobileFilters(false)
              }
              className="mt-4 w-full rounded-xl bg-purple-900 py-3 text-sm font-semibold text-white"
            >
              Show {filteredJobs.length} jobs
            </button>

          </div>
        </div>
      )}

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">

        <div className="mx-auto max-w-6xl px-5 py-7">

          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2026 CampusHire
          </p>

        </div>

      </footer>

    </main>
  );
}