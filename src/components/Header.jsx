import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { User, Settings, Key, Shield, Trash2, LogOut, AlertTriangle, ChevronDown, Flame } from "lucide-react";
import axiosClient from "../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation(); 
    const dispatch = useDispatch();
    
    const { loading, user, isAuthenticated } = useSelector((state) => state.authSlice);
    
    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);
 
    const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : "?";

    const confirmDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await axiosClient.delete('/auth/deleteAccount');
            dispatch(logoutUser());
            setShowDeleteModal(false);
            navigate('/login');
        } catch (err) {
            console.error("Failed to delete account", err);
            setIsDeleting(false);
        }
    };

    const navItems = [
        { 
            label: "Problems", 
            path: "/problems", 
            matches: ["/problems", "/problem"] 
        },
        { label: "Contests",  path: "/contest"  },
        { label: "Leaderboard",  path: "/leaderboard"  },
    ];

    // THE FIX: Smart Navigation Interceptor
    const handleNavClick = (path) => {
        if (!isAuthenticated) {
            // If they aren't logged in, redirect to login but ATTACH the path they wanted!
            navigate('/login', { state: { from: { pathname: path } } });
        } else {
            // Normal navigation
            navigate(path);
        }
    };
 
    return (
        <>
            <header className="relative z-40 border-b border-white/[0.04] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
                    
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9963A] to-[#E0B455] flex items-center justify-center shadow-[0_0_15px_rgba(201,150,58,0.3)] group-hover:scale-105 transition-transform duration-300">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                            </svg>
                        </div>
                        <span className="text-white font-display font-bold text-sm tracking-widest uppercase">HackForge</span>
                    </div>

                    {/* Main Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => {
                            
                            // THE FIX: Check if it matches any of the paths in the array, fallback to normal path just in case
                            const isActive = item.matches 
                                ? item.matches.some(matchPath => location.pathname.startsWith(matchPath))
                                : location.pathname.startsWith(item.path);
                            
                            return (
                                <button 
                                    key={item.label} 
                                    onClick={() => handleNavClick(item.path)}
                                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {isActive && (
                                        <motion.div layoutId="activeNavTab" className="absolute inset-0 bg-white/[0.08] border border-white/[0.04] rounded-xl" initial={false} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                                    )}
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                        
                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* Streak Badge */}
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20">
                                    <Flame size={16} className="text-orange-500" />
                                    <span className="font-display text-white font-bold text-sm">{user?.streak || user?.streakCount || 0}</span>
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Streak</span>
                                </div>
                                
                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setDropdownOpen(v => !v)} 
                                        className={`flex items-center gap-3 px-2 py-1.5 rounded-xl border transition-all duration-300 ${dropdownOpen ? 'bg-white/[0.08] border-[#C9963A]/40' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10'}`}
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[#C9963A]/30 flex items-center justify-center shadow-inner">
                                            <span className="font-display text-[#C9963A] text-xs font-bold">{getInitials(user?.userName)}</span>
                                        </div>
                                        <span className="text-white text-sm font-semibold max-w-[100px] truncate hidden sm:block">
                                            {user?.userName || "User"}
                                        </span>
                                        <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDown size={14} className="text-zinc-400 mr-1" />
                                        </motion.div>
                                    </button>
            
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="absolute right-0 top-[calc(100%+8px)] w-60 bg-[#111] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 origin-top-right"
                                            >
                                                <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                                                    <p className="text-white text-sm font-bold truncate">{user?.userName || "User"}</p>
                                                    <p className="text-zinc-500 text-xs mt-0.5 truncate font-medium">{user?.emailId || ""}</p>
                                                </div>
                                                <div className="p-2 flex flex-col gap-1">
                                                    <button onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-300 text-sm font-medium hover:bg-white/[0.06] hover:text-white transition-colors"><User size={16} className="text-zinc-400" /> Profile</button>
                                                    {user?.role === 'admin' && <button onClick={() => { setDropdownOpen(false); navigate('/admin'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#C9963A] text-sm font-bold hover:bg-[#C9963A]/10 transition-colors"><Shield size={16} /> Admin Panel</button>}
                                                    <button onClick={() => { setDropdownOpen(false); navigate('/settings/edit-profile'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-300 text-sm font-medium hover:bg-white/[0.06] hover:text-white transition-colors"><Settings size={16} className="text-zinc-400" /> Edit Profile</button>
                                                    <button onClick={() => { setDropdownOpen(false); navigate('/settings/change-password'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-300 text-sm font-medium hover:bg-white/[0.06] hover:text-white transition-colors"><Key size={16} className="text-zinc-400" /> Change Password</button>
                                                    
                                                    <div className="h-[1px] bg-white/[0.06] my-1 mx-2"></div>
                                                    
                                                    <button onClick={() => { setDropdownOpen(false); dispatch(logoutUser()); }} disabled={loading} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors">
                                                        {loading ? <span className="loading loading-spinner loading-xs border-red-400"></span> : <LogOut size={16} />} Logout
                                                    </button>
                                                    <button onClick={() => { setDropdownOpen(false); setShowDeleteModal(true); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors"><Trash2 size={16} /> Delete Account</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center">
                                <button 
                                    onClick={() => navigate('/login')} 
                                    className="relative px-7 py-2.5 rounded-xl border border-white/10 hover:border-[#C9963A]/50 bg-white/[0.02] backdrop-blur-xl transition-all duration-500 overflow-hidden group shadow-[0_0_15px_rgba(201,150,58,0.05)] hover:shadow-[0_0_30px_rgba(201,150,58,0.25)]"
                                >
                                    {/* Slow breathing ambient glow (glows with time) */}
                                    <div className="absolute inset-0 bg-[#C9963A]/6 animate-pulse blur-sm"></div>

                                    {/* High-intensity glow on hover */}
                                    <div className="absolute inset-0 bg-[#C9963A]/1 opacity-0 group-hover:opacity-20 transition-opacity duration-100 blur-sm"></div>

                                    {/* Crisp, ultra-readable text */}
                                    <span className="relative z-10 font-display font-bold text-[#C9963A] tracking-wider group-hover:text-[#E0B455] transition-colors duration-300 drop-shadow-md">
                                        Sign In
                                    </span>
                                </button>
                            </div>
                            
                        )}
                    </div>
                </div>
            </header>

            {/* CUSTOM DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#111] border border-red-500/20 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_rgba(239,68,68,0.15)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-900"></div>
                            <div className="flex items-center gap-4 mb-5 text-red-500">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0"><AlertTriangle size={24} /></div>
                                <h2 className="text-xl font-bold text-white tracking-wide">Delete Account?</h2>
                            </div>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">Are you absolutely sure? This action <strong className="text-white font-semibold">cannot be undone</strong>. All of your solved problems, streaks, points, and account data will be permanently erased.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="px-5 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-bold">Cancel</button>
                                <button onClick={confirmDeleteAccount} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all text-sm font-bold shadow-lg disabled:opacity-50">
                                    {isDeleting ? <span className="loading loading-spinner loading-xs border-current"></span> : <Trash2 size={16} />} Yes, Delete My Account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Header;