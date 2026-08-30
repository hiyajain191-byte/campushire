"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Briefcase,
} from "lucide-react";

type AnalysisStage = "idle" | "analyzing" | "result";

type LoggedInUser = {
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
  city?: string;
  roleCategory?: string;
  experience?: {
    minYears?: number;
    maxYears?: number;
  };
  salary?: {
    minLpa?: number;
    maxLpa?: number;
  };
  skills?: string[];
  description?: string;
  postedDate?: string;
  workMode?: string;
  jobUrl?: string;
};

type RecommendedJob = Job & {
  matchPercentage: number;
  matchingSkills: string[];
};

const resumeSkills = [
  "C",
  "C++",
  "C#",
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "HTML",
  "HTML5",
  "CSS",
  "CSS3",
  "PHP",
  "SQL",
  "MySQL",
  "MongoDB",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Git",
  "GitHub",
  "GitLab",
  "REST API",
  "REST APIs",
  "Tkinter",
  "Twilio",
  "Figma",
  "Canva",
  "Excel",
  "PowerPoint",
  "Adobe",
  "ChatGPT",
  "Claude",
  "GitHub Copilot",
  "Tailwind CSS",
  "Firebase",
  "AWS",
  "Docker",
  "Linux",
];

export default function ResumeAnalysisPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<
    RecommendedJob[]
  >([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState<LoggedInUser | null>(null);

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

  useEffect(() => {
    loadUser();
  }, []);

  function loadUser() {
    const storedUser = localStorage.getItem("campushire_user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser: LoggedInUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to read logged-in user:", error);
      localStorage.removeItem("campushire_user");
      setUser(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("campushire_user");
    localStorage.removeItem("campushire_token");

    setUser(null);
  }

  function normalizeSkill(skill: string) {
    return skill
      .toLowerCase()
      .replace(/[.#]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractSkills(text: string) {
    const source = text.toLowerCase();
    const foundSkills: string[] = [];

    resumeSkills.forEach((skill) => {
      const normalizedSkill = normalizeSkill(skill);

      const escapedSkill = normalizedSkill.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(
        `(^|[^a-z0-9+#])${escapedSkill}([^a-z0-9+#]|$)`,
        "i"
      );

      if (regex.test(source) && !foundSkills.includes(skill)) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  function calculateJobMatch(
    userSkills: string[],
    job: Job
  ): RecommendedJob {
    const jobSkills = job.skills || [];

    if (jobSkills.length === 0) {
      return {
        ...job,
        matchPercentage: 0,
        matchingSkills: [],
      };
    }

    const matchingSkills = jobSkills.filter((jobSkill) => {
      const normalizedJobSkill = normalizeSkill(jobSkill);

      return userSkills.some((userSkill) => {
        const normalizedUserSkill = normalizeSkill(userSkill);

        if (normalizedUserSkill === normalizedJobSkill) {
          return true;
        }

        if (
          (normalizedUserSkill === "mysql" &&
            normalizedJobSkill === "sql") ||
          (normalizedUserSkill === "sql" &&
            normalizedJobSkill === "mysql")
        ) {
          return true;
        }

        if (
          (normalizedUserSkill === "github" &&
            normalizedJobSkill === "git") ||
          (normalizedUserSkill === "git" &&
            normalizedJobSkill === "github")
        ) {
          return true;
        }

        if (
          (normalizedUserSkill === "html" &&
            normalizedJobSkill === "html5") ||
          (normalizedUserSkill === "html5" &&
            normalizedJobSkill === "html")
        ) {
          return true;
        }

        if (
          (normalizedUserSkill === "css" &&
            normalizedJobSkill === "css3") ||
          (normalizedUserSkill === "css3" &&
            normalizedJobSkill === "css")
        ) {
          return true;
        }

        if (
          (normalizedUserSkill === "rest api" &&
            normalizedJobSkill === "rest apis") ||
          (normalizedUserSkill === "rest apis" &&
            normalizedJobSkill === "rest api")
        ) {
          return true;
        }

        return false;
      });
    });

    const percentage = Math.round(
      (matchingSkills.length / jobSkills.length) * 100
    );

    return {
      ...job,
      matchPercentage: Math.min(100, percentage),
      matchingSkills,
    };
  }

  async function getRecommendedJobs(userSkills: string[]) {
    try {
      const response = await fetch(
        "https://campushire-xl9m.onrender.com/jobs"
      );

      if (!response.ok) {
        throw new Error(
          `Jobs API returned ${response.status}`
        );
      }

      const data = await response.json();

      let jobs: Job[] = [];

      if (Array.isArray(data)) {
        jobs = data;
      } else if (Array.isArray(data.jobs)) {
        jobs = data.jobs;
      } else if (Array.isArray(data.data)) {
        jobs = data.data;
      }

      const scoredJobs = jobs
        .map((job) => calculateJobMatch(userSkills, job))
        .filter((job) => job.matchPercentage > 0)
        .sort(
          (a, b) => b.matchPercentage - a.matchPercentage
        );

      setRecommendedJobs(scoredJobs.slice(0, 6));
    } catch (error) {
      console.error("Recommended jobs error:", error);
      setRecommendedJobs([]);
    }
  }

  function handleFileChange(file: File | null) {
    setError("");

    if (!file) {
      setResume(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const isValidType =
      allowedTypes.includes(file.type) ||
      /\.(pdf|doc|docx)$/i.test(file.name);

    if (!isValidType) {
      setError("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    setResume(file);
    setResumeText("");
    setExtractedSkills([]);
    setRecommendedJobs([]);
    setStage("idle");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleFileChange(file);
    }
  }

  async function handleAnalyze() {
    setError("");

    if (!resume && !resumeText.trim()) {
      setError(
        "Upload a resume file or paste your resume text to continue."
      );
      return;
    }

    setStage("analyzing");

    try {
      let extracted = "";

      if (resume) {
        const storedUser =
          localStorage.getItem("campushire_user");

        if (!storedUser) {
          throw new Error(
            "Please log in before uploading your resume."
          );
        }

        const loggedInUser: LoggedInUser =
          JSON.parse(storedUser);

        setUser(loggedInUser);

        const token =
          localStorage.getItem("campushire_token");

        if (!token) {
          throw new Error(
            "Login session not found. Please log in again."
          );
        }

        const formData = new FormData();

        formData.append("name", loggedInUser.name);
        formData.append("email", loggedInUser.email);
        formData.append("age", "18");
        formData.append("file", resume);

        const response = await fetch(
          "https://campushire-xl9m.onrender.com/submissions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Resume upload failed."
          );
        }

        extracted =
          data.extractedText ||
          data.text ||
          data.resumeText ||
          "";
      } else {
        extracted = resumeText;
      }

      if (!extracted.trim()) {
        throw new Error(
          "We could not extract text from this resume."
        );
      }

      const skills = extractSkills(extracted);

      setExtractedSkills(skills);

      await getRecommendedJobs(skills);

      setStage("result");
    } catch (error) {
      console.error("Resume analysis error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the resume."
      );

      setStage("idle");
    }
  }

  function removeResume() {
    setResume(null);
    setResumeText("");
    setExtractedSkills([]);
    setRecommendedJobs([]);
    setStage("idle");
    setError("");
  }

  function formatSalary(job: Job) {
    const min = job.salary?.minLpa ?? 0;
    const max = job.salary?.maxLpa ?? 0;

    if (!min && !max) {
      return "Salary not specified";
    }

    if (min && max) {
      return `₹${min}–${max} LPA`;
    }

    if (min) {
      return `From ₹${min} LPA`;
    }

    return `Up to ₹${max} LPA`;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">

      {/* NAVBAR */}
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

          {/* NAVIGATION */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">

            <Link
              href="/jobs"
              className="hover:text-purple-900 dark:hover:text-purple-300"
            >
              Find Jobs
            </Link>

            <Link
              href="/applications"
              className="hover:text-purple-900 dark:hover:text-purple-300"
            >
              My Applications
            </Link>

            <Link
              href="/profile"
              className="font-medium text-purple-900 dark:text-purple-300"
            >
              Resume Analysis
            </Link>

          </nav>

          {/* USER / LOGOUT + TOGGLE */}
          <div className="flex items-center gap-4 text-sm">

            {user && (
              <>
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

      {/* MAIN */}
      <div className="mx-auto max-w-5xl px-6 py-16">

        <div className="mb-12 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Sparkles className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Resume Analysis
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Upload your resume and discover jobs that
            match your skills.
          </p>

        </div>

        {/* UPLOAD CARD */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Upload Your Resume
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Supported formats: PDF, DOC, DOCX
            </p>

          </div>

          {!resume ? (

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >

              <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />

              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Drag & drop your resume here
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                or choose a file from your computer
              </p>

              <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-purple-900 dark:hover:bg-purple-800">

                <UploadCloud className="h-4 w-4" />

                Browse File

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(
                      e.target.files?.[0] || null
                    )
                  }
                />

              </label>

            </div>

          ) : (

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900">
                  <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>

                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {resume.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {(resume.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={removeResume}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

          )}

          <div className="mt-8">

            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Or paste your resume text
            </label>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={7}
              className="mt-3 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500"
            />

          </div>

          {error && (

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">

              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>

            </div>

          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={stage === "analyzing"}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-purple-900 dark:hover:bg-purple-800"
          >

            {stage === "analyzing" ? (

              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding matching jobs...
              </>

            ) : (

              <>
                Analyze Resume
                <ArrowRight className="h-4 w-4" />
              </>

            )}

          </button>

        </section>

        {/* RESULT */}
        {stage === "result" && (

          <section className="mt-8">

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Resume Analyzed Successfully
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We found jobs that match your resume skills.
                  </p>

                </div>

              </div>

              {extractedSkills.length > 0 && (

                <div className="mt-7">

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Skills detected from your resume
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {extractedSkills.map((skill) => (

                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {skill}
                      </span>

                    ))}

                  </div>

                </div>

              )}

              {extractedSkills.length === 0 && (

                <div className="mt-7 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No predefined technical skills were detected.
                    You can still browse all available jobs.
                  </p>

                </div>

              )}

            </div>

            {/* RECOMMENDED JOBS */}
            <div className="mt-8">

              <div className="mb-5">

                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Recommended Jobs
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Jobs ranked based on how closely their required
                  skills match your resume.
                </p>

              </div>

              {recommendedJobs.length === 0 ? (

                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

                  <Briefcase className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />

                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    No matching jobs found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    We couldn&apos;t find jobs with matching skills.
                    Try adding more jobs to your database.
                  </p>

                  <Link
                    href="/jobs"
                    className="mt-5 inline-flex rounded-full bg-purple-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-800"
                  >
                    Browse All Jobs
                  </Link>

                </div>

              ) : (

                <div className="grid gap-5 sm:grid-cols-2">

                  {recommendedJobs.map((job) => (

                    <div
                      key={job._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {job.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-purple-900 dark:text-purple-300">
                            {job.company || "Company not specified"}
                          </p>

                        </div>

                        <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                          {job.matchPercentage}% Match
                        </span>

                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">

                        {job.location && (

                          <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs text-purple-900 dark:bg-purple-950 dark:text-purple-300">

                            <MapPin className="h-3 w-3" />

                            {job.location}

                          </span>

                        )}

                        {job.workMode && (

                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {job.workMode}
                          </span>

                        )}

                      </div>

                      {job.experience && (

                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">

                          Experience:{" "}

                          {job.experience.minYears ?? 0}–

                          {job.experience.maxYears ?? 0} years

                        </p>

                      )}

                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {job.description ||
                          "No detailed description available."}
                      </p>

                      {job.matchingSkills.length > 0 && (

                        <div className="mt-4">

                          <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Matching skills
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {job.matchingSkills
                              .slice(0, 5)
                              .map((skill) => (

                                <span
                                  key={skill}
                                  className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
                                >
                                  {skill}
                                </span>

                              ))}

                          </div>

                        </div>

                      )}

                      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {formatSalary(job)}
                      </p>

                      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">

                        <Link
                          href={`/jobs/${job._id}`}
                          className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-center text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Learn more
                        </Link>

                        <Link
                          href={`/jobs/${job._id}/apply`}
                          className="flex-1 rounded-full bg-purple-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-purple-800"
                        >
                          Apply now
                        </Link>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </section>

        )}

      </div>

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