import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { 
    CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, 
    Code2, Cpu, Database
} from "lucide-react";

function AdminSubmissions() {
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalSubmissions: 0,
        hasNextPage: false,
        hasPrevPage: false
    });
    
    // We store the current page in state to trigger re-fetches
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                // Pass the current page as a query parameter
                const res = await axiosClient.get(`/admin/submissions`, {
                    params: { page: page, limit: 15 } // Fetching 15 per page for a full table
                });
                setSubmissions(res.data.submissions);
                setPagination(res.data.pagination);
            } catch (err) {
                console.error("Failed to load submissions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [page]); // Re-run whenever 'page' changes

    const getBadgeStyle = (status) => {
        if (status === "Accepted") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (status === "Time Limit Exceeded" || status === "Pending" || status === "Processing") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        return "text-red-400 bg-red-400/10 border-red-400/20";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const handleNextPage = () => {
        if (pagination.hasNextPage) setPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (pagination.hasPrevPage) setPage(prev => prev - 1);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 font-sans text-white h-full flex flex-col">
            
            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">All Submissions</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Viewing comprehensive platform activity history.
                    </p>
                </div>
                <div className="bg-[#111] border border-white/5 px-4 py-2 rounded-lg">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Records</p>
                    <p className="font-display text-lg font-bold">{pagination.totalSubmissions}</p>
                </div>
            </div>

            {/* ── DATA TABLE CONTAINER ── */}
            <div className="bg-[#111] border border-white/5 rounded-2xl flex flex-col shadow-lg overflow-hidden flex-1">
                
                {loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                        <span className="loading loading-spinner loading-lg text-[#C9963A]"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-[#161618]">
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Problem</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Language</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Performance</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-zinc-500">No submissions found.</td>
                                    </tr>
                                ) : (
                                    submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                                            
                                            {/* Status Column */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {sub.status === "Accepted" ? (
                                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                                    ) : (
                                                        <XCircle size={16} className="text-red-400" />
                                                    )}
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getBadgeStyle(sub.status)}`}>
                                                        {sub.status === "Time Limit Exceeded" ? "TLE" : sub.status}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Problem Column */}
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-white line-clamp-1">{sub.problem}</p>
                                            </td>

                                            {/* User Column */}
                                            <td className="p-4">
                                                <p className="text-sm text-zinc-300 flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-[#222] flex items-center justify-center text-[10px] font-bold text-[#C9963A]">
                                                        {sub.user.charAt(0).toUpperCase()}
                                                    </span>
                                                    {sub.user}
                                                </p>
                                            </td>

                                            {/* Language Column */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-black/30 px-2 py-1 rounded w-fit border border-white/5">
                                                    <Code2 size={12} />
                                                    {sub.language}
                                                </div>
                                            </td>

                                            {/* Performance (Runtime & Memory) Column */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                        <Clock size={12} className="text-blue-400" /> {sub.runtime} ms
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                        <Database size={12} className="text-purple-400" /> {sub.memory} MB
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Time Column */}
                                            <td className="p-4 text-right text-xs text-zinc-400 whitespace-nowrap">
                                                {formatDate(sub.time)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── PAGINATION CONTROLS ── */}
                <div className="border-t border-white/5 bg-[#0a0a0a] p-4 flex items-center justify-between">
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                        <span>Showing Page</span>
                        <span className="text-white font-bold">{pagination.currentPage}</span>
                        <span>of</span>
                        <span className="text-white font-bold">{pagination.totalPages}</span>
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrevPage}
                            disabled={!pagination.hasPrevPage}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white hover:bg-[#222]"
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>
                        
                        <button 
                            onClick={handleNextPage}
                            disabled={!pagination.hasNextPage}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white hover:bg-[#222]"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminSubmissions;