import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import axiosClient from "../utils/axiosClient";
import { Trophy, Medal, ChevronLeft, ChevronRight, Target, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};
 
function ContestLeaderboard() {
    const { id } = useParams(); // Contest ID
    const navigate = useNavigate();
    
    // Get logged-in user from Redux to handle profile redirects correctly
    const { user: authUser } = useSelector((state) => state.authSlice);

    const [leaderboard, setLeaderboard] = useState([]);
    const [totalProblems, setTotalProblems] = useState(0);
    const [currentUserStats, setCurrentUserStats] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContestData = async () => {
            setLoading(true);
            try {
                // Fetch Leaderboard and Personal Rank concurrently
                const [leaderboardRes, rankRes] = await Promise.all([
                    axiosClient.get(`/contest/getLeaderBoard/${id}?page=${page}&limit=${limit}`),
                    axiosClient.get(`/contest/myRank/${id}`).catch(() => ({ data: null })) // Catch if user isn't registered
                ]);

                setLeaderboard(leaderboardRes.data.leaderboard || []);
                setTotalProblems(leaderboardRes.data.totalProblems || 0);

                if (rankRes.data) {
                    setCurrentUserStats({
                        participant: rankRes.data.user,
                        rank: rankRes.data.rank,
                        solvedCount: rankRes.data.solvedCount
                    });
                }
            } catch (err) {
                console.error("Error fetching contest leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContestData();
    }, [id, page, limit]);

    const handleUserClick = (targetUserId) => {
        // If clicking on yourself, go to private profile. Otherwise, public profile.
        if (authUser?._id === targetUserId) {
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
        <div className="min-h-screen bg-[#080808] text-zinc-300 pb-12 font-sans selection:bg-[#C9963A] selection:text-black">
            <Header />
            
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-12">
                
                {/* Header Text Area */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <span className="font-mono text-xs font-bold text-[#C9963A] uppercase tracking-widest mb-2 block">Match Results</span>
                    <h1 className="text-3xl font-display font-black text-white tracking-wide flex items-center justify-center gap-3">
                        <Target className="text-[#C9963A]" size={32} /> Contest Leaderboard
                    </h1>
                </motion.div>

                {/* Hardcoded Spacer Div to force an unbreakable 64px (4rem) gap */}
                <div className="h-16 w-full"></div>

                <div className="bg-[#111] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        
                    {/* Pinned Current User Card */}
                    {currentUserStats && (
                        <div className="bg-gradient-to-r from-[#C9963A]/10 to-transparent border-b border-white/[0.06] p-5 px-8 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="flex flex-col items-center justify-center w-16">
                                    <span className="text-[9px] text-[#C9963A] font-bold uppercase tracking-widest mb-1">Your Rank</span>
                                    <span className="text-2xl font-black text-white">#{currentUserStats.rank}</span>
                                </div>
                                <div className="w-px h-10 bg-white/10 mx-2"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#C9963A]/30 flex items-center justify-center text-[#C9963A] font-bold shadow-[0_0_10px_rgba(201,150,58,0.15)] overflow-hidden shrink-0">
                                        {authUser?.profilePicture ? (
                                            <img src={authUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            authUser?.userName?.slice(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-base">{authUser?.userName}</h3>
                                        <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest">Contest Participant</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Solved</span>
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                                        <CheckCircle2 size={14} /> {currentUserStats.solvedCount} <span className="text-zinc-600 text-xs">/ {totalProblems}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Score</span>
                                    <span className="text-[#C9963A] font-black text-lg leading-none">{currentUserStats.participant?.score}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table Header */}
                    <div className="flex items-center px-8 py-4 bg-[#161616] border-b border-white/[0.06] text-[9px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
                        <div className="w-16 text-center">Rank</div>
                        <div className="flex-1 px-4">Hacker</div>
                        <div className="w-32 text-center">Solved</div>
                        <div className="w-24 text-right">Score</div>
                    </div>

                    {/* Leaderboard List - SCROLLABLE AREA */}
                    <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {loading ? (
                            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-md text-[#C9963A]"></span></div>
                        ) : (
                            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                                {leaderboard.length === 0 ? (
                                    <p className="text-center py-8 text-zinc-500 text-sm">No participants found.</p>
                                ) : (
                                    leaderboard.map((participant, index) => {
                                        const actualRank = (page - 1) * limit + index + 1;
                                        
                                        return (
                                            <motion.div 
                                                key={participant._id} 
                                                variants={rowVariants}
                                                onClick={() => handleUserClick(participant.user?._id)}
                                                className="flex items-center px-8 py-4 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                                            >
                                                <div className="w-16 flex justify-center">
                                                    {renderRankBadge(actualRank)}
                                                </div>
                                                
                                                <div className="flex-1 flex items-center gap-4 px-4">
                                                    <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-zinc-400 text-xs font-bold overflow-hidden group-hover:border-[#C9963A]/40 transition-colors shrink-0">
                                                        {participant.user?.profilePicture ? (
                                                            <img src={participant.user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            participant.user?.userName?.slice(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="text-white font-semibold text-sm group-hover:text-[#C9963A] transition-colors truncate">
                                                        {participant.user?.userName || "Unknown"}
                                                    </span>
                                                </div>

                                                <div className="w-32 flex justify-center items-center">
                                                    <span className="text-zinc-300 font-mono text-sm">{participant.solvedProblems?.length || 0}</span>
                                                    <span className="text-zinc-600 text-xs ml-1">/ {totalProblems}</span>
                                                </div>
                                                
                                                <div className="w-24 text-right">
                                                    <span className="text-[#C9963A] font-bold text-sm">{participant.score}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-8 py-3 border-t border-white/[0.06] bg-[#161616] flex items-center justify-between shrink-0">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <span className="text-xs font-semibold text-zinc-500">
                            Page <span className="text-white">{page}</span>
                        </span>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            disabled={leaderboard.length < limit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContestLeaderboard;