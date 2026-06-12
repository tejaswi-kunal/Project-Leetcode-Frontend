import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import { Edit3, ChevronLeft, ChevronRight, AlertCircle, Search, Activity } from "lucide-react";

function UpdateProblemList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true); 
    const LIMIT = 10;

    useEffect(() => {
        const fetchProblems = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/problem/getAllProblem?page=${page}&limit=${LIMIT}`);
                const problemData = res.data;
                
                setProblems(problemData);
                setHasNextPage(problemData.length === LIMIT); 
            } catch (err) {
                console.error("Failed to load problems:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [page]);

    const getDifficultyColor = (diff) => {
        if (diff === 'easy') return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (diff === 'medium') return "text-orange-400 bg-orange-400/10 border-orange-400/20";
        return "text-red-400 bg-red-400/10 border-red-400/20";
    };

    const getAcceptanceRate = (accepted, total) => {
        if (!total || total === 0) return 0;
        return Math.round((accepted / total) * 100);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white h-full flex flex-col animate-in fade-in duration-500 pb-20">
            
            {/* Header section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        <Edit3 size={20} />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Update Problems</h1>
                </div>
                <p className="text-blue-400 font-medium text-sm bg-blue-500/10 border border-blue-500/20 inline-block px-4 py-2 rounded-lg mt-2">
                    <Search size={14} className="inline mr-2 mb-0.5" />
                    Click the Edit button next to a problem to modify its details, test cases, or solutions.
                </p>
            </div>

            {/* Data Table */}
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
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Problem Title</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Difficulty</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Submissions</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Acceptance</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {problems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-zinc-500">
                                            <AlertCircle size={24} className="mx-auto mb-2 opacity-30" />
                                            No problems found on the platform.
                                        </td>
                                    </tr>
                                ) : (
                                    problems.map((prob) => (
                                        <tr key={prob._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-white">{prob.title}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getDifficultyColor(prob.difficulty)}`}>
                                                    {prob.difficulty}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-zinc-300 font-mono">
                                                    {prob.totalSubmissions}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Activity size={14} className={getAcceptanceRate(prob.acceptedSubmissions, prob.totalSubmissions) >= 50 ? "text-emerald-400" : "text-yellow-400"} />
                                                    <span className="text-sm font-bold text-zinc-300">
                                                        {getAcceptanceRate(prob.acceptedSubmissions, prob.totalSubmissions)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => navigate(`/admin/problems/update/${prob._id}`)}
                                                    className="text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20"
                                                >
                                                    Edit
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
                    <p className="text-xs text-zinc-500 font-medium">Page <span className="text-white font-bold">{page}</span></p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(p => p - 1)} 
                            disabled={page === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button 
                            onClick={() => setPage(p => p + 1)} 
                            disabled={!hasNextPage}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateProblemList;