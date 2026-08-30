"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Loader2,
  CheckCircle2,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";

type Job = {
  _id: string;
  title: string;
  company?: string;
  location?: string;
};

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverMessage, setCoverMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
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

  // Load logged-in user
  useEffect(() => {
    const savedUser = localStorage.getItem("campushire_user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setName(user.name || "");
        setEmail(user.email || "");
      } catch (err) {
        console.error("Unable to read saved user", err);
      }
    }
  }, []);

  // Load job
  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  async function fetchJob() {
    try {
      setLoadingJob(true);
      setError("");

      const response = await fetch(
        `https://campushire-xl9m.onrender.com/jobs/${jobId}`
      );

      if (!response.ok) {
        throw new Error("Job not found");
      }

      const data = await response.json();

      setJob(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load this job.");
    } finally {
      setLoadingJob(false);
    }
  }

  // Resume upload
  function handleResumeChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isPDF = file.type === "application/pdf";

    const isDOCX =
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isPDF && !isDOCX) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume must be smaller than 5 MB.");
      return;
    }

    setError("");
    setResumeFile(file);
  }

  function removeResume() {
    setResumeFile(null);
  }

  // Submit application
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!job) {
      return;
    }

    if (!resumeFile) {
      setError("Please upload your resume.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();

      formData.append("jobId", job._id);
      formData.append("jobTitle", job.title);
      formData.append("company", job.company || "");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("resume", resumeFile);
      formData.append("coverMessage", coverMessage);
      formData.append("status", "Applied");

      const response = await fetch(
        "https://campushire-xl9m.onrender.com/applications",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Application failed"
        );
      }

      console.log("Application saved:", data);

      setSuccess(true);
    } catch (err) {
      console.error("Application error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to submit application.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loadingJob) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-900 dark:text-purple-400 animate-spin mx-auto" />

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            Loading job...
          </p>
        </div>
      </main>
    );
  }

  // Job not found
  if (!job) {
    return (
      <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <div className="max-w-3xl mx-auto px-5 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to jobs
          </Link>

          <div className="mt-10 border border-red-200 bg-red-50 rounded-2xl p-8 text-center dark:border-red-900 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error || "Job not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Success screen
  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 w-fit"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-900 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>

              <span className="font-bold text-lg dark:text-slate-100">
                CampusHire
              </span>
            </Link>

            <DarkModeToggleButton />
          </div>
        </header>

        <div className="max-w-xl mx-auto px-5 py-20">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center dark:bg-slate-900 dark:border-slate-800">
            <CheckCircle2 className="w-14 h-14 text-green-600 dark:text-green-400 mx-auto" />

            <h1 className="text-2xl font-bold mt-6 dark:text-slate-100">
              Application submitted!
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Your application for{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {job.title}
              </span>{" "}
              at{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {job.company || "the company"}
              </span>{" "}
              has been submitted successfully.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href="/applications"
                className="bg-purple-900 text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-purple-800"
              >
                View My Applications
              </Link>

              <Link
                href="/"
                className="border border-slate-300 text-slate-700 rounded-full px-6 py-3 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Browse More Jobs
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Apply form
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 w-fit"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-900 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>

            <span className="font-bold text-lg dark:text-slate-100">
              CampusHire
            </span>
          </Link>

          <DarkModeToggleButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Back */}
        <Link
          href={`/jobs/${job._id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-900 dark:text-slate-300 dark:hover:text-purple-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to job
        </Link>

        {/* Job card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6 dark:bg-slate-900 dark:border-slate-800">
          <h1 className="text-2xl font-bold dark:text-slate-100">
            {job.title}
          </h1>

          <p className="text-purple-900 dark:text-purple-300 font-medium mt-2">
            {job.company || "Company not specified"}
          </p>

          {job.location && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {job.location}
            </p>
          )}
        </div>

        {/* Application form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 mt-5 dark:bg-slate-900 dark:border-slate-800"
        >
          <h2 className="text-lg font-semibold dark:text-slate-100">
            Apply for this position
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Fill in your details to submit your application.
          </p>

          <div className="space-y-5">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-purple-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-purple-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                required
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Enter your phone number"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-purple-500"
              />
            </div>

            {/* Resume */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Resume
              </label>

              {!resumeFile ? (
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-900 hover:bg-purple-50/30 transition dark:border-slate-700 dark:hover:border-purple-500 dark:hover:bg-purple-950/30">
                  <UploadCloud className="w-8 h-8 text-purple-900 dark:text-purple-400 mb-3" />

                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload your resume
                  </p>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    PDF or DOCX • Maximum 5 MB
                  </p>

                  <span className="mt-4 bg-purple-900 text-white rounded-lg px-4 py-2 text-sm font-medium">
                    Browse File
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between dark:border-slate-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 dark:bg-purple-950">
                      <FileText className="w-5 h-5 text-purple-900 dark:text-purple-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {resumeFile.name}
                      </p>

                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {(
                          resumeFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeResume}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                  >
                    <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Cover message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cover Message
              </label>

              <textarea
                rows={5}
                value={coverMessage}
                onChange={(event) =>
                  setCoverMessage(event.target.value)
                }
                placeholder="Write a short message to the recruiter..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-900 resize-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-purple-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 border border-red-200 bg-red-50 rounded-xl px-4 py-3 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 bg-purple-900 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting application...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}