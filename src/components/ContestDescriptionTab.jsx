import { Activity, CheckCircle2,Target } from "lucide-react";

const DIFFICULTY_STYLE = {
    easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    medium: { label: "Medium", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"   },
    hard:   { label: "Hard",   cls: "text-red-400 bg-red-400/10 border-red-400/20"             },
};

function ContestDescriptionTab({ problem, contestPoints }) {
    if (!problem) return null;

    const diff = DIFFICULTY_STYLE[problem.difficulty] || DIFFICULTY_STYLE.easy;

    const totalSubs    = problem.totalSubmissions   || 0;
    const acceptedSubs = problem.acceptedSubmissions || 0;
    const acceptanceRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) + "%" : "0%";

    return (
        <div className="space-y-8 bg-transparent">
            {/* Header Area */}
            <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="font-display text-2xl font-bold text-white tracking-wide">{problem.title}</h1>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${diff.cls}`}>
                            {diff.label}
                        </span>
                        
                        {/* Premium Contest Points Pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C9963A]/10 border border-[#C9963A]/20 shadow-inner">
                            <Target size={14} className="text-[#C9963A]" />
                            <span className="text-[#C9963A] font-mono font-bold text-xs">
                                {contestPoints || 0} pts
                            </span>
                        </div>
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

            {/* Description Body */}
            <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed border-t border-white/[0.06] pt-6">
                <div dangerouslySetInnerHTML={{ __html: problem.description || "No description provided." }} />
            </div>

            {/* Examples (Visible Test Cases) */}
            {problem.visibleTestCases?.length > 0 && (
                <div className="space-y-5 mt-10 border-t border-white/[0.06] pt-8">
                    <h3 className="font-display text-xl font-bold text-white mb-4">Examples</h3>
                    {problem.visibleTestCases.map((tc, idx) => (
                        <div key={idx} className="bg-[#111] border border-white/[0.06] rounded-2xl p-5 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#C9963A]/50"></div>
                            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide">Example {idx + 1}</p>
                            
                            <div className="mb-4">
                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Input</span>
                                <pre className="font-mono bg-[#080808] border border-white/[0.04] p-3 rounded-xl text-[13px] text-[#E0B455] overflow-x-auto shadow-inner">{tc.input}</pre>
                            </div>
                            
                            <div className="mb-4">
                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Output</span>
                                <pre className="font-mono bg-[#080808] border border-white/[0.04] p-3 rounded-xl text-[13px] text-emerald-400 overflow-x-auto shadow-inner">{tc.output}</pre>
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
        </div>
    );
}



export default ContestDescriptionTab;