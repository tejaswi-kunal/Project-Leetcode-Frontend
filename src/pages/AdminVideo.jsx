import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router'; 
import { Video, UploadCloud, Trash2, Search, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import PremiumLoader from "../components/PremiumLoader";

const AdminVideo = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const LIMIT = 10;

    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchProblems();
    }, [page]);

    const fetchProblems = async () => {
        try {
            setLoading(true);
            setServerError('');
            // Assuming your backend handles the pagination query params
            const { data } = await axiosClient.get(`/problem/getAllProblem?page=${page}&limit=${LIMIT}`);
            
            // Handle both flat array or paginated object responses gracefully
            const problemData = Array.isArray(data) ? data : (data.problems || []);
            
            setProblems(problemData);
            setHasNextPage(problemData.length === LIMIT);
        } catch (err) {
            setServerError('Failed to fetch problems. Please check your connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!videoToDelete) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/video/delete/${videoToDelete._id}`);
            
            setSuccessMessage(`Video solution for "${videoToDelete.title}" deleted successfully.`);
            setVideoToDelete(null);
            
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setServerError(err.response?.data?.error || err.message || "Failed to delete video.");
            setVideoToDelete(null);
            setTimeout(() => setServerError(''), 4000);
        } finally {
            setIsDeleting(false);
        }
    };

    const getDifficultyColor = (diff) => {
        const d = diff?.toLowerCase();
        if (d === 'easy') return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (d === 'medium') return "text-orange-400 bg-orange-400/10 border-orange-400/20";
        return "text-red-400 bg-red-400/10 border-red-400/20";
    };

    const calculateAcceptance = (accepted, total) => {
        if (!total || total === 0) return 0;
        return Math.round((accepted / total) * 100);
    };
    if (loading)
    {
        return <PremiumLoader />
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white h-full flex flex-col animate-in fade-in duration-500 pb-20 relative">
            
            {/* Header section with Purple accents */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <Video size={20} />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Manage Video Solutions</h1>
                </div>
                <p className="text-purple-400 font-medium text-sm bg-purple-500/10 border border-purple-500/20 inline-block px-4 py-2 rounded-lg mt-2">
                    <Search size={14} className="inline mr-2 mb-0.5" />
                    Upload new video explanations or delete existing ones for specific problems.
                </p>
            </div>

            {/* Error Banner */}
            {serverError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{serverError}</p>
                </div>
            )}

            {/* Premium Data Table */}
            <div className="bg-[#111] border border-white/5 rounded-2xl flex flex-col shadow-lg overflow-hidden flex-1 relative z-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-[#161618]">
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Problem Title</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Difficulty</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Submissions (Acc/Tot)</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {problems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-zinc-500">
                                            <Video size={32} className="mx-auto mb-3 opacity-30" />
                                            <p className="text-sm font-medium">No problems found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    problems.map((problem) => (
                                        <tr key={problem._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-white">{problem.title}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-zinc-300 font-mono">
                                                        {problem.acceptedSubmissions || 0} / {problem.totalSubmissions || 0}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Activity size={12} className={calculateAcceptance(problem.acceptedSubmissions, problem.totalSubmissions) >= 50 ? "text-emerald-400" : "text-yellow-400"} />
                                                        <span className="text-[10px] text-zinc-500">
                                                            {calculateAcceptance(problem.acceptedSubmissions, problem.totalSubmissions)}% Acceptance
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <NavLink 
                                                        to={`/admin/videos/upload/${problem._id}`}
                                                        className="text-xs font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors border border-purple-500/20 flex items-center gap-1.5"
                                                    >
                                                        <UploadCloud size={14} /> Upload
                                                    </NavLink>
                                                    <button 
                                                        onClick={() => setVideoToDelete(problem)}
                                                        className="text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20 flex items-center gap-1.5"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                {/* Pagination Controls */}
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

            {/* ── Delete Confirmation Modal (Red) ── */}
            {videoToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isDeleting && setVideoToDelete(null)}>
                    <div className="bg-[#111] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white text-center mb-2">Delete Video Solution?</h3>
                        <p className="text-zinc-400 text-sm text-center mb-6">
                            Are you sure you want to permanently delete the video solution for <span className="text-white font-bold">"{videoToDelete.title}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setVideoToDelete(null)}
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

            {/* ── Success Modal (Green) ── */}
            {successMessage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-emerald-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">Success</h3>
                        <p className="text-zinc-400 text-sm mb-6">{successMessage}</p>
                        <div className="w-full bg-[#161618] h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full animate-[shrink_4s_linear_forwards]" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVideo;