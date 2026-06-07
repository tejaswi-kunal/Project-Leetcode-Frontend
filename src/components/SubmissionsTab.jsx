import { useState } from "react";
import { ArrowLeft, History, Code2, Clock, Cpu } from "lucide-react"; // NEW: Premium Icons

function SubmissionsTab({ submissions }) {
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const getStatusColor = (status) => {
        if (status === "Accepted") return "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]";
        if (status === "Pending" || status === "Processing") return "text-yellow-400";
        if (status === "Time Limit Exceeded") return "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.2)]";
        return "text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]";
    };

    if (selectedSubmission) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Back Button */}
                <button 
                    onClick={() => setSelectedSubmission(null)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to List
                </button>
                
                <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/[0.04] bg-[#111]">
                        <h2 className={`font-display text-xl font-black tracking-wide mb-1 ${getStatusColor(selectedSubmission.status)}`}>
                            {selectedSubmission.status}
                        </h2>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                            Submitted on {new Date(selectedSubmission.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Metrics Panel */}
                    <div className="p-6">
                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="flex-1 min-w-[120px] p-4 rounded-xl border border-white/[0.04] bg-[#111]">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Language</p>
                                <p className="font-mono text-white text-sm flex items-center gap-2">
                                    <Code2 size={14} className="text-[#C9963A]"/> {selectedSubmission.submittedCode?.language}
                                </p>
                            </div>
                            <div className="flex-1 min-w-[120px] p-4 rounded-xl border border-white/[0.04] bg-[#111]">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Runtime</p>
                                <p className="font-mono text-white text-sm flex items-center gap-2">
                                    <Clock size={14} className="text-[#C9963A]"/> {selectedSubmission.runtime} ms
                                </p>
                            </div>
                            <div className="flex-1 min-w-[120px] p-4 rounded-xl border border-white/[0.04] bg-[#111]">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Memory</p>
                                <p className="font-mono text-white text-sm flex items-center gap-2">
                                    <Cpu size={14} className="text-[#C9963A]"/> {selectedSubmission.memory} KB
                                </p>
                            </div>
                            <div className="flex-1 min-w-[120px] p-4 rounded-xl border border-white/[0.04] bg-[#111]">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Test Cases</p>
                                <p className="font-mono text-white text-sm">
                                    {selectedSubmission.testCasesPassed} / {selectedSubmission.testCasesTotal}
                                </p>
                            </div>
                        </div>

                        {selectedSubmission.errorMessege && (
                            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mb-2">Error / Output</p>
                                <pre className="font-mono p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap shadow-inner leading-relaxed">
                                    {selectedSubmission.errorMessege}
                                </pre>
                            </div>
                        )}

                        <div>
                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">Submitted Code</p>
                            <pre className="font-mono p-5 bg-[#080808] border border-white/[0.06] rounded-xl text-sm text-[#E0B455] overflow-x-auto shadow-inner leading-relaxed">
                                {selectedSubmission.submittedCode?.completeCode}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-zinc-500 space-y-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-2">
                        <History size={28} className="opacity-40" />
                    </div>
                    <p className="font-medium font-mono text-zinc-400 text-sm">You haven't submitted any code yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-white tracking-wide mb-5">Submission History</h3>
                    {submissions.map((sub) => (
                        <div 
                            key={sub._id} 
                            onClick={() => setSelectedSubmission(sub)}
                            className="group flex items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-[#111] hover:border-[#C9963A]/40 hover:bg-[#1a1a1a] cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col gap-1.5">
                                <span className={`font-sans font-semibold text-sm tracking-wide ${getStatusColor(sub.status)}`}>
                                    {sub.status}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                                    {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                                <span className="px-2.5 py-1 rounded-md bg-black border border-white/5 group-hover:border-white/10 transition-colors uppercase font-semibold">
                                    {sub.submittedCode.language}
                                </span>
                                <span className="flex items-center gap-1.5 hidden sm:flex">
                                    <Clock size={12} className="text-zinc-500"/> {sub.runtime} ms
                                </span>
                                <span className="flex items-center gap-1.5 hidden sm:flex">
                                    <Cpu size={12} className="text-zinc-500"/> {sub.memory} KB
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SubmissionsTab;