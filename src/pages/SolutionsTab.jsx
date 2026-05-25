import { useState, useEffect } from "react";

function SolutionsTab({ problem }) {
    const [solutionLang, setSolutionLang] = useState("");

    // Initialize solution language when problem loads
    useEffect(() => {
        if (problem?.referenceSolution?.length > 0) {
            setSolutionLang(problem.referenceSolution[0].language);
        }
    }, [problem]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Reference Solutions</h3>
            {problem.referenceSolution?.length > 0 ? (
                <div>
                    <div className="flex gap-2 mb-4 border-b border-white/10 pb-3 overflow-x-auto">
                        {problem.referenceSolution.map((sol) => (
                            <button
                                key={sol.language}
                                onClick={() => setSolutionLang(sol.language)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
                                    solutionLang === sol.language 
                                        ? "bg-[#C9963A] text-black shadow-sm" 
                                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                {sol.language}
                            </button>
                        ))}
                    </div>
                    {solutionLang && problem.referenceSolution.find(s => s.language === solutionLang) && (
                        <div className="border border-white/10 rounded-xl overflow-hidden shadow-lg">
                            <div className="bg-[#111] px-4 py-2 border-b border-white/10">
                                <span className="text-[11px] font-mono uppercase text-zinc-500">{solutionLang} SOLUTION</span>
                            </div>
                            <pre className="p-4 bg-black/60 text-sm overflow-x-auto text-emerald-400/90 font-mono">
                                {problem.referenceSolution.find(s => s.language === solutionLang).completeCode}
                            </pre>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-white/10 rounded-xl">
                    <span className="text-3xl mb-3">🧩</span>
                    <p>No reference solutions available for this problem yet.</p>
                </div>
            )}
        </div>
    );
}

export default SolutionsTab;