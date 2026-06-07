import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import ContestHeader from "../components/ContestHeader";
import ContestDescriptionTab from "../components/ContestDescriptionTab";
import RightWorkspace from "../components/RightWorkspace"; 
import SubmissionsTab from "../components/SubmissionsTab"; 
import { X, CheckCircle2, Target, FileText, History } from "lucide-react"; // NEW ICONS ADDED
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
    { id: "cpp", name: "C++" },
    { id: "java", name: "Java" },
    { id: "python", name: "Python" },
    { id: "javascript", name: "JavaScript" },
];

const DEFAULT_CODE = {
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    java: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
    python: "def solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()",
    javascript: "function solve() {\n    // Write your code here\n}\n\nsolve();",
};

function ContestWorkspace() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [activeProblem, setActiveProblem] = useState(null);
    const [solvedProblemIds, setSolvedProblemIds] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    
    // UI States
    const [activeTab, setActiveTab] = useState("description");
    const [panelOpen, setPanelOpen] = useState('problems');
    
    // Editor States
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(DEFAULT_CODE["cpp"]);
    const [consoleOpen, setConsoleOpen] = useState(true);
    const [activeConsoleTab, setActiveConsoleTab] = useState("testcases"); 
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);

    useEffect(() => {
        const initContest = async () => {
            try {
                const enterRes = await axiosClient.get(`/contest/enterContest/${id}`);
                const contestData = enterRes.data.contest;
                setContest(contestData);
                
                const rankRes = await axiosClient.get(`/contest/myRank/${id}`);
                setSolvedProblemIds(rankRes.data.user?.solvedProblems || []);

                if (contestData.problems?.length > 0) {
                    loadProblem(contestData.problems[0].problemID);
                }
            } catch (err) {
                console.error(err);
                alert("Cannot enter contest. Please register first or ensure it is running.");
                window.close();
            }
        };
        initContest();
    }, [id]);

    const loadProblem = async (problemID) => {
        try {
            setActiveProblem(null);
            const probRes = await axiosClient.get(`/problem/getProblem/${problemID}`);
            setActiveProblem(probRes.data);
            
            const subRes = await axiosClient.get(`/problem/getSubmissions/${problemID}`);
            setSubmissions(subRes.data);

            const dbStarter = probRes.data.starterCode?.find(s => s.language === language);
            setCode(dbStarter ? dbStarter.initialCode : DEFAULT_CODE[language]);
            
            setActiveTab("description");
            setPanelOpen(null);
            setSubmitResult(null);
            setRunResult(null);
        } catch (err) {
            console.error("Failed to load problem", err);
        }
    };

    const handleSubmitCode = async () => {
        if (!code.trim() || !activeProblem) return;
        setIsSubmitting(true);
        setConsoleOpen(true);
        setActiveConsoleTab("result");

        try {
            const res = await axiosClient.post(`/submission/submitCode/${activeProblem._id}`, { 
                language, code, contestID: id 
            });
            setSubmitResult(res.data);
            
            const subRes = await axiosClient.get(`/problem/getSubmissions/${activeProblem._id}`);
            setSubmissions(subRes.data);
            setActiveTab("submissions");

            if (res.data.status === "Accepted") {
                const rankRes = await axiosClient.get(`/contest/myRank/${id}`);
                setSolvedProblemIds(rankRes.data.user?.solvedProblems || []);
            }
        } catch (err) {
            console.error("Submission Error:", err);
            
            if (err.response) {
                let backendMsg = err.response.data;

                // Failsafe: If Express hard-crashes, it sends HTML. This prevents ugly UI.
                if (typeof backendMsg !== 'string' || backendMsg.includes('<html')) {
                    backendMsg = "An unexpected server error occurred.";
                }

                if (err.response.status === 429) {
                    setSubmitResult({ 
                        isApiError: true, 
                        status: "Rate Limit Exceeded", 
                        apiErrorMessage: backendMsg 
                    });
                } else {
                    setSubmitResult({ 
                        isApiError: true, 
                        status: "Request Error", 
                        apiErrorMessage: backendMsg 
                    });
                }
                } else {
                // Failsafe for complete network failure (backend is off)
                setSubmitResult({ 
                    isApiError: true, 
                    status: "Network Error", 
                    apiErrorMessage: "Could not reach the server." 
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRunCode = async () => {
        if (!code.trim() || !activeProblem) return;
        setIsRunning(true);
        setConsoleOpen(true);
        setActiveConsoleTab("result");

        try {
            const res = await axiosClient.post(`/submission/runCode/${activeProblem._id}`, { language, code });
            setRunResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsRunning(false);
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        const dbStarter = activeProblem?.starterCode?.find(s => s.language === newLang);
        setCode(dbStarter ? dbStarter.initialCode : DEFAULT_CODE[newLang]);
    };

    if (!contest) return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-[#C9963A]"></span>
        </div>
    );

    const currentPoints = contest.problems?.find(p => p.problemID === activeProblem?._id)?.points;

    return (
        <div className="h-screen flex flex-col bg-[#080808] text-white overflow-hidden relative">
            
            <ContestHeader contest={contest} onOpenPanel={setPanelOpen} />
            
            <div className="flex-1 flex gap-2 p-2 min-h-0 relative z-10 bg-black">
                
                {!activeProblem ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] border border-white/[0.06] rounded-xl">
                        <span className="loading loading-spinner loading-md text-[#C9963A] mb-4"></span>
                        <p className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">Preparing Workspace...</p>
                    </div>
                ) : (
                    <>
                        {/* ── LEFT PANEL ── */}
                        <div className="flex-1 min-w-0 flex flex-col bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                            
                            {/* PREMIUM TAB BAR */}
                            <div className="flex items-center gap-2 px-2 border-b border-white/[0.06] shrink-0 bg-[#0a0a0a]">
                                <button
                                    onClick={() => setActiveTab("description")}
                                    className={`flex items-center gap-2 px-5 py-3.5 font-display text-xs font-bold tracking-widest uppercase transition-all border-b-2 -mb-px ${
                                        activeTab === "description"
                                            ? "border-[#C9963A] text-[#C9963A] bg-[#C9963A]/[0.02]"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                                    }`}
                                >
                                    <FileText size={16} /> Description
                                </button>
                                <button
                                    onClick={() => setActiveTab("submissions")}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-display font-bold tracking-widest uppercase transition-all border-b-2 -mb-px ${
                                        activeTab === "submissions"
                                            ? "border-[#C9963A] text-[#C9963A] bg-[#C9963A]/[0.02]"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                                    }`}
                                >
                                    <History size={16} /> Submissions
                                </button>
                            </div>

                            {/* Content area */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0a0a0a]">
                                {activeTab === "description" ? (
                                    <ContestDescriptionTab problem={activeProblem} contestPoints={currentPoints} />
                                ) : (
                                    <SubmissionsTab submissions={submissions} />
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT PANEL (Code Editor) ── */}
                        <div className="flex-1 min-w-0 h-full flex flex-col rounded-xl overflow-hidden">
                            <RightWorkspace 
                                problem={activeProblem}
                                languages={LANGUAGES}
                                language={language}
                                code={code}
                                setCode={setCode}
                                handleLanguageChange={handleLanguageChange}
                                runResult={runResult}
                                submitResult={submitResult}
                                isRunning={isRunning}
                                isSubmitting={isSubmitting}
                                handleRunCode={handleRunCode}
                                handleSubmitCode={handleSubmitCode}
                                consoleOpen={consoleOpen}
                                setConsoleOpen={setConsoleOpen}
                                activeConsoleTab={activeConsoleTab}
                                setActiveConsoleTab={setActiveConsoleTab}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* ── OVERLAY PANEL: Problem List & Rankings ── */}
            <AnimatePresence>
                {panelOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-start"
                        onClick={() => setPanelOpen(null)}
                    >
                        <motion.div 
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-[450px] h-full bg-[#0a0a0a] border-r border-white/[0.06] shadow-[20px_0_40px_rgba(0,0,0,0.8)] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0 bg-black/40">
                                <h2 className="font-display font-bold text-lg text-white uppercase tracking-widest">
                                    {panelOpen === 'problems' ? 'Problem List' : 'Live Rankings'}
                                </h2>
                                <button
                                    onClick={() => setPanelOpen(null)}
                                    className="p-2 bg-white/[0.05] rounded-xl text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                                >
                                    <X size={18}/>
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {panelOpen === 'problems' && (
                                    <div className="space-y-2">
                                        {contest.problems.map((p, idx) => {
                                            const isSolved = solvedProblemIds.includes(p.problemID);
                                            return (
                                                <button 
                                                    key={p.problemID}
                                                    onClick={() => loadProblem(p.problemID)}
                                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                                        activeProblem?._id === p.problemID
                                                            ? 'bg-[#222] border-[#C9963A]/40'
                                                            : 'bg-black/20 border-white/[0.06] hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner ${
                                                            isSolved
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
                                                        }`}>
                                                            {isSolved ? <CheckCircle2 size={16}/> : `Q${idx + 1}`}
                                                        </div>
                                                        <span className="font-bold text-sm text-zinc-200">Problem {idx + 1}</span>
                                                    </div>
                                                    <span className="font-mono text-xs font-bold text-[#C9963A] bg-black/60 px-2.5 py-1 rounded-lg border border-white/5">
                                                        {p.points} pt
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {panelOpen === 'ranking' && (
                                    <div className="text-center py-10 text-zinc-500 flex flex-col items-center">
                                        <Target size={40} className="mb-4 opacity-20" />
                                        <p className="font-display font-bold text-sm tracking-wide">Leaderboard is active.</p>
                                        <button 
                                            onClick={() => window.open(`/contest/${id}/leaderboard`, '_blank')}
                                            className="mt-6 px-6 py-2 bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                            Open Full Leaderboard
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default ContestWorkspace;