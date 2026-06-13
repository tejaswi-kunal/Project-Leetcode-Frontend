import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom"; // Keeps the tooltip working perfectly
import { useParams, useNavigate } from "react-router";
import Header from "../components/Header";
import ProfileSidebar from "../components/ProfileSidebar";
import axiosClient from "../utils/axiosClient";
import { Activity, Lock } from "lucide-react";
import { motion } from 'framer-motion';
import PremiumLoader from "../components/PremiumLoader";

const CustomHeatmap = ({ activityCalendar }) => {
    const [tooltip, setTooltip] = useState(null);
    const scrollContainerRef = useRef(null);

    const heatmapData = useMemo(() => {
        const data = [];
        const today = new Date();
        const activityMap = new Map();
        (activityCalendar || []).forEach(day => activityMap.set(day.date, day.count));

        for (let i = 365; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = activityMap.get(dateStr) || 0;
            let level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;

            const monthName = d.toLocaleString('en-US', { month: 'short' });
            const year = d.getFullYear();
            const monthKey = `${monthName} ${year}`;

            let monthGroup = data.find(m => m.id === monthKey);
            if (!monthGroup) {
                monthGroup = { id: monthKey, name: monthName, days: [] };
                data.push(monthGroup);
            }
            monthGroup.days.push({
                date: dateStr, count, level,
                displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
        return data;
    }, [activityCalendar]);

    useEffect(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }, [heatmapData]);

    const getBgColor = (level) => {
        switch(level) {
            case 1: return 'bg-emerald-900 border border-emerald-800/50';
            case 2: return 'bg-emerald-700 border border-emerald-600/50';
            case 3: return 'bg-emerald-500 border border-emerald-400/50';
            case 4: return 'bg-emerald-400 border border-emerald-300/50 shadow-[0_0_10px_rgba(52,211,153,0.4)]';
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
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-900"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-700"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-400"></div>
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

// --- Upgraded Public Profile Page ---
function PublicProfile() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [publicUser, setPublicUser] = useState(null);
    const [rank, setRank] = useState(null);
    const [problemStats, setProblemStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    axiosClient.get(`/auth/getPublicProfile/${id}`),
                    axiosClient.get('/problem/getProblemStats')
                ]);

                setPublicUser(profileRes.data.user);
                setRank(profileRes.data.rank);
                setProblemStats(statsRes.data);
            } catch (err) {
                console.error("Error fetching public profile", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPublicData();
    }, [id]);

    if (loading) 
    {
        return <PremiumLoader />
    }
    
    if (error || !publicUser) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col items-center justify-center font-sans">
                <h1 className="font-display text-4xl font-bold text-white mb-4 tracking-wide">User Not Found</h1>
                <p className="text-zinc-500 mb-8 font-medium">This profile doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/leaderboard')} className="px-6 py-3 bg-[#C9963A] text-black font-bold rounded-xl hover:bg-[#E0B455] transition-colors shadow-lg shadow-[#C9963A]/20">
                    Return to Leaderboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 pb-12 font-sans relative selection:bg-[#C9963A] selection:text-black">
            
            {/* Glowing Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mt-10 flex flex-col lg:flex-row gap-8">
                
                <div className="w-full lg:w-[320px] shrink-0">
                    <ProfileSidebar user={publicUser} rank={rank} stats={problemStats} />
                </div>

                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* Activity Heatmap */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
                        <h3 className="font-display font-bold text-white mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" /> Activity Graph
                        </h3>
                        <CustomHeatmap activityCalendar={publicUser.activityCalendar} />
                    </motion.div>

                    {/* Privacy Banner */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, type: "spring" }} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-12 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center text-center flex-1">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 shadow-inner">
                            <Lock size={24} className="text-zinc-600" />
                        </div>
                        <h3 className="font-display text-white font-bold text-xl tracking-wide mb-3">Recent Submissions are Private</h3>
                        <p className="text-zinc-500 text-sm max-w-md leading-relaxed font-medium">To ensure competitive integrity and prevent code plagiarism, recent submissions and code history are strictly restricted to the account owner.</p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

export default PublicProfile;