import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Header from "../components/Header";
import ProfileSidebar from "../components/ProfileSidebar";
import axiosClient from "../utils/axiosClient";
import { X, Activity, TrendingUp, ChevronLeft, ChevronRight, Code2, Clock, Cpu } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import PremiumLoader from "../components/PremiumLoader";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

// --- OPTION A FIX: Strict Global UTC Date Generator ---
const getUTCDateString = (dateObj) => {
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CustomHeatmap = ({ activityCalendar }) => {
    const [tooltip, setTooltip] = useState(null);
    const scrollContainerRef = useRef(null);

    const heatmapData = useMemo(() => {
        const data = [];
        const today = new Date();
        const activityMap = new Map();
        
        (activityCalendar || []).forEach(day => activityMap.set(day.date, day.count));

        for (let i = 365; i >= 0; i--) {
            // OPTION A FIX: Safely calculate the past dates in strict UTC
            const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
            const dateStr = getUTCDateString(d); 
            
            const count = activityMap.get(dateStr) || 0;
            let level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;

            // Display formatting forced to UTC
            const monthName = d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' });
            const year = d.getUTCFullYear();
            const monthKey = `${monthName} ${year}`;

            let monthGroup = data.find(m => m.id === monthKey);
            if (!monthGroup) {
                monthGroup = { id: monthKey, name: monthName, days: [] };
                data.push(monthGroup);
            }
            monthGroup.days.push({
                date: dateStr,
                count,
                level,
                displayDate: d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
        return data;
    }, [activityCalendar]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [heatmapData]);

    const getBgColor = (level) => {
        switch(level) {
            case 1: return 'bg-[#0e4429] border border-[#0e4429]';
            case 2: return 'bg-[#006d32] border border-[#006d32]';
            case 3: return 'bg-[#26a641] border border-[#26a641]';
            case 4: return 'bg-[#39d353] border border-[#39d353]';
            default: return 'bg-zinc-800/50 border border-zinc-700/50'; 
        }
    };

    return (
        <div className="relative w-full">
            <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent scroll-smooth">
                {heatmapData.map((month) => (
                    <div key={month.id} className="flex flex-col gap-2.5 shrink-0">
                        <span className="font-display text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">{month.name}</span>
                        <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                            {month.days.map((day, idx) => (
                                <div
                                    key={idx}
                                    onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${day.count} submissions on ${day.displayDate}` })}
                                    onMouseLeave={() => setTooltip(null)}
                                    className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer hover:ring-2 hover:ring-white/50 transition-all duration-200 ${getBgColor(day.level)}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mt-4 font-display text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">
                <span>Less</span>
                <div className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-zinc-800/50 border border-zinc-700/50"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#0e4429]"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#006d32]"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#26a641]"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#39d353]"></div>
                </div>
                <span>More</span>
            </div>

            {tooltip && typeof document !== 'undefined' && createPortal(
                <div className="fixed z-[9999] bg-zinc-900 border border-zinc-700 text-white font-mono text-[11px] font-semibold px-3 py-2 rounded-lg shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-[130%]" style={{ top: tooltip.y, left: tooltip.x }}>
                    {tooltip.text}
                </div>,
                document.body
            )}
        </div>
    );
};


function Profile() {
    const [userData, setUserData] = useState(null);
    const [rank, setRank] = useState(null);
    const [problemStats, setProblemStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState(null);

    const [trendSubmissions, setTrendSubmissions] = useState([]); 
    const [listSubmissions, setListSubmissions] = useState([]);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [accRes, graphRes, statsRes] = await Promise.all([
                    axiosClient.get('/auth/getAccount'),
                    axiosClient.get('/auth/getUserSubmissions?limit=50'),
                    axiosClient.get('/problem/getProblemStats')
                ]);

                setUserData(accRes.data.user);
                setRank(accRes.data.rank);
                setTrendSubmissions(graphRes.data.submissions);
                setProblemStats(statsRes.data);
            } catch (err) {
                console.error("Error fetching initial profile data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchPaginatedList = async () => {
            try {
                const res = await axiosClient.get(`/auth/getUserSubmissions?page=${page}&limit=10`);
                setListSubmissions(res.data.submissions);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error("Error fetching paginated submissions", err);
            }
        };
        fetchPaginatedList();
    }, [page]);

    const trendData = useMemo(() => {
        const data = [];
        const today = new Date();
        for(let i = 6; i >= 0; i--) {
            // OPTION A FIX: Safely generate the UTC date for the trend charts
            const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
            const dateStr = getUTCDateString(d); 
            
            // Force display day to map to UTC so it visually aligns with the data
            const displayDay = d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
            
            // Filter submissions by converting their `createdAt` timestamps to UTC date strings
            const dailySubs = trendSubmissions.filter(sub => {
                const subDate = new Date(sub.createdAt);
                return getUTCDateString(subDate) === dateStr;
            });

            const accepted = dailySubs.filter(sub => sub.status === 'Accepted').length;
            
            data.push({ name: displayDay, total: dailySubs.length, accepted: accepted });
        }
        return data;
    }, [trendSubmissions]);

    const ratingData = useMemo(() => {
        const currentRating = userData?.rating || 1200;
        return [
            { name: 'Contest 1', rating: currentRating - 150 },
            { name: 'Contest 2', rating: currentRating - 80 },
            { name: 'Contest 3', rating: currentRating - 120 },
            { name: 'Contest 4', rating: currentRating - 50 },
            { name: 'Contest 5', rating: currentRating + 30 },
            { name: 'Contest 6', rating: currentRating }
        ];
    }, [userData]);

    if (loading) 
    {
        return <PremiumLoader />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 pb-12 font-sans relative selection:bg-[#C9963A] selection:text-black">
            
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mt-10 flex flex-col lg:flex-row gap-8">
                
                <div className="w-full lg:w-[320px] shrink-0">
                    <ProfileSidebar user={userData} rank={rank} stats={problemStats} />
                </div>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* Rating Graph */}
                    <motion.div variants={itemVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-sm h-[320px] flex flex-col hover:border-[#C9963A]/30 transition-all duration-300">
                        <h3 className="font-display font-bold text-white mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#C9963A]" /> Rating History
                        </h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ratingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C9963A" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#C9963A" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                    <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} />
                                    <YAxis domain={['auto', 'auto']} stroke="#555" tick={{fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} />
                                    <RechartsTooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px', color: '#fff', fontFamily: 'JetBrains Mono, monospace'}} itemStyle={{color: '#C9963A', fontWeight: 'bold'}} />
                                    <Area type="monotone" dataKey="rating" stroke="#C9963A" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Heatmap */}
                    <motion.div variants={itemVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
                        <h3 className="font-display font-bold text-white mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" /> Activity Graph
                        </h3>
                        <CustomHeatmap activityCalendar={userData?.activityCalendar} />
                    </motion.div>

                    {/* 7-Day Trend Graphs */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-sm h-[300px] flex flex-col hover:border-blue-500/30 transition-all duration-300">
                            <h3 className="font-display font-bold text-white mb-6 text-[11px] uppercase tracking-widest">7-Day Submissions</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ left: -25 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#555" tick={{fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <RechartsTooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace'}} />
                                        <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-sm h-[300px] flex flex-col hover:border-emerald-500/30 transition-all duration-300">
                            <h3 className="font-display font-bold text-white mb-6 text-[11px] uppercase tracking-widest">7-Day Accepted</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ left: -25 }}>
                                        <defs>
                                            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#555" tick={{fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono, monospace'}} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <RechartsTooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace'}} />
                                        <Area type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* Paginated Submissions List */}
                    <motion.div variants={itemVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl shadow-xl backdrop-blur-sm overflow-hidden flex-1 transition-colors duration-300">
                        <div className="px-7 py-5 border-b border-zinc-800/80 bg-zinc-900/60 flex justify-between items-center">
                            <h3 className="font-display font-bold text-white text-[11px] uppercase tracking-widest">Recent Submissions</h3>
                        </div>
                        
                        <div className="p-6">
                            {listSubmissions.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center py-10 font-medium">No recent submissions found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {listSubmissions.map((sub) => (
                                        <motion.div whileHover={{ scale: 1.01 }} key={sub._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl hover:bg-zinc-800/60 hover:border-zinc-700 transition-all duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sub.status === 'Accepted' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                                                <span className="font-bold text-zinc-200 group-hover:text-white transition-colors text-sm truncate max-w-[180px] sm:max-w-[280px]">
                                                    {sub.problem?.title || "Unknown Problem"}
                                                </span>
                                                {sub.problem?.difficulty && (
                                                    <span className={`text-[9px] px-2.5 py-0.5 rounded-md font-bold tracking-widest uppercase ml-2 border ${
                                                        sub.problem.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                                        sub.problem.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 
                                                        'text-red-400 bg-red-400/10 border-red-400/20'
                                                    }`}>
                                                        {sub.problem.difficulty}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-5 mt-4 sm:mt-0 ml-6 sm:ml-0">
                                                <span className="text-zinc-400 font-mono text-xs uppercase font-bold tracking-wider bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                                                    {sub.submittedCode?.language}
                                                </span>
                                                <span className="text-zinc-500 font-mono text-xs font-semibold">
                                                    {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <button 
                                                    onClick={() => setSelectedCode(sub)} 
                                                    className="flex items-center gap-1.5 text-[#C9963A] font-bold text-xs hover:text-[#E0B455] hover:bg-[#C9963A]/10 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    <Code2 size={14} /> View
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    Page <span className="text-white mx-1">{page}</span> of <span className="text-white mx-1">{totalPages}</span>
                                </span>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Premium Code Viewer Modal */}
            {selectedCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-zinc-950 border border-zinc-800/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
                            <div>
                                <h3 className="font-display font-bold text-2xl text-white tracking-wide">{selectedCode.problem?.title}</h3>
                                
                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                    <span className={`font-display font-bold text-sm uppercase tracking-widest ${selectedCode.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {selectedCode.status}
                                    </span>
                                    
                                    <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                                    <span className="text-zinc-400 font-mono text-xs uppercase font-bold tracking-wider bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg">
                                        {selectedCode.submittedCode?.language}
                                    </span>

                                    {selectedCode.runtime !== undefined && selectedCode.runtime !== null && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                                            <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-sm">
                                                <Clock size={14} className="text-[#C9963A]" /> {selectedCode.runtime} ms
                                            </span>
                                        </>
                                    )}

                                    {selectedCode.memory !== undefined && selectedCode.memory !== null && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                                            <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-sm">
                                                <Cpu size={14} className="text-[#C9963A]" /> {selectedCode.memory} KB
                                            </span>
                                        </>
                                    )}
                                </div>

                            </div>
                            <button 
                                onClick={() => setSelectedCode(null)} 
                                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-[#C9963A]/40 transition-all shadow-sm self-start"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 bg-[#0a0a0a] overflow-y-auto flex-1 custom-scrollbar">
                            <pre className="font-mono text-[13px] text-[#E0B455] whitespace-pre-wrap leading-relaxed">
                                {selectedCode.submittedCode?.completeCode}
                            </pre>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default Profile;