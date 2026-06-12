import { Outlet, NavLink, useLocation } from "react-router";
import Header from "../components/Header"; 
import { LayoutDashboard, FileCode2, Users, Swords, PlaySquare } from "lucide-react";

function AdminLayout() {
    const location = useLocation();

    // The core navigation modules planned
    const adminNavItems = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
        { name: "Manage Problems", path: "/admin/problems", icon: FileCode2, exact: false },
        { name: "Manage Users", path: "/admin/users", icon: Users, exact: false },
        { name: "Manage Contests", path: "/admin/contests", icon: Swords, exact: false },
        { name: "Video Solutions", path: "/admin/videos", icon: PlaySquare, exact: false },
    ];

    return (
        <div className="min-h-screen bg-[#080808] flex flex-col font-sans selection:bg-[#C9963A] selection:text-black">
            
            {/* 1. The Global Header */}
            <Header />

            {/* 2. Admin Workspace (Sidebar + Main Content) */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* ── LEFT SIDEBAR ── */}
                <aside className="w-64 bg-[#0a0a0a] border-r border-white/[0.04] flex flex-col hidden md:flex shrink-0">
                    <div className="p-6">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
                            Admin Control
                        </span>
                        <h2 className="font-display text-xl font-bold text-white tracking-wide">
                            Portal
                        </h2>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 mt-2">
                        {adminNavItems.map((item) => {
                            // Determine if active. Dashboard requires exact match so it doesn't stay highlighted on sub-pages.
                            const isActive = item.exact 
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path);

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                                        isActive 
                                        ? 'bg-[#C9963A]/10 text-[#C9963A] border border-[#C9963A]/20 shadow-inner' 
                                        : 'text-zinc-500 border border-transparent hover:bg-white/[0.02] hover:text-zinc-300'
                                    }`}
                                >
                                    <item.icon 
                                        size={18} 
                                        className={isActive ? "text-[#C9963A]" : "text-zinc-500 group-hover:text-zinc-400 transition-colors"} 
                                    />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                {/* ── RIGHT MAIN CONTENT AREA ── */}
                <main className="flex-1 overflow-y-auto bg-[#080808] relative">
                    
                    {/* Subtle ambient glow for the admin panel */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9963A]/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="p-8 relative z-10">
                        {/* This Outlet acts as a window. 
                            When you click "Manage Problems", React Router will inject 
                            your <AdminProblems /> component right here! 
                        */}
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
}

export default AdminLayout;