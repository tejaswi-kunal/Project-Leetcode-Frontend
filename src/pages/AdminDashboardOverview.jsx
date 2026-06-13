import { useState, useEffect } from "react";
import { Link } from "react-router";
import axiosClient from "../utils/axiosClient";
import { 
    FileCode2, Send, Users, Plus, 
    Trophy, Play, CheckCircle2, XCircle, Clock, ArrowRight
} from "lucide-react";
import PremiumLoader from "../components/PremiumLoader";

function AdminDashboardOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ activeUsers: 0, totalProblems: 0, totalSubmissions: 0 });
    const [recentSubmissions, setRecentSubmissions] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axiosClient.get('/admin/dashboard-stats');
                setStats(res.data.stats);
                setRecentSubmissions(res.data.recentSubmissions);
            } catch (err) {
                console.error("Failed to load dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const timeAgo = (dateString) => {
        if (!dateString) return "Just now";
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    if (loading)
    {
        return <PremiumLoader />
    }

    return (
        /* The container is locked to a single view height to prevent scrolling */
        <div className="max-w-7xl mx-auto p-6 font-sans text-white h-full min-h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-8">
            
            {/* ── LEFT WING (65%): Title, Stats, and Actions ── */}
            <div className="w-full lg:w-[65%] flex flex-col gap-6">
                
                {/* Header */}
                <div>
                    <h1 className="font-sans text-2xl font-semibold tracking-tight">Admin Portal</h1>
                    <p className="text-zinc-500 font-mono text-sm mt-1">Platform telemetry and quick actions.</p>
                </div>
                <br></br>

                <h2 className="text-sm font-semibold font-sans  tracking-[0.25em] text-[#C9963A] mb-3 underline underline-offset-4">
                    System Analytics
                </h2>               
                {/* STATS ROW (1, 2, 3) */}
                <div className="grid grid-cols-4 gap-6">
                    {/* Square 1 */}
                    <div className="aspect-square bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 hover:border-blue-500/30 transition-colors shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 text-sky-400">
                            <FileCode2 size={24} />
                        </div>
                        <h3 className="text-sky-400 font-sans text-xl font-semibold">{stats.totalProblems}</h3>
                        <p className="text-sky-400 text-sm font-display font-semibold uppercase tracking-widest mt-1">Problems</p>
                    </div>

                    {/* Square 2 */}
                    <div className="aspect-square bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 hover:border-emerald-500/30 transition-colors shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-400">
                            <Send size={24} className="-ml-1" />
                        </div>
                        <h3 className="font-sans text-xl font-semibold text-emerald-400">{stats.totalSubmissions}</h3>
                        <p className="text-emerald-400 text-sm font-display font-semibold uppercase tracking-widest mt-1">Submissions</p>
                    </div>

                    {/* Square 3 */}
                    <div className="aspect-square bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 hover:border-[#C9963A]/40 transition-colors shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-[#C9963A]/10 flex items-center justify-center mb-3 text-[#C9963A]">
                            <Users size={24} />
                        </div>
                        <h3 className="font-sans text-xl font-semibold text-[#C9963A]">{stats.activeUsers}</h3>
                        <p className="text-[#C9963A] text-sm font-display font-semibold uppercase tracking-widest mt-1">Users</p>
                    </div>
                </div>
                <br></br>
                <h2 className="text-sm font-sans font-semibold tracking-[0.25em] text-[#C9963A] mb-3 mt-2 underline underline-offset-4">
                    Quick Actions
                </h2>
                {/* ACTIONS ROW (1, 2, 3) */}
                <div className="grid grid-cols-4 gap-6">
                    {/* Action 1 */}
                    <Link to="/admin/problems/create" className="aspect-square bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 hover:bg-[#161618] transition-all group shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3 group-hover:scale-110 transition-transform">
                            <Plus size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-sm">Create Problem</h3>
                        <p className="text-zinc-500 text-[10px] mt-1 text-center px-2">Add a New Problem</p>
                    </Link>

                    {/* Action 2 */}
                    <Link to="/admin/contests/create" className="aspect-square bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 hover:bg-[#161618] transition-all group shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                            <Trophy size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-sm">Create Contest</h3>
                        <p className="text-zinc-500 text-[10px] mt-1 text-center px-2">Schedule A Contest</p>
                    </Link>

                    {/* Action 3 */}
                    <Link to="/admin/videos" className="aspect-square bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 hover:bg-[#161618] transition-all group shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 transition-transform">
                            <Play size={24} strokeWidth={2.5} className="ml-1" />
                        </div>
                        <h3 className="font-bold text-sm">Manage Videos</h3>
                        <p className="text-zinc-500 text-[10px] mt-1 text-center px-2">Upload or Delete Video solutions.</p>
                    </Link>
                </div>

            </div>

            {/* ── RIGHT WING (35%): Recent Submissions ── */}
            <div className="w-full lg:w-[35%] flex flex-col h-full mt-2 lg:mt-0">
                <h2 className="font-display text-lg font-bold mb-4">Activity Feed</h2>
                
                {/* This container stretches to fill available height, hiding scrollbars inside */}
                <div className="bg-[#111] border border-white/5 rounded-2xl flex flex-col flex-1 shadow-lg overflow-hidden">
                    
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {recentSubmissions.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm flex flex-col items-center mt-10">
                                <Clock size={24} className="mb-2 opacity-30" />
                                No recent activity.
                            </div>
                        ) : (
                            recentSubmissions.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-white/[0.03] rounded-xl transition-colors">
                                    
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="shrink-0">
                                            {sub.status === "Accepted" ? (
                                                <CheckCircle2 size={16} className="text-emerald-400" />
                                            ) : (
                                                <XCircle size={16} className="text-red-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{sub.problem}</p>
                                            <p className="text-xs text-zinc-500 truncate">by <span className="text-zinc-300">{sub.user}</span></p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right shrink-0 ml-3 flex flex-col items-end gap-1">
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${sub.status === "Accepted" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : sub.status.includes("Exceeded") ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                                            {sub.status === "Time Limit Exceeded" ? "TLE" : sub.status}
                                        </span>
                                        <span className="text-[10px] text-zinc-500">{timeAgo(sub.time)} ago</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link 
                        to="/admin/submissions" 
                        className="p-4 border-t border-white/5 bg-white/[0.02] hover:bg-white/[0.04] flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors mt-auto"
                    >
                        View All Submissions <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

        </div>
    );
}

export default AdminDashboardOverview;