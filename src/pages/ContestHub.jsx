import { useState, useEffect } from "react";
import { Link } from "react-router";
import axiosClient from "../utils/axiosClient";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, PlayCircle, CalendarClock, History, CheckCircle2, 
    AlertCircle, Target, ArrowRight, ChevronLeft, ChevronRight, 
    UserPlus, ShieldAlert, Zap 
} from "lucide-react";
import PremiumLoader from "../components/PremiumLoader";

function ContestHub() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [running, setRunning] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [ended, setEnded] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const [pastPage, setPastPage] = useState(1);
    const [isFetchingPast, setIsFetchingPast] = useState(false);
    const pastLimit = 10;

    useEffect(() => {
        const fetchActiveContests = async () => {
            try {
                const [runRes, upRes] = await Promise.all([
                    axiosClient.get('/contest/getRunningContest'),
                    axiosClient.get('/contest/getUpcomingContest')
                ]);
                setRunning(runRes.data.runningContest || []);
                setUpcoming(upRes.data.upcomingContest || []);
            } catch (error) {
                console.error("Failed to fetch active contests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveContests();
    }, []);

    useEffect(() => {
        const fetchPastContests = async () => {
            setIsFetchingPast(true);
            try {
                const endRes = await axiosClient.get(`/contest/getEndedContest?page=${pastPage}&limit=${pastLimit}`);
                setEnded(endRes.data.endedContest || []);
            } catch (error) {
                console.error("Failed to fetch past contests:", error);
            } finally {
                setIsFetchingPast(false);
            }
        };
        fetchPastContests();
    }, [pastPage]);

    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // THE FIX: Instantly update local state so no reload is required!
    const handleRegister = async (contestID) => {
        try {
            await axiosClient.post(`/contest/contestRegistration/${contestID}`);
            showToast("Successfully registered for the contest!", "success");

            // Update local state for Running Contests
            setRunning(prev => prev.map(contest => 
                contest._id === contestID ? { ...contest, isRegistered: true } : contest
            ));

            // Update local state for Upcoming Contests
            setUpcoming(prev => prev.map(contest => 
                contest._id === contestID ? { ...contest, isRegistered: true } : contest
            ));

        } catch (error) {
            showToast(error.response?.data || "Registration failed.", "error");
        }
    };

    const formatLocalTime = (dateString) => {
        return new Date(dateString).toLocaleString(undefined, { 
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
        });
    };

    if (loading)
    {
        return <PremiumLoader />
    }

    return (
        <div className="min-h-screen bg-[#080808] text-zinc-300 font-sans relative selection:bg-[#C9963A] selection:text-black pb-20">
            {/* Minimalist Background Lighting - Changes based on tab */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000">
                <div className={`absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-700 ${
                    activeTab === 'running' ? 'bg-red-500/[0.03]' : 
                    activeTab === 'past' ? 'bg-emerald-500/[0.03]' : 
                    'bg-[#C9963A]/[0.03]'
                }`} />
            </div>

            <Header />

            {/* Premium Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className={`px-6 py-3 rounded-xl flex items-center gap-3 font-bold text-sm shadow-2xl border bg-[#111] ${toast.type === 'success' ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}`}>
                            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {toast.msg}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16">
                
                {/* Hero Section */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9963A]/10 border border-[#C9963A]/20 text-[#C9963A] text-[10px] font-bold uppercase tracking-widest mb-4">
                        <Zap size={12} /> Global Competition
                    </div>
                    <h1 className="font-display text-5xl font-black text-white tracking-wide mb-4">
                        Contest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9963A] to-[#E0B455]">Arena</span>
                    </h1>
                    <p className="text-zinc-400 text-sm max-w-xl mx-auto font-medium leading-relaxed">
                        Push your limits. Compete in real-time coding challenges against the community, earn points, and dominate the global rankings.
                    </p>
                </motion.div>

                {/* ANTI-CHEAT WARNING BANNER */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="mb-12 bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-inner">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h4 className="text-red-400 font-display font-bold text-sm mb-1 uppercase tracking-widest">Fair Play Strictly Enforced</h4>
                            <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                                To maintain equal competition, the use of AI assistants (like ChatGPT), code sharing, or plagiarism during active contests is strictly prohibited. Violators will face immediate disqualification and permanent account bans.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* SLEEK GOLDEN TABS */}
                <div className="flex bg-[#111] p-1.5 rounded-xl mb-10 border border-white/[0.06] shadow-sm max-w-[450px] mx-auto backdrop-blur-md">
                    {['upcoming', 'running', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab === 'past') setPastPage(1);
                            }}
                            className={`flex-1 py-2.5 rounded-lg font-display text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                                activeTab === tab 
                                ? 'bg-[#C9963A]/10 text-[#C9963A] shadow-sm border border-[#C9963A]/30' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                        >
                            {/* RUNNING TAB */}
                            {activeTab === 'running' && (
                                running.length === 0 ? <EmptyState text="No running contests available." icon={<PlayCircle size={48} />} color="text-red-500/20" /> :
                                running.map(contest => (
                                    <RunningCard key={contest._id} contest={contest} onRegister={() => handleRegister(contest._id)} />
                                ))
                            )}

                            {/* UPCOMING TAB */}
                            {activeTab === 'upcoming' && (
                                upcoming.length === 0 ? <EmptyState text="No upcoming contests scheduled." icon={<CalendarClock size={48} />} color="text-[#C9963A]/20" /> :
                                upcoming.map(contest => (
                                    <UpcomingCard key={contest._id} contest={contest} onRegister={() => handleRegister(contest._id)} formatLocalTime={formatLocalTime} />
                                ))
                            )}

                            {/* PAST TAB */}
                            {activeTab === 'past' && (
                                <>
                                    {isFetchingPast && ended.length === 0 ? (
                                        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-md text-emerald-500"></span></div>
                                    ) : ended.length === 0 && pastPage === 1 ? (
                                        <EmptyState text="No past contests found." icon={<History size={48} />} color="text-emerald-500/20" />
                                    ) : (
                                        <div className="space-y-4">
                                            {ended.map((contest) => (
                                                <PastCard key={contest._id} contest={contest} formatLocalTime={formatLocalTime} />
                                            ))}
                                            
                                            {/* Emerald Pagination */}
                                            <div className="px-2 py-6 flex items-center justify-between">
                                                <button 
                                                    onClick={() => setPastPage(p => Math.max(1, p - 1))}
                                                    disabled={pastPage === 1 || isFetchingPast}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
                                                >
                                                    <ChevronLeft size={16} /> Previous
                                                </button>
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                    Page <span className="text-white mx-1">{pastPage}</span>
                                                </span>
                                                <button 
                                                    onClick={() => setPastPage(p => p + 1)}
                                                    disabled={ended.length < pastLimit || isFetchingPast}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
                                                >
                                                    Next <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// --- SHARP & ELEGANT PREMIUM CARDS ---

const EmptyState = ({ text, icon, color }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-[#111] border border-white/[0.06] rounded-3xl shadow-inner">
        <div className={`mb-5 ${color}`}>{icon}</div>
        <p className="font-display text-zinc-500 font-bold text-sm tracking-widest uppercase">{text}</p>
    </div>
);

// RED THEME
const RunningCard = ({ contest, onRegister }) => (
    <div className="group relative overflow-hidden bg-[#111] border border-red-500/20 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"></div>
        
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">Live Match • #{contest.contestNumber}</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2 tracking-wide group-hover:text-red-50 transition-colors">{contest.title}</h3>
            <p className="text-zinc-400 text-sm font-medium">{contest.description || "The arena is active and blood is spilling."}</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
            {contest.isRegistered ? (
                <Link 
                    to={`/contest/${contest._id}/arena`} 
                    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2 group/btn"
                >
                    Enter Arena <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            ) : (
                <button 
                    onClick={onRegister}
                    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 shadow-inner"
                >
                    <UserPlus size={16} className="text-red-400" /> Register to Join
                </button>
            )}
        </div>
    </div>
);

// GOLD THEME
const UpcomingCard = ({ contest, onRegister, formatLocalTime }) => (
    <div className="group relative bg-[#111] border border-white/[0.06] rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-[#C9963A]/40 hover:bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md hover:shadow-[0_0_30px_rgba(201,150,58,0.05)] overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#C9963A]/30 group-hover:bg-[#C9963A] transition-colors"></div>

        <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Upcoming Match • #{contest.contestNumber}</span>
            <h3 className="font-display text-2xl font-bold text-white mb-3 tracking-wide">{contest.title}</h3>
            <div className="flex items-center gap-2 text-sm font-medium text-[#C9963A] font-mono bg-[#C9963A]/5 border border-[#C9963A]/10 w-fit px-3 py-1.5 rounded-lg shadow-inner">
                <Clock size={14} /> {formatLocalTime(contest.startTime)}
            </div>
        </div>
        
        {contest.isRegistered ? (
            <button 
                disabled
                className="shrink-0 px-8 py-3.5 rounded-xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2 opacity-80 cursor-default"
            >
                <CheckCircle2 size={16} /> Registered
            </button>
        ) : (
            <button 
                onClick={onRegister}
                className="shrink-0 px-8 py-3.5 rounded-xl font-bold text-sm bg-[#C9963A]/10 hover:bg-[#C9963A]/20 text-[#C9963A] border border-[#C9963A]/30 hover:border-[#C9963A]/50 transition-all flex items-center justify-center gap-2 shadow-inner"
            >
                <UserPlus size={16} /> Register Now
            </button>
        )}
    </div>
);

// GREEN THEME
const PastCard = ({ contest, formatLocalTime }) => (
    <div className="group relative bg-[#111] border border-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#121614] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors"></div>

        <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 mb-2 block">Concluded • Match #{contest.contestNumber}</span>
            <h3 className="font-display text-xl font-bold text-zinc-200 group-hover:text-white transition-colors mb-2 tracking-wide">{contest.title}</h3>
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                <History size={14} className="text-zinc-600 group-hover:text-emerald-500/50 transition-colors" /> {formatLocalTime(contest.endTime)}
            </span>
        </div>
        
        <Link 
            to={`/contest/${contest._id}/leaderboard`} 
            className="shrink-0 px-6 py-3 rounded-xl font-bold text-xs bg-black/40 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 border border-white/[0.06] hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 shadow-inner group/btn"
        >
            <Target size={14} className="group-hover/btn:text-emerald-400 transition-colors" /> Final Results
        </Link>
    </div>
);

export default ContestHub;