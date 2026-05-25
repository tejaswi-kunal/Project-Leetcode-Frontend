import Editor from "@monaco-editor/react";

const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
);

const SubmitIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
);

function RightWorkspace({ 
    problem, languages, language, code, setCode, 
    handleLanguageChange, handleResetCode, 
    runResult, submitResult, isRunning, isSubmitting, 
    handleRunCode, handleSubmitCode,
    consoleOpen, setConsoleOpen, activeConsoleTab, setActiveConsoleTab
}) {

    const getStatusColor = (status) => {
        if (status === "Accepted") return "text-emerald-400";
        if (status === "Pending" || status === "Processing") return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="w-1/2 flex flex-col gap-4">
            {/* Editor Container */}
            <div className="flex-1 flex flex-col bg-[#111] border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl min-h-[300px]">
                <div className="h-12 border-b border-white/[0.07] flex items-center justify-between px-4 bg-white/[0.02]">
                    <select 
                        value={language} 
                        onChange={handleLanguageChange}
                        className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-[#C9963A]/50 transition-colors"
                    >
                        {languages.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleResetCode}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        Reset Code
                    </button>
                </div>

                <div className="flex-1">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: 'JetBrains Mono, Menlo, monospace',
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            padding: { top: 16 }
                        }}
                    />
                </div>
            </div>

            {/* Console / Result Panel */}
            <div className={`flex flex-col bg-[#111] border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${consoleOpen ? 'h-72' : 'h-14'}`}>
                <div className="h-14 border-b border-white/[0.07] flex items-center justify-between px-4 bg-white/[0.02] shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => { setConsoleOpen(true); setActiveConsoleTab("testcases"); }}
                            className={`text-sm font-medium transition-colors ${activeConsoleTab === "testcases" && consoleOpen ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Testcases
                        </button>
                        <button 
                            onClick={() => { setConsoleOpen(true); setActiveConsoleTab("result"); }}
                            className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeConsoleTab === "result" && consoleOpen ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Result
                            {(runResult || submitResult) && <span className="w-2 h-2 rounded-full bg-[#C9963A]"></span>}
                        </button>
                    </div>
                    <button onClick={() => setConsoleOpen(!consoleOpen)} className="text-zinc-500 hover:text-white p-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: consoleOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                </div>

                {consoleOpen && (
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10">
                        {activeConsoleTab === "testcases" && (
                            <div className="space-y-4">
                                {problem.visibleTestCases?.map((tc, i) => (
                                    <div key={i} className="mb-4">
                                        <p className="text-xs text-zinc-500 mb-1 uppercase">Case {i + 1}</p>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-zinc-600 mb-1">Input</p>
                                                <pre className="bg-white/[0.03] p-2 rounded-md text-sm text-zinc-300">{tc.input}</pre>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-zinc-600 mb-1">Expected Output</p>
                                                <pre className="bg-white/[0.03] p-2 rounded-md text-sm text-zinc-300">{tc.output}</pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeConsoleTab === "result" && (
                            <div>
                                {runResult && !submitResult && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-white mb-2 border-b border-white/10 pb-2">Run Code Results</h3>
                                        {runResult.map((res, i) => {
                                            const isAccepted = res.status.id === 3;
                                            return (
                                                <div key={i} className={`p-4 rounded-xl border ${isAccepted ? 'bg-emerald-400/5 border-emerald-400/20' : 'bg-red-400/5 border-red-400/20'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className={`font-semibold ${isAccepted ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            Test Case {i + 1}: {res.status.description}
                                                        </span>
                                                        <span className="text-xs text-zinc-500">{res.time}s • {res.memory} KB</span>
                                                    </div>
                                                    {!isAccepted && (
                                                        <div className="mt-2 space-y-2 text-sm">
                                                            {res.expected_output && <div><span className="text-zinc-500 text-xs">Expected:</span> <pre className="text-zinc-300 bg-black/40 p-1.5 rounded">{res.expected_output}</pre></div>}
                                                            {res.stdout && <div><span className="text-zinc-500 text-xs">Output:</span> <pre className="text-red-300 bg-red-400/10 p-1.5 rounded">{res.stdout}</pre></div>}
                                                            {res.compile_output && <div><span className="text-zinc-500 text-xs">Compile Error:</span> <pre className="text-red-300 bg-red-400/10 p-1.5 rounded">{res.compile_output}</pre></div>}
                                                            {res.stderr && <div><span className="text-zinc-500 text-xs">Error:</span> <pre className="text-red-300 bg-red-400/10 p-1.5 rounded">{res.stderr}</pre></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {submitResult && (
                                    <div className="py-4">
                                        <h2 className={`text-2xl font-bold mb-2 ${getStatusColor(submitResult.status)}`}>{submitResult.status}</h2>
                                        <div className="flex gap-4 text-sm text-zinc-400 mb-4">
                                            <span className="px-3 py-1 bg-white/[0.05] rounded-full">Passed: <span className="text-white">{submitResult.testCasesPassed} / {submitResult.testCasesTotal}</span></span>
                                            <span className="px-3 py-1 bg-white/[0.05] rounded-full">Runtime: <span className="text-white">{submitResult.runtime} ms</span></span>
                                            <span className="px-3 py-1 bg-white/[0.05] rounded-full">Memory: <span className="text-white">{submitResult.memory} KB</span></span>
                                        </div>
                                        {submitResult.errorMessege && (
                                            <div className="mt-4">
                                                <p className="text-red-400 text-xs mb-1 font-semibold">Details</p>
                                                <pre className="p-3 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">{submitResult.errorMessege}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!runResult && !submitResult && (
                                    <div className="h-full flex items-center justify-center text-zinc-500">
                                        Run or submit your code to see results here.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-3">
                <button 
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white font-medium hover:bg-white/10 disabled:opacity-50 transition-colors"
                >
                    {isRunning ? <span className="loading loading-spinner loading-xs"></span> : <PlayIcon />}
                    Run Code
                </button>
                <button 
                    onClick={handleSubmitCode}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-semibold shadow-[0_0_15px_rgba(201,150,58,0.2)] disabled:opacity-50 transition-all"
                >
                    {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : <SubmitIcon />}
                    Submit
                </button>
            </div>
        </div>
    );
}

export default RightWorkspace;