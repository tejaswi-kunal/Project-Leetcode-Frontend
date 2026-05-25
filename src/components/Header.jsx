import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";

// ── Icons ─────────────────────────────────────────────────────
// arrow up and arrow down icon ,on the basis on the basis of dropdown:T/F
const ChevronIcon = ({ open }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);

const LogoutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);

function Header() {
    // to check if the dropdown menu is oprn or not 
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // to store the ref of DOM element->dropdown menue ,and use it directly to access the properties of the 
    // dom element 
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, user } = useSelector((state) => state.authSlice);
    
    // Close dropdown on outside click using dropdown refrence stored in dropdownRef
    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);
 
    const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : "?";
 
    return (
        <header className="relative z-20 border-b border-white/[0.06] bg-black/50 backdrop-blur-xl sticky top-0">
            <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
                {/* Logo navigating to homepage */}
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-7 h-7 rounded-lg bg-[#C9963A] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                    </div>
                    <span className="text-white font-semibold text-sm tracking-wide">DevCode</span>
                </div>

                {/* Navigation menu */}
                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { label: "Problems", path: "/problems" },
                        { label: "Contest",  path: "/contest"  },
                        { label: "Discuss",  path: "/discuss"  },
                    ].map(({ label, path }) => (
                        <button key={label} onClick={() => navigate(path)}
                            className="px-4 py-2 rounded-xl text-zinc-500 text-sm hover:text-white hover:bg-white/[0.05] transition-all duration-200">
                            {label}
                        </button>
                    ))}
                </nav>
                    
                {/* Streaks and User Dropdown */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
                        <span className="text-sm">🔥</span>
                        <span className="text-zinc-400 text-xs">0 streak</span>
                    </div>
                    
                    {/* maintaining the dropdown menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(v => !v)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                                bg-white/[0.04] border border-white/[0.08]
                                hover:border-[#C9963A]/35 hover:bg-white/[0.07]
                                transition-all duration-200"
                        >
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#C9963A] to-[#E0B455] flex items-center justify-center">
                                <span className="text-black text-[10px] font-bold">{getInitials(user?.userName)}</span>
                            </div>
                            <span className="text-white text-sm font-medium max-w-[110px] truncate">
                                {user?.userName || "User"}
                            </span>
                            <ChevronIcon open={dropdownOpen} />
                        </button>
 
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52
                                bg-[#111] border border-white/[0.08]
                                rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]
                                overflow-hidden z-50">
                                {/* maintaining the username and the emailid */}
                                <div className="px-4 py-3 border-b border-white/[0.06]">
                                    {/* this is the one which we have to change to button see the profile page */}
                                    <p className="text-white text-sm font-medium truncate">{user?.userName || "User"}</p>
                                    <p className="text-zinc-600 text-xs mt-0.5 truncate">{user?.emailId || ""}</p>
                                </div>

                                {/* maintaining the logout */}
                                <div className="p-1.5">
                                    <button
                                        onClick={() => { setDropdownOpen(false); dispatch(logoutUser()); }}
                                        disabled={loading}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                            text-red-400 text-sm text-left
                                            hover:bg-red-500/10 disabled:opacity-50
                                            transition-colors duration-150"
                                    >
                                        {loading
                                            ? <span className="loading loading-spinner loading-xs text-red-400" />
                                            : <LogoutIcon />
                                        }
                                        {loading ? "Logging out..." : "Logout"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;