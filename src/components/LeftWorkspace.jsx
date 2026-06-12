import DescriptionTab from "./DescriptionTab";
import EditorialTab from "./EditorialTab";
import SolutionsTab from "./SolutionsTab";
import SubmissionsTab from "./SubmissionsTab";
import CommentsTab from "./CommentsTab";
import { FileText, BookOpen, Code2, History, MessageSquare } from "lucide-react"; // NEW: Premium Icons

function LeftWorkspace({ problem, submissions, activeTab, setActiveTab }) {
    // Structured tabs array for cleaner rendering and automatic icon mapping
    const tabs = [
        { id: "description", label: "Description", icon: FileText },
        { id: "editorial", label: "Editorial", icon: BookOpen },
        { id: "solutions", label: "Solutions", icon: Code2 },
        { id: "submissions", label: "Submissions", icon: History },
        { id: "discuss", label: "Discuss", icon: MessageSquare },
    ];

    return (
        <div className="w-1/2 flex flex-col bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl relative z-10">
            
            {/* Premium Tabs Navigation */}
            <div className="flex bg-[#111] border-b border-white/[0.06] overflow-x-auto no-scrollbar shrink-0">
                {tabs.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            // APPLIED font-display and flex layout for icons
                            className={`flex items-center gap-2 px-5 py-3.5 text-[11px] font-display font-bold uppercase tracking-widest border-b-2 transition-all duration-300 whitespace-nowrap
                                ${isActive 
                                    ? "border-[#C9963A] text-[#C9963A] bg-[#C9963A]/[0.03]" 
                                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                                }`}
                        >
                            <Icon size={14} className={isActive ? "text-[#C9963A]" : "text-zinc-600"} />
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Rendering */}
            {/* Passing The Props To The Tabs */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {activeTab === "description" && <DescriptionTab problem={problem} />}
                {activeTab === "editorial" && <EditorialTab problem={problem}/>}
                {activeTab === "solutions" && <SolutionsTab problem={problem} />}
                {activeTab === "submissions" && <SubmissionsTab submissions={submissions} />}
                {activeTab === "discuss" && <CommentsTab problemId={problem._id} />}
            </div>
        </div>
    );
}

export default LeftWorkspace;