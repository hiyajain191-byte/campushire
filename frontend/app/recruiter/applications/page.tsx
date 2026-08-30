"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Briefcase,
  Users,
  CalendarDays,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  AlertCircle,
  LogOut,
  ArrowLeft,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:3000";

type RecruiterUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "recruiter";
};

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
  recruiterId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApplicationsResponse =
  | Application[]
  | {
      applications?: Application[];
      data?: Application[];
    };

const filters = [
  "All",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
];

function formatDate(date?: string) {
  if (!date) {
    return "Recently";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status?: string) {
  const value = (status || "Applied").toLowerCase();

  if (value === "shortlisted") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (value === "under review") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-600";
}

export default function RecruiterApplicationsPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<RecruiterUser | null>(null);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [filter, setFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  // =====================================================
  // CHECK LOGIN
  // =====================================================

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
          "Recruiter ID is missing. Please login again."
        );
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      console.error(err);

      localStorage.removeItem(
        "campushire_user"
      );

      localStorage.removeItem(
        "campushire_token"
      );

      router.push("/login");
    }
  }, [router]);

  // =====================================================
  // LOAD APPLICATIONS
  // =====================================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "campushire_token"
          );

        const headers: HeadersInit = {};

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_URL}/applications/recruiter?recruiterId=${encodeURIComponent(
            user.id
          )}`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load applications (${response.status})`
          );
        }

        const data: ApplicationsResponse =
          await response.json();

        console.log(
          "APPLICATIONS FROM BACKEND:",
          data
        );

        let list: Application[] = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (
          Array.isArray(data.applications)
        ) {
          list = data.applications;
        } else if (
          Array.isArray(data.data)
        ) {
          list = data.data;
        }

        setApplications(list);
      } catch (err) {
        console.error(
          "LOAD APPLICATION ERROR:",
          err
        );

        if (err instanceof TypeError) {
          setError(
            "Cannot connect to backend. Make sure NestJS is running on port 3000."
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load applications."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredApplications =
    useMemo(() => {
      if (filter === "All") {
        return applications;
      }

      return applications.filter(
        (application) =>
          (
            application.status ||
            "Applied"
          ).toLowerCase() ===
          filter.toLowerCase()
      );
    }, [applications, filter]);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      const token =
        localStorage.getItem(
          "campushire_token"
        );

      const headers: HeadersInit = {
        "Content-Type":
          "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "STATUS UPDATE ERROR:",
          errorText
        );

        throw new Error(
          `Failed to update status (${response.status})`
        );
      }

      const updatedApplication =
        await response.json();

      console.log(
        "UPDATED APPLICATION:",
        updatedApplication
      );

      setApplications((current) =>
        current.map((application) =>
          application._id ===
          applicationId
            ? {
                ...application,
                status:
                  updatedApplication.status ||
                  newStatus,
                updatedAt:
                  updatedApplication.updatedAt ||
                  application.updatedAt,
              }
            : application
        )
      );
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // DELETE APPLICATION
  // =====================================================

  const deleteApplication = async (
    applicationId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(applicationId);
      setError("");

      const token =
        localStorage.getItem(
          "campushire_token"
        );

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/applications/${applicationId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "DELETE APPLICATION ERROR:",
          errorText
        );

        throw new Error(
          `Failed to delete application (${response.status})`
        );
      }

      // Remove immediately from UI
      setApplications((current) =>
        current.filter(
          (application) =>
            application._id !== applicationId
        )
      );
    } catch (err) {
      console.error(
        "DELETE APPLICATION ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete application."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "campushire_user"
    );

    localStorage.removeItem(
      "campushire_token"
    );

    router.push("/login");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!user || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9fc]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#5b21b6]" />
          Loading applications...
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#faf9fc] text-[#24163a]">

      {/* NAVBAR */}

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
              href="/recruiter"
              className="text-sm font-medium text-gray-600 hover:text-[#4c1d95]"
            >
              Dashboard
            </Link>

            <Link
              href="/recruiter/jobs"
              className="text-sm font-medium text-gray-600 hover:text-[#4c1d95]"
            >
              My Jobs
            </Link>

            <Link
              href="/recruiter/applications"
              className="text-sm font-semibold text-[#4c1d95]"
            >
              Applications
            </Link>

          </nav>

          {/* USER */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                Recruiter
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee7fa] text-sm font-bold text-[#4c1d95]">
              {user.name
                .split(" ")
                .map(
                  (word) =>
                    word[0]
                )
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>

          </div>
        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* BACK */}

        <Link
          href="/recruiter"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#4c1d95]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* HEADER */}

        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-[#6d28d9]">
            RECRUITER
          </p>

          <h1 className="text-3xl font-bold">
            Applications
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review candidates who applied
            to your jobs.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* FILTERS */}

        <div className="mb-5 flex flex-wrap gap-2">

          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setFilter(item)
              }
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                filter === item
                  ? "border-[#32145f] bg-[#32145f] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-purple-200"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

        {/* COUNT */}

        <div className="mb-5 flex items-center gap-2 text-sm text-gray-500">

          <Users className="h-4 w-4" />

          Showing{" "}

          <span className="font-semibold text-[#24163a]">
            {filteredApplications.length}
          </span>{" "}

          applicant
          {filteredApplications.length !== 1
            ? "s"
            : ""}

        </div>

        {/* EMPTY */}

        {filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1ebfb]">
              <Users className="h-6 w-6 text-[#5b21b6]" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              No applications found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Applications for your job
              postings will appear here.
            </p>

          </div>
        ) : (

          /* APPLICATION LIST */

          <div className="space-y-4">

            {filteredApplications.map(
              (application) => {

                const candidateName =
                  application.name ||
                  "Candidate";

                const initials =
                  candidateName
                    .split(" ")
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                const isUpdating =
                  updatingId ===
                  application._id;

                const isDeleting =
                  deletingId ===
                  application._id;

                return (
                  <article
                    key={
                      application._id
                    }
                    className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      {/* CANDIDATE */}

                      <div className="flex gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f1ebfb] text-sm font-bold text-[#5b21b6]">
                          {initials}
                        </div>

                        <div>

                          <h2 className="text-lg font-semibold">
                            {candidateName}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {application.email ||
                              "Email not available"}
                          </p>

                          {application.phone && (
                            <p className="mt-1 text-sm text-gray-500">
                              {application.phone}
                            </p>
                          )}

                          <p className="mt-3 text-sm text-gray-600">
                            Applied for{" "}

                            <span className="font-semibold text-[#24163a]">
                              {application.jobTitle ||
                                "Job"}
                            </span>
                          </p>

                          {application.company && (
                            <p className="mt-1 text-xs text-gray-400">
                              {application.company}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">

                            <CalendarDays className="h-3.5 w-3.5" />

                            Applied on{" "}

                            {formatDate(
                              application.createdAt
                            )}

                          </div>

                        </div>

                      </div>

                      {/* STATUS */}

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle(
                          application.status
                        )}`}
                      >
                        {application.status ||
                          "Applied"}
                      </span>

                    </div>

                    {/* COVER MESSAGE */}

                    {application.coverMessage && (
                      <div className="mt-5 rounded-lg bg-[#faf9fc] p-4">

                        <p className="text-xs font-semibold text-gray-500">
                          Cover Message
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {application.coverMessage}
                        </p>

                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* RESUME */}

                      {application.resumeUrl ? (
                        <a
                          href={
                            application.resumeUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b21b6] hover:text-[#421b7a]"
                        >
                          <FileText className="h-4 w-4" />

                          View Resume
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                          <FileText className="h-4 w-4" />

                          Resume not available
                        </span>
                      )}

                      {/* BUTTONS */}

                      <div className="flex flex-wrap gap-2">

                        {/* REVIEW */}

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() =>
                            updateStatus(
                              application._id,
                              "Under Review"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Clock3 className="h-3.5 w-3.5" />
                          )}

                          Review
                        </button>

                        {/* SHORTLIST */}

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() =>
                            updateStatus(
                              application._id,
                              "Shortlisted"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}

                          Shortlist
                        </button>

                        {/* REJECT */}

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() =>
                            updateStatus(
                              application._id,
                              "Rejected"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}

                          Reject
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() =>
                            deleteApplication(
                              application._id
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}

                          Delete
                        </button>

                      </div>
                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>
    </main>
  );
}