import { useState, useEffect } from "react";
import { ListTodo, BarChart3, User as UserIcon } from "lucide-react";
import { useSelector } from "react-redux";

function ContestHeader({ contest, onOpenPanel }) {
    const { user } = useSelector(state => state.authSlice);
    const [timeLeft, setTimeLeft] = useState("");

    // Live Countdown Logic
    useEffect(() => {
        if (!contest?.endTime) return;
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(contest.endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft("00:00:00");
                return;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    return (
        <div className="h-16 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
            
            {/* Left: Branding & Contest Title */}
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9963A] to-[#E0B455] flex items-center justify-center shadow-[0_0_15px_rgba(201,150,58,0.2)]">
                    <span className="font-display font-black text-black text-lg">H</span>
                </div>
                <div className="w-px h-5 bg-white/10"></div>
                <h1 className="font-display font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-[350px]">
                    {contest?.title || "Loading Arena..."}
                </h1>
            </div>

            {/* Middle: Actions (Premium Pill Design) */}
            <div className="hidden md:flex items-center bg-[#111] border border-white/[0.06] rounded-xl p-1 shadow-inner">
                <button 
                    onClick={() => onOpenPanel('problems')}
                    className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                    <ListTodo size={14} className="text-[#C9963A]" /> Problems
                </button>
                <button 
                    onClick={() => onOpenPanel('ranking')}
                    className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                    <BarChart3 size={14} className="text-zinc-500" /> Ranking
                </button>
            </div>

            {/* Right: Timer & User Profile */}
            <div className="flex items-center gap-5">
                
                {/* Live Timer Container */}
                <div className="flex items-center gap-2.5 bg-[#111] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)] px-4 py-1.5 rounded-xl">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="font-mono text-red-400 font-bold text-sm tracking-wider">
                        {timeLeft || "--:--:--"}
                    </span>
                </div>
                
                <div className="w-px h-5 bg-white/10 hidden sm:block"></div>
                
                {/* User Avatar */}
                {/* User Profile (Username + Avatar) */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    {/* Avatar Block */}
                    {/* User Profile (The Encapsulated Rectangle) */}
                    <div className="flex items-center gap-3 bg-[#111] border border-white/[0.06] rounded-xl p-1 pr-4 cursor-pointer hover:border-[#C9963A]/40 hover:bg-[#161616] transition-all group shadow-inner">
                    
                    {/* The Square Avatar */}
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 text-[#C9963A] font-bold text-xs shadow-sm">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            user?.userName ? user.userName.slice(0, 2).toUpperCase() : <UserIcon size={14} className="text-zinc-500" />
                        )}
                    </div>
                    
                    {/* The Username */}
                    <span className="text-zinc-300 font-bold text-sm group-hover:text-[#ffffff] transition-colors hidden sm:block tracking-wide">
                        {user?.userName || "Unknown"}
                    </span>
                    
                </div>
                </div>
                
            </div>
        </div>
    );
}

export default ContestHeader;