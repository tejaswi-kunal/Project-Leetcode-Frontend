import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import { Edit3, AlertCircle, Search, Calendar, Clock } from "lucide-react";
import PremiumLoader from "../components/PremiumLoader";

function UpdateContestList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [contests, setContests] = useState([]);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        const fetchContests = async () => {
            setLoading(true);
            setServerError('');
            try {
                // Fetching all upcoming contests without pagination
                const res = await axiosClient.get(`/contest/getUpcomingContest`);
                const contestData = res.data?.upcomingContest || res.data || [];
                
                setContests(contestData);
            } catch (err) {
                console.error("Failed to load contests:", err);
                setServerError("Failed to load upcoming contests. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }).format(date);
    };

    if (loading) 
    {
        return <PremiumLoader />
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white h-full flex flex-col animate-in fade-in duration-500 pb-20">
            
            {/* Header section with blue update accents */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        <Edit3 size={20} />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Update Upcoming Contests</h1>
                </div>
                <p className="text-blue-400 font-medium text-sm bg-blue-500/10 border border-blue-500/20 inline-block px-4 py-2 rounded-lg mt-2">
                    <Search size={14} className="inline mr-2 mb-0.5" />
                    Click the Edit button next to any upcoming contest to modify its structure, problem sets, or schedule.
                </p>
            </div>

            {/* Error Banner */}
            {serverError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{serverError}</p>
                </div>
            )}

            {/* Premium Data Table Container */}
            <div className="bg-[#111] border border-white/5 rounded-2xl flex flex-col shadow-lg overflow-hidden flex-1">
                {loading ?  <PremiumLoader /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-[#161618]">
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider w-28">Contest #</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Contest Title</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Starts At</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Ends At</th>
                                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {contests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-zinc-500">
                                            <Calendar size={32} className="mx-auto mb-3 opacity-30 text-zinc-500" />
                                            <p className="text-sm font-medium">No upcoming contests found to update.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    contests.map((contest) => (
                                        <tr key={contest._id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="p-4">
                                                <span className="text-xs font-bold text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md font-mono">
                                                    #{contest.contestNumber}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-white">{contest.title}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                    <Calendar size={14} className="text-blue-400" />
                                                    {formatDateTime(contest.startTime)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                    <Clock size={14} className="text-orange-400" />
                                                    {formatDateTime(contest.endTime)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => navigate(`/admin/contests/update/${contest._id}`)}
                                                    className="text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-1.5 rounded-lg transition-colors border border-blue-500/20"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpdateContestList;