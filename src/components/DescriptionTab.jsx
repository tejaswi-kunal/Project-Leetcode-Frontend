import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, ChevronUp, Activity, CheckCircle2, Bookmark } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const DIFFICULTY_STYLE = {
    easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    medium: { label: "Medium", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"   },
    hard:   { label: "Hard",   cls: "text-red-400 bg-red-400/10 border-red-400/20"             },
};

function DescriptionTab({ problem }) {
    const diff = DIFFICULTY_STYLE[problem.difficulty] || DIFFICULTY_STYLE.easy;
    
    // Community States
    const [likes, setLikes] = useState(problem.likes || 0);
    const [dislikes, setDislikes] = useState(problem.dislikes || 0);
    const [reaction, setReaction] = useState(null); 

    // Hints State
    const [openHint, setOpenHint] = useState(null);

    // Save Problem State
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Calculate Acceptance Rate dynamically
    const totalSubs = problem.totalSubmissions || 0;
    const acceptedSubs = problem.acceptedSubmissions || 0;
    const acceptanceRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) + "%" : "0%";

    // THE FIX: Fetch initial user reaction AND saved status
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Reaction
                const reactionRes = await axiosClient.get(`/problem/reaction/${problem._id}`);
                setReaction(reactionRes.data.reaction);

                // 2. Fetch Saved Status (Option 2 implementation)
                // Note: Ensure your backend has this route returning { isSaved: true/false }
                const savedRes = await axiosClient.get(`/problem/checkSaved/${problem._id}`);
                setIsSaved(savedRes.data.isSaved);

            } catch (err) {
                console.error("Failed to fetch user problem data", err);
            }
        };
        
        if (problem._id) {
            fetchData();
        }
    }, [problem._id]);

    const handleLike = async () => {
        try {
            const res = await axiosClient.post(`/problem/like/${problem._id}`);
            setLikes(res.data.likes);
            setDislikes(res.data.dislikes);
            setReaction(reaction === 'like' ? null : 'like');
        } catch (err) {
            console.error("Error liking problem", err);
        }
    };

    const handleDislike = async () => {
        try {
            const res = await axiosClient.post(`/problem/dislike/${problem._id}`);
            setLikes(res.data.likes);
            setDislikes(res.data.dislikes);
            setReaction(reaction === 'dislike' ? null : 'dislike');
        } catch (err) {
            console.error("Error disliking problem", err);
        }
    };

    const handleSaveProblem = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await axiosClient.post(`/problem/saveProblem/${problem._id}`);
            // Toggle the state locally to avoid needing another API call
            setIsSaved(!isSaved); 
        } catch (err) {
            console.error("Error saving problem", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div>
                {/* Title and Save Button Container */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="font-display text-2xl font-bold text-white tracking-wide">{problem.title}</h1>
                    
                    {/* Save Problem Button */}
                    <button 
                        onClick={handleSaveProblem}
                        disabled={isSaving}
                        className={`flex items-center justify-center p-2 rounded-xl border transition-all duration-300 ${
                            isSaved 
                            ? "bg-[#C9963A]/10 border-[#C9963A]/40 text-[#C9963A]" 
                            : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                        title={isSaved ? "Remove from Saved" : "Save Problem"}
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner loading-xs border-current"></span>
                        ) : (
                            <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
                        )}
                    </button>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${diff.cls}`}>
                            {diff.label}
                        </span>
                        {problem.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-300 text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Like & Dislike Buttons */}
                    <div className="flex items-center gap-1 bg-white/[0.02] border border-white/10 rounded-xl p-1 shadow-inner">
                        <button 
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                reaction === 'like' ? 'bg-emerald-400/10 text-emerald-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <ThumbsUp size={14} className={reaction === 'like' ? 'fill-emerald-400/20' : ''} />
                            <span className="font-display font-bold text-sm">{likes}</span>
                        </button>
                        <div className="w-[1px] h-4 bg-white/10"></div>
                        <button 
                            onClick={handleDislike}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                reaction === 'dislike' ? 'bg-red-400/10 text-red-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <ThumbsDown size={14} className={reaction === 'dislike' ? 'fill-red-400/20' : ''} />
                            <span className="font-display font-bold text-sm">{dislikes}</span>
                        </button>
                    </div>
                </div>

                {/* Submission & Acceptance Stats */}
                <div className="flex items-center gap-8 text-xs text-zinc-400 border-t border-white/[0.06] pt-5">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#C9963A]" />
                        <span className="uppercase tracking-widest font-bold text-[10px]">Submissions</span>
                        <span className="font-display font-bold text-zinc-200 text-sm">{totalSubs.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="uppercase tracking-widest font-bold text-[10px]">Acceptance Rate</span>
                        <span className="font-display font-bold text-zinc-200 text-sm">{acceptanceRate}</span>
                    </div>
                </div>
            </div>

            <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed border-t border-white/[0.06] pt-6">
                <div dangerouslySetInnerHTML={{ __html: problem.description || "No description provided." }} />
            </div>

            {/* Examples (Visible Test Cases) */}
            {problem.visibleTestCases?.length > 0 && (
                <div className="space-y-5 mt-10">
                    <h3 className="font-display text-xl font-bold text-white mb-4">Examples</h3>
                    {problem.visibleTestCases.map((tc, idx) => (
                        <div key={idx} className="bg-[#111] border border-white/[0.06] rounded-2xl p-5 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#C9963A]/50"></div>
                            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide">Example {idx + 1}</p>
                            
                            <div className="mb-4">
                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Input</span>
                                <pre className="font-mono bg-[#080808] border border-white/[0.04] p-3 rounded-xl text-sm text-[#E0B455] overflow-x-auto shadow-inner">{tc.input}</pre>
                            </div>
                            
                            <div className="mb-4">
                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Output</span>
                                <pre className="font-mono bg-[#080808] border border-white/[0.04] p-3 rounded-xl text-sm text-emerald-400 overflow-x-auto shadow-inner">{tc.output}</pre>
                            </div>
                            
                            {tc.explanation && (
                                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Explanation</span>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{tc.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Hints Section */}
            {problem.hints && problem.hints.length > 0 && (
                <div className="mt-12 border-t border-white/[0.06] pt-8">
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2 mb-5">
                        <Lightbulb size={20} className="text-[#C9963A]" /> Hints
                    </h3>
                    
                    <div className="space-y-3">
                        {problem.hints.map((hint, idx) => (
                            <div key={idx} className="border border-white/[0.06] rounded-xl overflow-hidden bg-[#111] transition-all duration-300 hover:border-white/10">
                                <button 
                                    onClick={() => setOpenHint(openHint === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-sm text-zinc-300 hover:bg-white/[0.02] transition-colors"
                                >
                                    <span className="font-display font-bold tracking-wide text-[#C9963A]">Hint {idx + 1}</span>
                                    {openHint === idx ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                                </button>
                                {openHint === idx && (
                                    <div className="p-5 pt-0 text-sm text-zinc-400 border-t border-white/[0.04] bg-[#0a0a0a] leading-relaxed">
                                        {hint}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DescriptionTab;