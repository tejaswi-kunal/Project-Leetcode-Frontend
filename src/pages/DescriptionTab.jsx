const DIFFICULTY_STYLE = {
    easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    medium: { label: "Medium", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"   },
    hard:   { label: "Hard",   cls: "text-red-400 bg-red-400/10 border-red-400/20"             },
};

function DescriptionTab({ problem }) {
    const diff = DIFFICULTY_STYLE[problem.difficulty] || DIFFICULTY_STYLE.easy;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-3">{problem.title}</h1>
                <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${diff.cls}`}>
                        {diff.label}
                    </span>
                    {problem.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-zinc-400 text-xs">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="prose prose-invert max-w-none text-zinc-300 text-sm">
                <div dangerouslySetInnerHTML={{ __html: problem.description || "No description provided." }} />
            </div>

            {problem.visibleTestCases?.length > 0 && (
                <div className="space-y-4 mt-8">
                    <h3 className="text-white font-semibold mb-2">Examples</h3>
                    {problem.visibleTestCases.map((tc, idx) => (
                        <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <p className="font-semibold text-zinc-400 mb-2 text-xs uppercase tracking-wider">Example {idx + 1}</p>
                            <div className="mb-2">
                                <span className="text-zinc-500 text-xs font-mono">Input:</span>
                                <pre className="mt-1 bg-[#111] p-2 rounded-lg text-sm text-zinc-300 overflow-x-auto">{tc.input}</pre>
                            </div>
                            <div className="mb-2">
                                <span className="text-zinc-500 text-xs font-mono">Output:</span>
                                <pre className="mt-1 bg-[#111] p-2 rounded-lg text-sm text-zinc-300 overflow-x-auto">{tc.output}</pre>
                            </div>
                            {tc.explanation && (
                                <div className="mt-2">
                                    <span className="text-zinc-500 text-xs font-mono">Explanation:</span>
                                    <p className="mt-1 text-sm text-zinc-300">{tc.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DescriptionTab;