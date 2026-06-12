import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import axiosClient from "../utils/axiosClient";
import { Trophy, Medal, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";

// 1. IMPORT YOUR BACKGROUND IMAGE
import bgImage from '../assets/premium-bg.jpg'; 

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};
 
function Leaderboard() {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUserStats, setCurrentUserStats] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoading(true);
            try {
                const [leaderboardRes, accountRes] = await Promise.all([
                    axiosClient.get(`/leaderboard/getLeaderboard?page=${page}&limit=${limit}`),
                    axiosClient.get('/auth/getAccount')
                ]);

                setLeaderboard(leaderboardRes.data.users || []);
                setCurrentUserStats({
                    user: accountRes.data.user,
                    rank: accountRes.data.rank
                });
            } catch (err) {
                console.error("Error fetching leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboardData();
    }, [page, limit]);

    const handleUserClick = (targetUserId) => {
        if (currentUserStats?.user?._id === targetUserId) {
            navigate('/profile');
        } else {
            navigate(`/profile/${targetUserId}`);
        }
    };

    const renderRankBadge = (rankIndex) => {
        if (rankIndex === 1) return <div className="w-8 h-8 rounded-full bg-yellow-400/10 text-yellow-500 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]"><Trophy size={14} /></div>;
        if (rankIndex === 2) return <div className="w-8 h-8 rounded-full bg-zinc-300/10 text-zinc-300 flex items-center justify-center border border-zinc-300/30"><Medal size={14} /></div>;
        if (rankIndex === 3) return <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/30"><Medal size={14} /></div>;
        
        return <div className="w-8 h-8 flex items-center justify-center text-zinc-500 font-bold text-xs">{rankIndex}</div>;
    };

    return (
        // 2. THE MASTER WRAPPER: Handles the fixed background image
        <div 
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed relative text-zinc-300 font-sans selection:bg-[#C9963A] selection:text-black"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* 3. THE OVERLAY: Darkens the image so text stays readable */}
            <div className="absolute inset-0 bg-[#080808]/50 z-0"></div>

            {/* 4. CONTENT WRAPPER: Sits on top of the overlay */}
            <div className="relative z-10 pb-12">
                <Header />
                
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-12">
                    
                    {/* Header Text Area */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <h1 className="text-3xl font-display font-black text-white tracking-wide flex items-center justify-center gap-3 drop-shadow-lg">
                            <Trophy className="text-[#C9963A]" size={32} /> Global Leaderboard
                        </h1>
                        <p className="text-zinc-400 mt-4 text-sm font-medium drop-shadow-md">Compete with the best. Solve problems, earn points, and climb the ranks.</p>
                    </motion.div>

                    <div className="h-16 w-full"></div>

                    {/* 5. THE TABLE: Added backdrop-blur-xl and slight transparency so the background bleeds through */}
                    <div className="bg-[#111]/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                            
                        {/* Pinned Current User Card */}
                        {currentUserStats && (
                            <div className="bg-gradient-to-r from-[#C9963A]/7 to-transparent border-b border-white/[0.06] p-5 px-8 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="flex flex-col items-center justify-center w-16">
                                        <span className="text-[9px] text-[#C9963A] font-bold uppercase tracking-widest mb-1">Your Rank</span>
                                        <span className="text-2xl font-black text-white drop-shadow-md">#{currentUserStats.rank}</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10 mx-2"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#C9963A]/30 flex items-center justify-center text-[#C9963A] font-bold shadow-[0_0_10px_rgba(201,150,58,0.15)] overflow-hidden shrink-0">
                                            {currentUserStats.user?.profilePicture ? (
                                                <img src={currentUserStats.user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                currentUserStats.user?.userName?.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base">{currentUserStats.user?.userName}</h3>
                                            <p className="text-zinc-400 text-[10px] font-medium">Keep pushing forward!</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 shrink-0 shadow-inner">
                                    <Star size={14} className="text-[#C9963A]" />
                                    <span className="text-[#C9963A] font-black text-lg">{currentUserStats.user?.totalPoints}</span>
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="flex items-center px-8 py-4 bg-black/40 border-b border-white/[0.06] text-[9px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">
                            <div className="w-16 text-center">Rank</div>
                            <div className="flex-1 px-4">Hacker</div>
                            <div className="w-24 text-right">Total Points</div>
                        </div>

                        {/* Leaderboard List - SCROLLABLE AREA */}
                        <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {loading ? (
                                <div className="flex justify-center py-16"><span className="loading loading-spinner loading-md text-[#C9963A]"></span></div>
                            ) : (
                                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                                    {leaderboard.length === 0 ? (
                                        <p className="text-center py-8 text-zinc-500 text-sm">No users found.</p>
                                    ) : (
                                        leaderboard.map((usr, index) => {
                                            const actualRank = (page - 1) * limit + index + 1;
                                            
                                            return (
                                                <motion.div 
                                                    key={usr._id} 
                                                    variants={rowVariants}
                                                    onClick={() => handleUserClick(usr._id)}
                                                    className="flex items-center px-8 py-4 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.05] cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-16 flex justify-center">
                                                        {renderRankBadge(actualRank)}
                                                    </div>
                                                    
                                                    <div className="flex-1 flex items-center gap-4 px-4">
                                                        <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-zinc-400 text-xs font-bold overflow-hidden group-hover:border-[#C9963A]/40 transition-colors shrink-0">
                                                            {usr.profilePicture ? (
                                                                <img src={usr.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                                            ) : (
                                                                usr.userName?.slice(0, 2).toUpperCase()
                                                            )}
                                                        </div>
                                                        <span className="text-white font-semibold text-sm group-hover:text-[#C9963A] transition-colors truncate">
                                                            {usr.userName}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="w-24 text-right">
                                                        <span className="text-white font-bold text-sm">{usr.totalPoints}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-8 py-3 border-t border-white/[0.06] bg-black/40 flex items-center justify-between shrink-0">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <span className="text-xs font-semibold text-zinc-500">
                                Page <span className="text-white">{page}</span>
                            </span>
                            <button 
                                onClick={() => setPage(p => p + 1)}
                                disabled={leaderboard.length < limit}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Leaderboard;