import Editor from "@monaco-editor/react";
import { Play, Send, RotateCcw, ChevronUp } from "lucide-react"; 

function RightWorkspace({ 
    problem, languages, language, code, setCode, 
    handleLanguageChange, handleResetCode, 
    runResult, submitResult, isRunning, isSubmitting, 
    handleRunCode, handleSubmitCode,
    consoleOpen, setConsoleOpen, activeConsoleTab, setActiveConsoleTab
}) {

    // Helper for Submission Results (from DB or API Error)
    const getStatusColor = (status) => {
        if (status === "Accepted") return "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]";
        if (status === "Pending" || status === "Processing") return "text-yellow-400";
        if (status === "Time Limit Exceeded") return "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.2)]";
        
        // NEW: Handle API Error states specifically
        if (status === "Rate Limit Exceeded" || status === "Request Error" || status === "Network Error") {
            return "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse";
        }
        
        return "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]";
    };

    // Mapping Judge0 IDs explicitly to UI styles
    const getRunStatusUI = (id) => {
        if (id === 3) return { label: "Accepted", text: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" };
        if (id === 4) return { label: "Wrong Answer", text: "text-red-400", bg: "bg-red-400/5", border: "border-red-400/20" };
        if (id === 5) return { label: "Time Limit Exceeded", text: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/20" };
        if (id === 6) return { label: "Compilation Error", text: "text-yellow-400", bg: "bg-yellow-400/5", border: "border-yellow-400/20" };
        if (id >= 7 && id <= 12) return { label: "Runtime Error", text: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/20" };
        return { label: "Internal Error", text: "text-zinc-400", bg: "bg-zinc-400/5", border: "border-zinc-400/20" };
    };

    return (
        <div className="flex-1 min-w-0 flex flex-col gap-5 h-full">
            {/* Editor Container */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl min-h-[300px]">
                {/* IDE Tab Header */}
                <div className="h-12 border-b border-white/[0.06] flex items-center justify-between px-5 bg-[#111]">
                    <div className="flex items-center gap-3">
                        <select 
                            value={language} 
                            onChange={handleLanguageChange}
                            className="bg-black/40 border border-white/10 text-white text-xs font-bold tracking-wide rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C9963A]/50 transition-colors cursor-pointer"
                        >
                            {languages.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleResetCode}
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                        <RotateCcw size={12} /> Reset
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
                            fontFamily: '"JetBrains Mono", monospace',
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            padding: { top: 16 },
                            overviewRulerBorder: false,
                            hideCursorInOverviewRuler: true
                        }}
                    />
                </div>
            </div>

            {/* Console / Result Panel */}
            <div className={`flex flex-col bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${consoleOpen ? 'h-72' : 'h-14 shrink-0'}`}>
                {/* Console Tabs */}
                <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-2 bg-[#111] shrink-0 cursor-pointer" onClick={() => !consoleOpen && setConsoleOpen(true)}>
                    <div className="flex items-center h-full">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setConsoleOpen(true); setActiveConsoleTab("testcases"); }}
                            className={`h-full px-5 text-xs font-display font-bold uppercase tracking-widest transition-all border-b-2 ${activeConsoleTab === "testcases" && consoleOpen ? "border-[#C9963A] text-white bg-[#C9963A]/[0.03]" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
                        >
                            Testcases
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setConsoleOpen(true); setActiveConsoleTab("result"); }}
                            className={`h-full px-5 text-xs font-display font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeConsoleTab === "result" && consoleOpen ? "border-[#C9963A] text-white bg-[#C9963A]/[0.03]" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
                        >
                            Result
                            {(runResult || submitResult) && <span className="w-2 h-2 rounded-full bg-[#C9963A] shadow-[0_0_8px_rgba(201,150,58,0.8)] animate-pulse"></span>}
                        </button>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setConsoleOpen(!consoleOpen); }} 
                        className="text-zinc-500 hover:text-white p-2 mr-2 transition-colors"
                    >
                        <ChevronUp size={16} className={`transition-transform duration-300 ${consoleOpen ? "rotate-180" : ""}`} />
                    </button>
                </div>

                {/* Console Content */}
                {consoleOpen && (
                    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 bg-[#080808]">
                        
                        {/* TESTCASES TAB */}
                        {activeConsoleTab === "testcases" && (
                            <div className="space-y-6">
                                {problem.visibleTestCases?.map((tc, i) => (
                                    <div key={i} className="mb-4">
                                        <p className="font-display font-bold text-white mb-2 text-sm tracking-wide">Case {i + 1}</p>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5">Input</p>
                                                <pre className="font-mono bg-[#111] border border-white/[0.04] p-3 rounded-xl text-sm text-[#E0B455] overflow-x-auto shadow-inner">{tc.input}</pre>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5">Expected Output</p>
                                                <pre className="font-mono bg-[#111] border border-white/[0.04] p-3 rounded-xl text-sm text-emerald-400 overflow-x-auto shadow-inner">{tc.output}</pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* RESULT TAB */}
                        {activeConsoleTab === "result" && (
                            <div className="h-full">
                                {/* RUN CODE RESULTS */}
                                {runResult && !submitResult && (
                                    <div className="space-y-5">
                                        <h3 className="font-display text-xl font-bold text-white mb-4">Run Results</h3>
                                        {runResult.map((res, i) => {
                                            const uiStatus = getRunStatusUI(res.status.id);
                                            const isAccepted = res.status.id === 3;
                                            
                                            return (
                                                <div key={i} className={`p-5 rounded-2xl border shadow-sm ${uiStatus.bg} ${uiStatus.border}`}>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className={`font-sans font-semibold text-sm tracking-wide ${uiStatus.text}`}>
                                                            Case {i + 1}: {uiStatus.label}
                                                        </span>
                                                        <div className="flex gap-3 text-xs font-mono font-medium text-zinc-500">
                                                            <span className="bg-black/20 px-2 py-1 rounded-md">{res.time}s</span>
                                                            <span className="bg-black/20 px-2 py-1 rounded-md">{res.memory} KB</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {!isAccepted && (
                                                        <div className="mt-4 space-y-3">
                                                            {res.expected_output && <div><span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5 block">Expected</span> <pre className="font-mono text-emerald-400 bg-black/40 border border-white/[0.04] p-3 rounded-xl text-sm overflow-x-auto">{res.expected_output}</pre></div>}
                                                            {res.stdout && <div><span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5 block">Your Output</span> <pre className={`font-mono ${uiStatus.text} bg-black/40 border border-white/[0.04] p-3 rounded-xl text-sm overflow-x-auto`}>{res.stdout}</pre></div>}
                                                            {res.compile_output && <div><span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5 block">Compile Error</span> <pre className={`font-mono ${uiStatus.text} bg-black/40 border border-white/[0.04] p-3 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap`}>{res.compile_output}</pre></div>}
                                                            {res.stderr && <div><span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5 block">Runtime Error</span> <pre className={`font-mono ${uiStatus.text} bg-black/40 border border-white/[0.04] p-3 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap`}>{res.stderr}</pre></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* SUBMIT CODE RESULTS */}
                                {submitResult && (
                                    <div className="py-2">
                                        <h2 className={`font-sans text-lg font-semibold tracking-wide mb-4 ${getStatusColor(submitResult.status)}`}>
                                            {submitResult.status}
                                        </h2>
                                        
                                        {/* Hide standard metrics if it's an API error */}
                                        {!submitResult.isApiError && (
                                            <div className="flex flex-wrap gap-3 mb-6">
                                                <div className="px-4 py-2 bg-[#111] border border-white/[0.04] rounded-xl flex items-center gap-2">
                                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Passed</span>
                                                    <span className="font-mono text-white text-sm">{submitResult.testCasesPassed} / {submitResult.testCasesTotal}</span>
                                                </div>
                                                <div className="px-4 py-2 bg-[#111] border border-white/[0.04] rounded-xl flex items-center gap-2">
                                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Runtime</span>
                                                    <span className="font-mono text-white text-sm">{submitResult.runtime} ms</span>
                                                </div>
                                                <div className="px-4 py-2 bg-[#111] border border-white/[0.04] rounded-xl flex items-center gap-2">
                                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Memory</span>
                                                    <span className="font-mono text-white text-sm">{submitResult.memory} KB</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* THE FIX: Render either normal Judge0 error OR the API error string */}
                                        {(submitResult.errorMessege || submitResult.apiErrorMessage) && (
                                            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-2">Error Details</p>
                                                <pre className="font-mono p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap shadow-inner leading-relaxed">
                                                    {submitResult.errorMessege || submitResult.apiErrorMessage}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* EMPTY STATE */}
                                {!runResult && !submitResult && (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 pb-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.02] flex items-center justify-center mb-3 border border-dashed border-white/10">
                                            <Play size={20} className="opacity-40 ml-1" />
                                        </div>
                                        <p className="font-mono text-sm font-medium">Run or submit your code to see results.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-3 shrink-0">
                <button 
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#111] border border-white/[0.06] text-zinc-300 font-bold text-sm hover:text-white hover:bg-white/[0.04] disabled:opacity-50 transition-all"
                >
                    {isRunning ? <span className="loading loading-spinner loading-xs"></span> : <Play size={16} className="fill-current" />}
                    Run
                </button>
                <button 
                    onClick={handleSubmitCode}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold text-sm shadow-[0_0_20px_rgba(201,150,58,0.2)] hover:shadow-[0_0_30px_rgba(201,150,58,0.4)] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : <Send size={16} />}
                    Submit
                </button>
            </div>
        </div>
    );
}

export default RightWorkspace;