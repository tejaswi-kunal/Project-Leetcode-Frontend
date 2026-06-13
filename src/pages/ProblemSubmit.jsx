import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import Header from "../components/Header";
import LeftWorkspace from "../components/LeftWorkspace";
import RightWorkspace from "../components/RightWorkspace";
import PremiumLoader from "../components/PremiumLoader";

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

function ProblemSubmit() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data States
    const [problem, setProblem] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingProblem, setLoadingProblem] = useState(true);

    // Workspace Coordination States
    const [activeTab, setActiveTab] = useState("description"); 
    const [consoleOpen, setConsoleOpen] = useState(true);
    const [activeConsoleTab, setActiveConsoleTab] = useState("testcases"); 
    
    // Editor States
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(DEFAULT_CODE["cpp"]);
    
    // Execution States
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);

    // Fetch Problem & Submissions
    useEffect(() => {
        const fetchProblemData = async () => {
            setLoadingProblem(true);
            try {
                const probRes = await axiosClient.get(`/problem/getProblem/${id}`);
                const fetchedProblem = probRes.data;
                setProblem(fetchedProblem);
                
                // Initialize Editor with DB Starter Code
                // by default we are keeping cpp as our default language when the problem opens
                let initialLang = "cpp";
                setLanguage(initialLang);
                // finding the intial code 
                const dbStarter = fetchedProblem.starterCode?.find(s => s.language === initialLang);
                setCode(dbStarter ? dbStarter.initialCode : DEFAULT_CODE[initialLang]);

                // fetching the past submissions of the user
                const subRes = await axiosClient.get(`/problem/getSubmissions/${id}`);
                setSubmissions(subRes.data);
            } catch (err) {
                console.error("Failed to fetch problem data", err);
            } finally {
                setLoadingProblem(false);
            }
        };
        fetchProblemData();
    }, [id]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        const dbStarter = problem?.starterCode?.find(s => s.language === newLang);
        setCode(dbStarter ? dbStarter.initialCode : DEFAULT_CODE[newLang]);
    };

    const handleResetCode = () => {
        const dbStarter = problem?.starterCode?.find(s => s.language === language);
        setCode(dbStarter ? dbStarter.initialCode : DEFAULT_CODE[language]);
        setRunResult(null); 
        setSubmitResult(null);
    };

    // code run
    const handleRunCode = async () => {
        if (!code.trim()) return;
        setIsRunning(true);
        setConsoleOpen(true);
        setActiveConsoleTab("result");
        setRunResult(null);
        setSubmitResult(null); 

        try {
            const res = await axiosClient.post(`/submission/runCode/${id}`, { language, code });
            setRunResult(res.data);
        } catch (err) {
            console.error(err);
            setRunResult([{ status: { id: 13, description: "Internal Error" }, stderr: "Failed to run code." }]);
        } finally {
            setIsRunning(false);
        }
    };

    // submit code
    const handleSubmitCode = async () => {
        if (!code.trim()) return;
        setIsSubmitting(true);
        setConsoleOpen(true);
        setActiveConsoleTab("result");
        setRunResult(null);
        setSubmitResult(null);

        try {
            const res = await axiosClient.post(`/submission/submitCode/${id}`, { language, code });
            setSubmitResult(res.data);
            
            // Refetch submissions & shift UI to show them
            const subRes = await axiosClient.get(`/problem/getSubmissions/${id}`);
            setSubmissions(subRes.data);

            // NEW: Refetch Problem data to update Submit Count and Acceptance Rate live-->Important
            const probRes = await axiosClient.get(`/problem/getProblem/${id}`);
            setProblem(probRes.data);

            setActiveTab("submissions");
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

    if (loadingProblem)
    { 
        return <PremiumLoader />
    }
    if (!problem) return <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white"><h2 className="text-2xl font-bold text-red-400 mb-2">Problem Not Found</h2><button onClick={() => navigate('/problems')} className="text-[#C9963A] hover:underline">Go back to problems</button></div>;

    return (
        <div className="h-screen flex flex-col bg-[#080808] text-white overflow-hidden">
            <Header />
            <div className="flex-1 flex gap-4 p-4 min-h-0 relative z-10">
                <LeftWorkspace 
                    problem={problem} 
                    submissions={submissions}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <RightWorkspace 
                    problem={problem}
                    languages={LANGUAGES}
                    language={language}
                    code={code}
                    setCode={setCode}
                    handleLanguageChange={handleLanguageChange}
                    handleResetCode={handleResetCode}
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
        </div>
    );
}

export default ProblemSubmit;