import { useState } from "react";

const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
);

function SubmissionsTab({ submissions }) {
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const getStatusColor = (status) => {
        if (status === "Accepted") return "text-emerald-400";
        if (status === "Pending" || status === "Processing") return "text-yellow-400";
        return "text-red-400";
    };

    if (selectedSubmission) {
        return (
            <div className="space-y-6">
                <button 
                    onClick={() => setSelectedSubmission(null)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                    <BackIcon /> Back to Submissions
                </button>
                
                <div className="p-5 rounded-xl border border-white/10 bg-[#111]">
                    <h2 className={`text-xl font-bold mb-4 ${getStatusColor(selectedSubmission.status)}`}>
                        {selectedSubmission.status}
                    </h2>
                    <div className="flex flex-wrap gap-6 mb-6">
                        <div>
                            <p className="text-zinc-500 text-xs">Language</p>
                            <p className="font-semibold">{selectedSubmission.submittedCode?.language}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 text-xs">Runtime</p>
                            <p className="font-semibold">{selectedSubmission.runtime} ms</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 text-xs">Memory</p>
                            <p className="font-semibold">{selectedSubmission.memory} KB</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 text-xs">Test Cases</p>
                            <p className="font-semibold">{selectedSubmission.testCasesPassed} / {selectedSubmission.testCasesTotal}</p>
                        </div>
                    </div>

                    {selectedSubmission.errorMessege && (
                        <div className="mb-6">
                            <p className="text-red-400 text-xs mb-1 font-semibold">Error / Output</p>
                            <pre className="p-3 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg text-sm overflow-x-auto">
                                {selectedSubmission.errorMessege}
                            </pre>
                        </div>
                    )}

                    <div>
                        <p className="text-zinc-500 text-xs mb-2">Submitted Code</p>
                        <pre className="p-4 bg-black border border-white/10 rounded-lg text-sm text-zinc-300 overflow-x-auto">
                            {selectedSubmission.submittedCode?.completeCode}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p>You haven't submitted any code yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {submissions.map((sub) => (
                        <div 
                            key={sub._id} 
                            onClick={() => setSelectedSubmission(sub)}
                            className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors"
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`font-semibold text-sm ${getStatusColor(sub.status)}`}>
                                    {sub.status}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {new Date(sub.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                <span className="px-2 py-1 rounded bg-[#111]">{sub.submittedCode.language}</span>
                                <span>{sub.runtime} ms</span>
                                <span>{sub.memory} KB</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SubmissionsTab;