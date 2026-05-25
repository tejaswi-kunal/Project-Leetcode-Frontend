import DescriptionTab from "./DescriptionTab";
import EditorialTab from "./EditorialTab";
import SolutionsTab from "./SolutionsTab";
import SubmissionsTab from "./SubmissionsTab";

function LeftWorkspace({ problem, submissions, activeTab, setActiveTab }) {
    return (
        <div className="w-1/2 flex flex-col bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
            {/* Tabs Navigation */}
            <div className="flex bg-[#111] border-b border-white/[0.07] px-2 overflow-x-auto no-scrollbar shrink-0">
                {["description", "editorial", "solutions", "submissions"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap
                            ${activeTab === tab 
                                ? "border-[#C9963A] text-[#C9963A]" 
                                : "border-transparent text-zinc-500 hover:text-white"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content Rendering */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {activeTab === "description" && <DescriptionTab problem={problem} />}
                {activeTab === "editorial" && <EditorialTab />}
                {activeTab === "solutions" && <SolutionsTab problem={problem} />}
                {activeTab === "submissions" && <SubmissionsTab submissions={submissions} />}
            </div>
        </div>
    );
}

export default LeftWorkspace;