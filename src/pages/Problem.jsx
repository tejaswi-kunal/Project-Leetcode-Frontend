import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import Header from "../components/Header";
import PremiumLoader from "../components/PremiumLoader";
import { Search, ChevronDown, Flame, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ThumbsUp } from "lucide-react";

const TAGS = [
    "array","string","hashmap","hashset","linkedList","stack","queue",
    "heap","priorityQueue","tree","binaryTree","binarySearchTree","trie",
    "graph","dfs","bfs","topologicalSort","shortestPath","unionFind",
    "dynamicProgramming","greedy","backtracking","divideAndConquer",
    "binarySearch","twoPointers","slidingWindow","bitManipulation",
    "math","geometry","recursion","sorting","matrix","prefixSum",
    "monotonicStack","gameTheory"
];
 
const DIFFICULTY_STYLE = {
    easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20" },
    medium: { label: "Medium", cls: "text-yellow-400 bg-yellow-400/5 border-yellow-400/20"   },
    hard:   { label: "Hard",   cls: "text-red-400 bg-red-400/5 border-red-400/20"             },
};

// ── Custom Dropdown Component ──
function CustomDropdown({ value, options, onChange, minWidth = "140px", placeholder = "Select..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative shrink-0" style={{ minWidth }} ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-zinc-950 border text-sm font-bold rounded-xl px-4 py-2.5 transition-all duration-300 shadow-sm outline-none ${
                    isOpen 
                    ? "border-[#C9963A]/50 bg-zinc-900 ring-2 ring-[#C9963A]/10" 
                    : "border-zinc-800 hover:bg-zinc-900 hover:border-[#C9963A]/30"
                }`}
            >
                <span className={selectedOption?.colorClass || "text-zinc-300"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[100] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-800/60 ${
                                value === opt.value ? "bg-zinc-900" : ""
                            } ${opt.colorClass || "text-zinc-300"}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── User's Custom Premium Icons ──
const CheckCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M7 12.5l3.5 3.5 7-7" />
    </svg>
);

function Problems() {
    const navigate = useNavigate();
    const LIMIT = 15;
 
    const [listType, setListType]         = useState("all"); 
    const [search, setSearch]             = useState("");
    const [difficulty, setDifficulty]     = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagPanel, setShowTagPanel] = useState(false);
    
    const [sortBy, setSortBy]             = useState("");
    const [sortOrder, setSortOrder]       = useState("desc");
 
    const [page, setPage]                 = useState(1);
    const [total, setTotal]               = useState(0);
    const [totalPages, setTotalPages]     = useState(1);
    const [problems, setProblems]         = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError]     = useState(null);

    const fetchProblems = useCallback(async (currentPage) => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            if (listType === "all") {
                const params = new URLSearchParams();
                if (search)     params.append("search", search);
                if (difficulty) params.append("difficulty", difficulty);
                selectedTags.forEach(t => params.append("tags", t));
                if (sortBy)     params.append("sortBy", sortBy);
                params.append("sortOrder", sortOrder);
                params.append("page", currentPage);
                params.append("limit", LIMIT);
                
                const res = await axiosClient.get(`/problem/filter?${params.toString()}`);
                setProblems(res.data.problems);
                setTotal(res.data.total);
                setTotalPages(res.data.totalPages);
            } 
            else {
                const endpoint = listType === "saved" 
                    ? '/problem/getSavedProblems' 
                    : '/problem/getAllProblemSolvedByUser';
                
                const res = await axiosClient.get(endpoint);
                let filtered = res.data;
                
                if (search) {
                    filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
                }
                if (difficulty) {
                    filtered = filtered.filter(p => p.difficulty === difficulty);
                }
                if (selectedTags.length > 0) {
                    filtered = filtered.filter(p => selectedTags.every(tag => p.tags?.includes(tag)));
                }
                
                if (sortBy) {
                    filtered.sort((a, b) => {
                        let valA = a[sortBy] ?? 0;
                        let valB = b[sortBy] ?? 0;
                        if (sortBy === "createdAt") {
                            valA = new Date(a.createdAt || 0).getTime();
                            valB = new Date(b.createdAt || 0).getTime();
                        }
                        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                        return 0;
                    });
                }
                
                setTotal(filtered.length);
                const calculatedPages = Math.ceil(filtered.length / LIMIT) || 1;
                setTotalPages(calculatedPages); 
                
                const startIndex = (currentPage - 1) * LIMIT;
                setProblems(filtered.slice(startIndex, startIndex + LIMIT));
            }
        } catch (err) {
            setFetchError(err.response?.data || err.message || "Failed to fetch problems");
            setProblems([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setFetchLoading(false);
        }
    }, [listType, search, difficulty, selectedTags, sortBy, sortOrder]);
 
    useEffect(() => {
        setPage(1);
        fetchProblems(1);
    }, [listType, search, difficulty, selectedTags, sortBy, sortOrder, fetchProblems]);
 
    useEffect(() => {
        fetchProblems(page);
    }, [page, fetchProblems]);
 
    const toggleTag = (tag) =>
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
 
    const clearFilters = () => {
        setSearch("");
        setDifficulty("");
        setSelectedTags([]);
        setSortBy("");
        setSortOrder("desc");
        setListType("all");
    };
 
    const acceptanceRate = (p) =>
        p.totalSubmissions
            ? ((p.acceptedSubmissions / p.totalSubmissions) * 100).toFixed(1) + "%"
            : "—";
 
    const hasFilters = search || difficulty || selectedTags.length > 0 || sortBy || listType !== "all";

    if(fetchLoading)
    {
        return <PremiumLoader />
    }
 
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>
 
            <Header />
 
            <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-10">
 
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-2 py-1 rounded-md bg-[#C9963A]/10 border border-[#C9963A]/20 flex items-center justify-center">
                                <Flame size={12} className="text-[#C9963A]" />
                            </div>
                            <p className="font-display text-[#C9963A] text-lg tracking-widest uppercase font-bold">HackForge Practice</p>
                        </div>
                       <h1 className="font-display text-sm font-black text-white tracking-wide">Start practicing and improve your coding skills</h1> 
                    </div>
                </div>
 
                {/* THE FIX: relative z-20 establishes a high stacking context for the filters and dropdowns */}
                <div className="relative z-20 mb-6">
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                            
                            <div className="relative flex-1 min-w-[200px]">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by title..."
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#C9963A]/40 focus:bg-zinc-900 focus:ring-2 focus:ring-[#C9963A]/10 transition-all shadow-sm"
                                />
                            </div>
     
                            <CustomDropdown 
                                value={listType} 
                                onChange={setListType} 
                                minWidth="160px"
                                options={[
                                    { value: "all", label: "All Problems", colorClass: "text-white" },
                                    { value: "solved", label: "Solved", colorClass: "text-white" },
                                    { value: "saved", label: "Saved", colorClass: "text-white" }
                                ]}
                            />

                            <CustomDropdown 
                                value={difficulty} 
                                onChange={setDifficulty} 
                                minWidth="140px"
                                placeholder="All Levels"
                                options={[
                                    { value: "", label: "All Levels", colorClass: "text-white" },
                                    { value: "easy", label: "Easy", colorClass: "text-emerald-400" },
                                    { value: "medium", label: "Medium", colorClass: "text-yellow-400" },
                                    { value: "hard", label: "Hard", colorClass: "text-red-400" }
                                ]}
                            />
        
                            <CustomDropdown 
                                value={sortBy} 
                                onChange={setSortBy} 
                                minWidth="160px"
                                placeholder="Sort By"
                                options={[
                                    { value: "", label: "Sort By", colorClass: "text-white" },
                                    { value: "likes", label: "Most Liked", colorClass: "text-zinc-300" },
                                    { value: "totalSubmissions", label: "Most Attempted", colorClass: "text-zinc-300" },
                                    { value: "acceptedSubmissions", label: "Most Accepted", colorClass: "text-zinc-300" },
                                    { value: "createdAt", label: "Newest", colorClass: "text-zinc-300" }
                                ]}
                            />
        
                            {sortBy && (
                                <button 
                                    onClick={() => setSortOrder(v => v === "asc" ? "desc" : "asc")}
                                    className="shrink-0 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-sm hover:border-[#C9963A]/40 hover:text-white hover:bg-zinc-900 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    {sortOrder === "asc" ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                                    <span className="font-bold">{sortOrder === "asc" ? "ASC" : "DESC"}</span>
                                </button>
                            )}
        
                            <button 
                                onClick={() => setShowTagPanel(v => !v)}
                                className={`shrink-0 px-5 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                                    showTagPanel || selectedTags.length > 0
                                    ? "bg-[#C9963A]/10 border-[#C9963A]/30 text-[#C9963A]"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                                }`}
                            >
                                Tags
                                {selectedTags.length > 0 && (
                                    <span className="bg-[#C9963A] text-zinc-950 text-[10px] px-1.5 py-0.5 rounded-md">
                                        {selectedTags.length}
                                    </span>
                                )}
                            </button>

                            {hasFilters && (
                                <button 
                                    onClick={clearFilters}
                                    className="shrink-0 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-sm hover:text-red-400 hover:border-red-400/30 transition-all duration-200 shadow-sm"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tag Panel (Kept inside the z-20 container so it doesn't get buried) */}
                    {showTagPanel && (
                        <div className="mt-3 p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 flex flex-wrap gap-2 shadow-md backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                            {TAGS.map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                                        selectedTags.includes(tag)
                                            ? "bg-[#C9963A]/15 border-[#C9963A]/40 text-[#C9963A]"
                                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {selectedTags.map(tag => (
                            <span 
                                key={tag}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9963A]/10 border border-[#C9963A]/20 text-[#C9963A] text-xs font-medium shadow-sm"
                            >
                                {tag}
                                <button 
                                    onClick={() => toggleTag(tag)} 
                                    className="hover:text-white hover:bg-[#C9963A]/20 rounded-full p-0.5 transition-colors flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
 
                {/* THE FIX: relative z-10 ensures the table stays strictly below the open dropdowns */}
                <div className="relative z-10 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden shadow-xl backdrop-blur-sm">
                    
                    <div className="grid grid-cols-[60px_1fr_120px_120px_120px_100px] gap-4 px-6 py-5 border-b border-zinc-800/80 bg-zinc-900/60">
                        <div className="font-display text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-center">Status</div>
                        <div className="font-display text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Title</div>
                        <div className="font-display text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Difficulty</div>
                        <div className="font-display text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-right">Acceptance</div>
                        <div className="font-display text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-right">Submissions</div>
                        <div className="font-display text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-right">Likes</div>
                    </div>

                    {fetchError && !fetchLoading && (
                        <div className="flex flex-col items-center justify-center py-32 bg-red-500/5">
                            <p className="font-display text-red-400 font-bold text-lg mb-2">System Error</p>
                            <p className="text-zinc-500 text-sm">{fetchError}</p>
                        </div>
                    )}
 
                    {!fetchLoading && !fetchError && problems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 border-t border-zinc-800/30">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-center mb-4">
                                <Search size={24} className="text-zinc-600" />
                            </div>
                            <p className="font-display text-zinc-300 font-bold text-lg mb-1">No problems found</p>
                            <p className="text-zinc-500 text-sm mb-4">Try adjusting your filters or search term.</p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="px-5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-sm font-bold shadow-sm">
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
 
                    {!fetchLoading && !fetchError && problems.map((problem, idx) => {
                        const diff = DIFFICULTY_STYLE[problem.difficulty] || {};
                        const rowNum = (page - 1) * LIMIT + idx + 1;
                        const isSolvedMark = listType === "solved" || problem.isSolved;
 
                        return (
                            <div
                                key={problem._id}
                                onClick={() => navigate(`/problem/${problem._id}`)}
                                className="grid grid-cols-[60px_1fr_120px_120px_120px_100px] gap-4 px-6 py-4 border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/40 cursor-pointer transition-all duration-200 group relative"
                            >
                                {/* Subtle inner top highlight to make rows feel like pressed cards */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/[0.02] group-hover:bg-white/[0.04]"></div>

                                <div className="flex items-center justify-center relative z-10">
                                    {isSolvedMark ? (
                                        <span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                            <CheckCircleIcon />
                                        </span>
                                    ) : (
                                        <span className="font-mono text-zinc-600 text-xs font-bold group-hover:text-[#C9963A] transition-colors">{rowNum}</span>
                                    )}
                                </div>
 
                                <div className="flex flex-col justify-center min-w-0 relative z-10">
                                    <span className="text-[15px] font-bold text-zinc-200 group-hover:text-white transition-colors truncate mb-1.5">
                                        {problem.title}
                                    </span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {problem.tags?.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-[9px] uppercase tracking-wider font-bold">
                                                {tag}
                                            </span>
                                        ))}
                                        {problem.tags?.length > 3 && (
                                            <span className="px-2 py-0.5 rounded-md text-zinc-600 text-[9px] font-bold bg-zinc-900 border border-zinc-800">+{problem.tags.length - 3}</span>
                                        )}
                                    </div>
                                </div>
 
                                <div className="flex items-center relative z-10">
                                    <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${diff.cls}`}>
                                        {diff.label}
                                    </span>
                                </div>
 
                                <div className="flex items-center justify-end relative z-10">
                                    <span className="font-mono text-zinc-400 text-sm font-medium">{acceptanceRate(problem)}</span>
                                </div>
 
                                <div className="flex items-center justify-end relative z-10">
                                    <span className="font-mono text-zinc-500 text-sm">{problem.totalSubmissions?.toLocaleString() ?? 0}</span>
                                </div>
 
                                <div className="flex items-center justify-end gap-1.5 relative z-10">
                                    <ThumbsUp size={12} className="text-zinc-600 group-hover:text-[#C9963A]/50 transition-colors" />
                                    <span className="font-mono text-zinc-400 text-sm font-medium">{problem.likes ?? 0}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
 
                {!fetchLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 relative z-10">
                        <p className="font-mono text-zinc-500 text-xs">
                            Showing <span className="text-zinc-300">{(page - 1) * LIMIT + 1}</span> to <span className="text-zinc-300">{Math.min(page * LIMIT, total)}</span> of <span className="text-zinc-300">{total}</span>
                        </p>
                        
                        <div className="flex items-center gap-2 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-800/80 shadow-sm backdrop-blur-sm">
                            <button
                                onClick={() => setPage(v => Math.max(1, v - 1))}
                                disabled={page === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ArrowLeft size={16} />
                            </button>
 
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let p;
                                    if (totalPages <= 5)             p = i + 1;
                                    else if (page <= 3)              p = i + 1;
                                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                    else                             p = page - 2 + i;
                                    
                                    return (
                                        <button 
                                            key={p} 
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-xl font-display font-bold text-sm transition-all duration-300 ${
                                                page === p
                                                ? "bg-[#C9963A] text-zinc-950 shadow-[0_0_15px_rgba(201,150,58,0.3)]"
                                                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
 
                            <button
                                onClick={() => setPage(v => Math.min(totalPages, v + 1))}
                                disabled={page === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
 
export default Problems;