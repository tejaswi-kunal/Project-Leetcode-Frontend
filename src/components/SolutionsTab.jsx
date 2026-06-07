import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Code2 } from "lucide-react"; // NEW: Professional icon instead of Mac dots

function SolutionsTab({ problem }) {
    const [solutionLang, setSolutionLang] = useState("");

    // Initialize solution language when problem loads
    useEffect(() => {
        if (problem?.referenceSolution?.length > 0) {
            setSolutionLang(problem.referenceSolution[0].language);
        }
    }, [problem]);

    // Helper to map your DB language strings to Monaco's expected language IDs
    const getMonacoLanguage = (lang) => {
        if (!lang) return "plaintext";
        const l = lang.toLowerCase();
        if (l === "c++") return "cpp";
        if (l === "node.js" || l === "nodejs") return "javascript";
        return l;
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* APPLIED font-display to the main header */}
            <h3 className="font-display text-2xl font-bold text-white tracking-wide">Reference Solutions</h3>
            
            {problem.referenceSolution?.length > 0 ? (
                <div className="flex flex-col flex-1 h-full min-h-[500px]">
                    {/* Language Toggles */}
                    <div className="flex gap-2 mb-4 border-b border-white/[0.06] pb-4 overflow-x-auto">
                        {problem.referenceSolution.map((sol) => (
                            <button
                                key={sol.language}
                                onClick={() => setSolutionLang(sol.language)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                    solutionLang === sol.language 
                                        ? "bg-[#C9963A] text-black shadow-[0_0_15px_rgba(201,150,58,0.3)]" 
                                        : "bg-white/[0.03] text-zinc-400 border border-white/10 hover:text-white hover:border-[#C9963A]/50 hover:bg-white/[0.06]"
                                }`}
                            >
                                {sol.language}
                            </button>
                        ))}
                    </div>
                    
                    {solutionLang && problem.referenceSolution.find(s => s.language === solutionLang) && (
                        <div className="border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col relative">
                            {/* Premium Editor Header - CLEANED UP */}
                            <div className="bg-[#111] px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
                                <Code2 size={16} className="text-[#C9963A]" />
                                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                                    {solutionLang} SOLUTION
                                </span>
                            </div>
                            
                            {/* Monaco Editor in Read-Only Mode (Using JetBrains Mono internally) */}
                            <div className="flex-1 bg-[#0a0a0a]">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    language={getMonacoLanguage(solutionLang)}
                                    value={problem.referenceSolution.find(s => s.language === solutionLang).completeCode}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        fontSize: 14,
                                        fontFamily: '"JetBrains Mono", monospace', // FORCES premium coding font
                                        renderLineHighlight: "none",
                                        hideCursorInOverviewRuler: true,
                                        overviewRulerBorder: false,
                                        scrollbar: {
                                            vertical: 'hidden',
                                            horizontal: 'auto'
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-[#111] border border-dashed border-white/10 rounded-2xl shadow-inner">
                    <span className="text-4xl mb-4 opacity-50 grayscale">🧩</span>
                    <p className="text-zinc-400 font-medium">No reference solutions available for this problem yet.</p>
                </div>
            )}
        </div>
    );
}

export default SolutionsTab;