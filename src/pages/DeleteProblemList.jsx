import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { Trash2, ChevronLeft, ChevronRight, AlertCircle, Search, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import PremiumLoader from "../components/PremiumLoader";

function DeleteProblemList() {
    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const LIMIT = 10;

    const [problemToDelete, setProblemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchProblems();
    }, [page]);

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

    const handleDeleteConfirm = async () => {
        if (!problemToDelete) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/problem/delete/${problemToDelete._id}`);
            setProblems(prev => prev.filter(p => p._id !== problemToDelete._id));
            
            // Set the success message using the stored title before nullifying
            setSuccessMessage(`Problem "${problemToDelete.title}" deleted successfully.`);
            setProblemToDelete(null); // Close the warning modal
            
            // Auto-close the success modal after 4 seconds
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            alert(`Error deleting problem: ${error.response?.data?.message || error.message}`);
            setProblemToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const getDifficultyColor = (diff) => {
        if (diff === 'easy') return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (diff === 'medium') return "text-orange-400 bg-orange-400/10 border-orange-400/20";
        return "text-red-400 bg-red-400/10 border-red-400/20";
    };

    const getAcceptanceRate = (accepted, total) => {
        if (!total || total === 0) return 0;
        return Math.round((accepted / total) * 100);
    };

    if (loading) 
    {
        return <PremiumLoader />
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white h-full flex flex-col animate-in fade-in duration-500 pb-20 relative">
            
            {/* Header section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                        <Trash2 size={20} />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Delete Problems</h1>
                </div>
                <p className="text-red-400 font-medium text-sm bg-red-500/10 border border-red-500/20 inline-block px-4 py-2 rounded-lg mt-2">
                    <Search size={14} className="inline mr-2 mb-0.5" />
                    Click the Remove button next to a problem to permanently delete it from the platform.
                </p>
            </div>

            {/* Data Table */}
            <div className="bg-[#111] border border-white/5 rounded-2xl flex flex-col shadow-lg overflow-hidden flex-1 relative z-10">
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
                                            No problems available to delete.
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
                                                    onClick={() => setProblemToDelete(prob)}
                                                    className="text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20 flex items-center gap-1.5 ml-auto"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

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

            {/* Glassmorphic Delete Confirmation Modal */}
            {problemToDelete && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => !isDeleting && setProblemToDelete(null)}
                >
                    <div 
                        className="bg-[#111] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the box
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        
                        <h3 className="text-xl font-display font-bold text-white text-center mb-2">Delete Problem?</h3>
                        <p className="text-zinc-400 text-sm text-center mb-6">
                            Are you absolutely sure you want to delete <span className="text-white font-bold">"{problemToDelete.title}"</span>? This action cannot be undone and will permanently remove all associated submissions and test cases.
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setProblemToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-zinc-300 bg-[#161618] hover:bg-white/5 border border-white/10 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <span className="loading loading-spinner loading-sm"></span> : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Glassmorphic Success Modal (Centered) */}
            {successMessage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSuccessMessage('')}
                >
                    <div 
                        className="bg-[#111] border border-emerald-500/20 rounded-2xl p-6 max-w-sm w-full shadow-[0_20px_60px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the box
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 mx-auto">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white text-center mb-2">Success</h3>
                        <p className="text-zinc-400 text-sm text-center">
                            {successMessage}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeleteProblemList;