import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";

function DeleteContestList() {
  const [loading, setLoading] = useState(true);
  const [contests, setContests] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const LIMIT = 10;

  // Modal & Delete State
  const [contestToDelete, setContestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchContests();
  }, [page]);

  const fetchContests = async () => {
    setLoading(true);
    setServerError("");
    try {
      const res = await axiosClient.get(
        `/contest/getUpcomingContest?page=${page}&limit=${LIMIT}`,
      );
      // Safely extract the array whether it's wrapped in 'upcomingContest' or sent directly
      const contestData = res.data?.upcomingContest || res.data || [];

      setContests(contestData);
      setHasNextPage(contestData.length === LIMIT);
    } catch (err) {
      console.error("Failed to load contests:", err);
      setServerError("Failed to load upcoming contests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!contestToDelete) return;
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/contest/deleteContest/${contestToDelete._id}`);

      // Remove contest from UI instantly
      setContests((prev) => prev.filter((c) => c._id !== contestToDelete._id));

      // Set success message and close warning modal
      setSuccessMessage(
        `Contest "${contestToDelete.title}" was permanently deleted.`,
      );
      setContestToDelete(null);

      // Auto-close success modal after 4 seconds
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      alert(
        `Error deleting contest: ${error.response?.data?.message || error.message}`,
      );
      setContestToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to format ISO dates to readable strings (e.g., "Jun 13, 2026 - 02:30 AM")
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white h-full flex flex-col animate-in fade-in duration-500 pb-20 relative">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <Trash2 size={20} />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Delete Upcoming Contests
          </h1>
        </div>
        <p className="text-red-400 font-medium text-sm bg-red-500/10 border border-red-500/20 inline-block px-4 py-2 rounded-lg mt-2">
          <Search size={14} className="inline mr-2 mb-0.5" />
          Click the Remove button to cancel and permanently delete a scheduled
          contest.
        </p>
      </div>

      {/* Error Banner (If fetch fails) */}
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-[#111] border border-white/5 rounded-2xl flex flex-col shadow-lg overflow-hidden flex-1 relative z-10">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <span className="loading loading-spinner loading-lg text-[#C9963A]"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#161618]">
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider w-24">
                    Contest #
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-zinc-500">
                      <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">
                        No upcoming contests scheduled.
                      </p>
                    </td>
                  </tr>
                ) : (
                  contests.map((contest) => (
                    <tr
                      key={contest._id}
                      className="hover:bg-red-500/[0.03] transition-colors group"
                    >
                      <td className="p-4">
                        <span className="text-xs font-bold text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                          #{contest.contestNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                          {contest.title}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <Calendar size={14} className="text-blue-400" />
                          {formatDateTime(contest.startTime)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <Clock size={14} className="text-orange-400" />
                          {formatDateTime(contest.endTime)}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setContestToDelete(contest)}
                          className="text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20 flex items-center gap-1.5 ml-auto"
                        >
                          <Trash2 size={14} /> Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="border-t border-white/5 bg-[#0a0a0a] p-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-medium">
            Page <span className="text-white font-bold">{page}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Glassmorphic Delete Confirmation Modal (Red) ── */}
      {contestToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isDeleting && setContestToDelete(null)}
        >
          <div
            className="bg-[#111] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the box
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-xl font-display font-bold text-white text-center mb-2">
              Cancel Contest?
            </h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              Are you sure you want to cancel and delete{" "}
              <span className="text-white font-bold">
                "{contestToDelete.title}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setContestToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-zinc-300 bg-[#161618] hover:bg-white/5 border border-white/10 transition-colors disabled:opacity-50"
              >
                Keep Contest
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Glassmorphic Success Modal (Green, Centered, Auto-closing) ── */}
      {successMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-emerald-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              Deleted
            </h3>
            <p className="text-zinc-400 text-sm mb-6">{successMessage}</p>
            <div className="w-full bg-[#161618] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full animate-[shrink_4s_linear_forwards]"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteContestList;
