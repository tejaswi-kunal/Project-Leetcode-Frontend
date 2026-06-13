import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router";
import PremiumLoader from "../components/PremiumLoader";
import {
    Save, Plus, Trash2, Calendar, FileText, AlertCircle, 
    CheckCircle2, Loader2, Trophy, Search, X, Activity, Clock, Edit3
} from "lucide-react";

// Zod schema matching the Contest Mongoose schema
const contestSchema = z.object({
    contestNumber: z.coerce.number().min(1, "Contest number must be at least 1"),
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    description: z.string().min(3, "Description must be at least 3 characters").max(50, "Description maximum 50 characters"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    problems: z.array(z.object({
        problemID: z.string(),
        title: z.string().optional(), // Optional since backend only sends ID initially
        points: z.coerce.number().min(1, "Points must be at least 1")
    })).min(1, "You must add at least one problem to the contest")
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after the start time",
    path: ["endTime"] // Attach error to endTime field
});

function EditContest() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Modal State for Problem Selection
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProblems, setModalProblems] = useState([]);
    const [isFetchingProblems, setIsFetchingProblems] = useState(false);
    const [problemPage, setProblemPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const LIMIT = 10;

    const { register, control, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: zodResolver(contestSchema),
        defaultValues: {
            contestNumber: "",
            title: "",
            description: "",
            startTime: "",
            endTime: "",
            problems: []
        }
    });

    const { fields: problemFields, append: appendProblem, remove: removeProblem } = useFieldArray({
        control,
        name: "problems"
    });

    const selectedProblems = watch("problems");

    // Helper to format MongoDB ISO dates to HTML datetime-local input format
    const formatForDateTimeInput = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    // 1. Fetch existing contest data on mount
    useEffect(() => {
        const fetchContestDetails = async () => {
            try {
                const res = await axiosClient.get(`/admin/getUpcomingContestDetails/${id}`);
                const contest = res.data;

                reset({
                    contestNumber: contest.contestNumber,
                    title: contest.title || "",
                    description: contest.description || "",
                    startTime: formatForDateTimeInput(contest.startTime),
                    endTime: formatForDateTimeInput(contest.endTime),
                    problems: contest.problems ? contest.problems.map(p => ({
                        problemID: p.problemID,
                        points: p.points,
                        // Fallback title so the UI doesn't look empty before re-selecting
                        title: p.title || `Problem ID: ${p.problemID.slice(-6)}...` 
                    })) : []
                });
            } catch (error) {
                setServerError("Failed to fetch contest details. It may have been deleted or already started.");
            } finally {
                setIsPageLoading(false);
            }
        };

        if (id) fetchContestDetails();
    }, [id, reset]);

    // 2. Fetch problem database for the modal
    useEffect(() => {
        if (!isModalOpen) return;
        const fetchProblems = async () => {
            setIsFetchingProblems(true);
            try {
                const res = await axiosClient.get(`/problem/getAllProblems?page=${problemPage}&limit=${LIMIT}`);
                const problemData = res.data;
                setModalProblems(problemData);
                setHasNextPage(problemData.length === LIMIT);
            } catch (err) {
                console.error("Failed to load problems for modal:", err);
            } finally {
                setIsFetchingProblems(false);
            }
        };
        fetchProblems();
    }, [isModalOpen, problemPage]);

    const handleAddProblem = (prob) => {
        appendProblem({
            problemID: prob._id,
            title: prob.title,
            points: 10 
        });
    };

    const isProblemSelected = (probId) => {
        return selectedProblems.some(p => p.problemID === probId);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setServerError("");
        setSuccessMessage("");

        try {
            // Strip out the title parameter since backend only wants problemID and points
            const formattedData = {
                title: data.title,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                problems: data.problems.map(p => ({
                    problemID: p.problemID,
                    points: p.points
                }))
            };

            const response = await axiosClient.put(`/contest/updateContest/${id}`, formattedData);

            setSuccessMessage(response.data?.message || "Contest Updated Successfully!");
            
            setTimeout(() => {
                navigate("/admin/contests/update");
            }, 4000);

        } catch (error) {
            setServerError(error.response?.data?.message || error.response?.data || "An error occurred during update.");
            setIsSubmitting(false);

            setTimeout(() => setServerError(""), 4000);
        }
    };

    const onError = (formErrors) => {
        console.log("Validation Errors:", formErrors);
        setServerError("Validation failed! Please check all required fields.");
        setTimeout(() => setServerError(""), 4000);
    };

    const getDifficultyColor = (diff) => {
        if (diff === 'easy') return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (diff === 'medium') return "text-orange-400 bg-orange-400/10 border-orange-400/20";
        return "text-red-400 bg-red-400/10 border-red-400/20";
    };

    if (isPageLoading) {
        return <PremiumLoader />
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white pb-20 relative animate-in fade-in duration-500">
            
            {/* ── CENTERED SUCCESS MODAL (Blue) ── */}
            {successMessage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-blue-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(59,130,246,0.15)] animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">Success!</h3>
                        <p className="text-zinc-400 text-sm mb-6">{successMessage}</p>
                        <div className="w-full bg-[#161618] h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-[shrink_4s_linear_forwards]" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-3 uppercase tracking-wider">Redirecting to List...</p>
                    </div>
                </div>
            )}

            {/* ── CENTERED ERROR MODAL (Red) ── */}
            {serverError && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setServerError("")}
                >
                    <div 
                        className="bg-[#111] border border-red-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-200 flex flex-col items-center text-center cursor-default"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">Update Failed</h3>
                        <p className="text-zinc-400 text-sm mb-6">{serverError}</p>
                        <button 
                            onClick={() => setServerError("")}
                            className="w-full py-3 rounded-xl bg-[#161618] hover:bg-white/5 border border-white/10 text-zinc-300 font-bold text-sm transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Header section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        <Edit3 size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Edit Contest</h1>
                </div>
                <p className="text-blue-400 font-medium text-sm bg-blue-500/10 border border-blue-500/20 inline-block px-4 py-2 rounded-lg mt-2">
                    Modify the details, timings, and problem structure for this upcoming contest.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
                
                {/* ── 1. CONTEST DETAILS ── */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <Trophy className="text-[#C9963A]" size={20} />
                        <h2 className="font-display text-xl font-bold">Contest Details</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            {/* Contest Number (LOCKED) */}
                            <div className="md:col-span-1 opacity-70">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Contest # (Locked)</label>
                                <input
                                    type="number"
                                    readOnly
                                    {...register("contestNumber")}
                                    className="w-full bg-black/40 text-zinc-500 border border-white/5 rounded-lg px-4 py-3 text-sm cursor-not-allowed outline-none"
                                />
                            </div>

                            {/* Title */}
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Contest Title</label>
                                <input
                                    {...register("title")}
                                    className={`w-full bg-[#161618] border ${errors.title ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
                                />
                                {errors.title && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.title.message}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Short Description (Max 50 chars)</label>
                            <input
                                {...register("description")}
                                className={`w-full bg-[#161618] border ${errors.description ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
                            />
                            {errors.description && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.description.message}</p>}
                        </div>

                        {/* Timings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Calendar size={14}/> Start Time</label>
                                <input
                                    type="datetime-local"
                                    {...register("startTime")}
                                    className={`w-full bg-[#161618] border ${errors.startTime ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
                                />
                                {errors.startTime && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.startTime.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Clock size={14}/> End Time</label>
                                <input
                                    type="datetime-local"
                                    {...register("endTime")}
                                    className={`w-full bg-[#161618] border ${errors.endTime ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
                                />
                                {errors.endTime && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.endTime.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 2. PROBLEM SELECTION ── */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-400" size={20} />
                            <h2 className="font-display text-xl font-bold">Contest Problems</h2>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => { setProblemPage(1); setIsModalOpen(true); }}
                            className="text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20 flex items-center gap-1.5"
                        >
                            <Plus size={14} /> Add Problem
                        </button>
                    </div>

                    <div className="space-y-3">
                        {problemFields.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-[#161618]">
                                <AlertCircle size={24} className="mx-auto mb-2 opacity-30 text-zinc-500" />
                                <p className="text-sm text-zinc-500">No problems added yet. Click "Add Problem" to build your contest.</p>
                                {errors.problems?.root && <p className="text-red-400 text-xs mt-2">{errors.problems.root.message}</p>}
                            </div>
                        ) : (
                            problemFields.map((field, index) => (
                                <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#161618] border border-white/5 p-4 rounded-xl relative group">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-zinc-500 mb-1">Problem {index + 1}</p>
                                        <p className="text-sm font-bold text-white">{field.title}</p>
                                    </div>
                                    <div className="flex items-center gap-4 sm:w-1/3">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Points</label>
                                            <input
                                                type="number"
                                                {...register(`problems.${index}.points`)}
                                                className={`w-full bg-black/40 border ${errors.problems?.[index]?.points ? "border-red-500/50" : "border-white/10"} rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50`}
                                                placeholder="Score"
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeProblem(index)} 
                                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors mt-4"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {errors.problems?.[index]?.points && <span className="absolute -bottom-5 right-4 text-[10px] text-red-400">{errors.problems[index].points.message}</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── ACTION BUTTONS ── */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/contests/update")}
                        disabled={isSubmitting || successMessage !== ""}
                        className="w-full sm:w-1/3 py-4 rounded-xl bg-[#161618] hover:bg-white/5 border border-white/10 text-zinc-300 font-bold text-lg transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting || successMessage !== ""}
                        className="w-full sm:w-2/3 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                Updating Contest...
                            </>
                        ) : (
                            <>
                                <Save size={24} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* ── PROBLEM SELECTION FLOATING MODAL ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
                    <div 
                        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161618]">
                            <div>
                                <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                    <Search size={20} className="text-blue-400"/> Problem Database
                                </h3>
                                <p className="text-xs text-zinc-400 mt-1">Select problems to add to this contest.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {isFetchingProblems ? (
                                <div className="flex items-center justify-center py-20">
                                    <span className="loading loading-spinner loading-lg text-blue-500"></span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {modalProblems.length === 0 ? (
                                        <p className="text-center text-zinc-500 py-10">No problems found.</p>
                                    ) : (
                                        modalProblems.map(prob => {
                                            const isSelected = isProblemSelected(prob._id);
                                            return (
                                                <div key={prob._id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isSelected ? 'bg-blue-500/5 border-blue-500/20' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{prob.title}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${getDifficultyColor(prob.difficulty)}`}>
                                                                {prob.difficulty}
                                                            </span>
                                                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                                <Activity size={12}/> {prob.totalSubmissions} Subs
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleAddProblem(prob)}
                                                        disabled={isSelected}
                                                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${isSelected ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}
                                                    >
                                                        {isSelected ? <><CheckCircle2 size={14}/> Added</> : <><Plus size={14}/> Select</>}
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between rounded-b-2xl">
                            <p className="text-xs text-zinc-500 font-medium">Page <span className="text-white font-bold">{problemPage}</span></p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setProblemPage(p => Math.max(1, p - 1))} 
                                    disabled={problemPage === 1}
                                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white hover:bg-white/5"
                                >
                                    Prev
                                </button>
                                <button 
                                    onClick={() => setProblemPage(p => p + 1)} 
                                    disabled={!hasNextPage}
                                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#161618] border border-white/5 text-zinc-300 hover:text-white hover:bg-white/5"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditContest;