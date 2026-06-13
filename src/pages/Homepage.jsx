import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; // <-- Added Footer Import
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Play, Code2, TrendingUp, Trophy, ChevronRight, Terminal, X, ArrowRight } from "lucide-react";

// --- Company Logos ---
import googleLogo from "../assets/companies/google-logo.svg";
import metaLogo from "../assets/companies/meta-logo.svg";
import microsoftLogo from "../assets/companies/microsoft-logo.svg";
import amazonLogo from "../assets/companies/amazon-logo.svg";
import appleLogo from "../assets/companies/apple-logo.svg";
import netflixLogo from "../assets/companies/netflix-logo.svg";
import uberLogo from "../assets/companies/uber-logo.svg";

// --- Platform Screenshots ---
import problemSubmitImg from '../assets/ProblemSubmitPage.jpg';
import contestArenaImg from '../assets/ContestArena.jpg';
import globalLeaderboardImg from '../assets/GlobalLeaderboard.jpg';
import profileSectionImg from '../assets/ProfileSection.jpg';
import problemPageImg from '../assets/ProblemPage.jpg';

const companies = [googleLogo, metaLogo, microsoftLogo, amazonLogo, appleLogo, netflixLogo, uberLogo];

const introSlides = [
    {
        image: problemSubmitImg,
        title: "Advanced Coding Arena",
        desc: "Solve problems with full editorial support, view past submissions, get help from our AI chatbot, and interact with the community."
    },
    {
        image: contestArenaImg,
        title: "Live Contests",
        desc: "Compete in real-time with a lightning-fast execution environment, live rankings, and strict test-case validation."
    },
    {
        image: globalLeaderboardImg,
        title: "Global Leaderboard",
        desc: "See where you stand against the best developers worldwide. Solve problems, earn points, and climb the ranks."
    },
    {
        image: profileSectionImg,
        title: "Comprehensive Analytics",
        desc: "Track your daily progress, monitor your activity streak, and visualize your rating history beautifully."
    },
    {
        image: problemPageImg,
        title: "Massive Problem Library",
        desc: "Filter through thousands of algorithmic challenges by difficulty, tags, and completion status."
    }
];

function Homepage() {
    const navigate = useNavigate();
    // ── Pulling isAuthenticated to conditionally render CTA ──
    const { isAuthenticated, user } = useSelector((state) => state.authSlice);

    // --- Typewriter Effect Logic ---
    const words = ["Future!", "Army!", "Family!", "World!"];
    const [wordIndex, setWordIndex] = useState(0);

    // --- Watch Intro Modal State ---
    const [isIntroOpen, setIsIntroOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Typewriter Interval
    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Intro Carousel Auto-Swipe Interval
    useEffect(() => {
        let slideInterval;
        if (isIntroOpen) {
            slideInterval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % introSlides.length);
            }, 4000); // Swipes every 4 seconds
        }
        return () => clearInterval(slideInterval);
    }, [isIntroOpen]);

    // --- 3D Tilt Effect Logic for the Code Editor ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const springConfig = { damping: 25, stiffness: 150 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / rect.width - 0.5;
        const yPct = mouseY / rect.height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-[#C9963A] selection:text-black overflow-x-hidden">
            
            {/* ── AMBIENT BACKGROUND GLOWS (Optimized to absolute) ── */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#C9963A]/10 blur-[120px] transform-gpu" />
                <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] transform-gpu" />
                <div className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] rounded-full bg-purple-600/5 blur-[150px] transform-gpu" />
            </div>

            <Header />

            <main className="relative z-10">
                
                {/* ── 1. HERO SECTION ── */}
                <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 lg:pt-32 lg:pb-24 grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Typography */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-tight mb-6">
                            Be a part of our <br/>
                            {/* Fixed width/height container to stop UI jumping */}
                            <span className="text-[#C9963A] relative inline-flex h-[1.2em] min-w-[280px] overflow-hidden items-center align-bottom">
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={wordIndex}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -40 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="absolute left-0"
                                    >
                                        {words[wordIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-lg sm:text-xl max-w-lg mb-10 leading-relaxed font-medium">
                            A community of elite coders making the world a better place. Learn, build, and grow with the best developers in the industry.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <button 
                                onClick={() => navigate('/problems')}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C9963A] text-black font-bold text-lg hover:bg-[#E0B455] hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(201,150,58,0.3)] flex items-center justify-center gap-2 group"
                            >
                                Start Solving <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => setIsIntroOpen(true)}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.02)]"
                            >
                                <Play size={20} className="fill-white" /> Watch Intro
                            </button>
                        </div>
                    </motion.div>

                    {/* Right 3D Code Editor (Hardware Accelerated) */}
                    <div 
                        className="relative perspective-1000"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{ perspective: "1000px" }}
                    >
                        <motion.div 
                            style={{ rotateX, rotateY, willChange: "transform" }}
                            className="w-full rounded-2xl bg-[#0f0f11]/90 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transform-gpu"
                        >
                            {/* Editor Header */}
                            <div className="bg-[#18181b] px-4 py-3 flex items-center gap-2 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500/50"></div>
                                </div>
                                <p className="text-zinc-500 text-xs font-mono ml-4 flex items-center gap-2">
                                    <Code2 size={14}/> main.cpp
                                </p>
                                <div className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-400/10 flex items-center gap-1.5 border border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Live
                                </div>
                            </div>
                            
                            {/* Editor Body */}
                            <div className="p-6 font-mono text-sm sm:text-base leading-relaxed text-zinc-300 overflow-x-hidden">
                                <p className="text-[#C9963A] opacity-80 mb-2">/* System Deployment Protocol */</p>
                                <div className="flex">
                                    <span className="text-zinc-600 select-none pr-4">1</span>
                                    <p><span className="text-purple-400">void</span> <span className="text-blue-400">deploySystem</span>() {"{"}</p>
                                </div>
                                <div className="flex">
                                    <span className="text-zinc-600 select-none pr-4">2</span>
                                    <p className="ml-8"><span className="text-emerald-400">cout</span> &lt;&lt; <span className="text-orange-300">"[DEPLOY] All tests passed..."</span> &lt;&lt; <span className="text-emerald-400">endl</span>;</p>
                                </div>
                                <div className="flex">
                                    <span className="text-zinc-600 select-none pr-4">3</span>
                                    <p className="ml-8"><span className="text-emerald-400">cout</span> &lt;&lt; <span className="text-orange-300">"[DEPLOY] Building packaging..."</span> &lt;&lt; <span className="text-emerald-400">endl</span>;</p>
                                </div>
                                <div className="flex">
                                    <span className="text-zinc-600 select-none pr-4">4</span>
                                    <p className="ml-8 mt-4 text-[#C9963A]">if <span className="text-zinc-300">(status == <span className="text-blue-400">SUCCESS</span>) {"{"}</span></p>
                                </div>
                                <div className="flex">
                                    <span className="text-zinc-600 select-none pr-4">5</span>
                                    <p className="ml-16"><span className="text-emerald-400">cout</span> &lt;&lt; <span className="text-orange-300">"Application is live. Users onboard."</span>;</p>
                                </div>
                                <div className="flex">
                                    <span className="text-zinc-600 select-none pr-4">6</span>
                                    <p className="ml-8">{"}"}</p>
                                </div>
                                <div className="flex">
                                    <span className="text-zinc-600 select-none pr-4">7</span>
                                    <p>{"}"}</p>
                                </div>
                                <div className="flex mt-2">
                                    <span className="text-zinc-600 select-none pr-4">8</span>
                                    <div className="w-2.5 h-5 bg-[#C9963A] animate-pulse shadow-[0_0_8px_rgba(201,150,58,0.8)]"></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── 2. STATS BANNER (Optimized Glassmorphism) ── */}
                <section className="border-y border-white/5 bg-[#111]/40 backdrop-blur-md relative z-10">
                    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
                        <div className="text-center">
                            <h3 className="text-4xl font-display font-black text-white mb-1">202K<span className="text-[#C9963A]">+</span></h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Students</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-display font-black text-white mb-1">1,250<span className="text-[#C9963A]">+</span></h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Algorithms</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-display font-black text-white mb-1">99<span className="text-[#C9963A]">%</span></h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Acceptance</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-display font-black text-white mb-1">24<span className="text-[#C9963A]">/</span>7</h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Code Execution</p>
                        </div>
                    </div>
                </section>

                {/* ── 3. INFINITE MARQUEE ── */}
                <section className="py-20 overflow-hidden relative z-10">
                    <div className="text-center mb-10">
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Our users work at top tech companies</p>
                    </div>
                    
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none"></div>

                    <div className="flex whitespace-nowrap overflow-hidden">
                        <motion.div 
                            className="flex items-center gap-20 px-10 transform-gpu"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
                            style={{ willChange: "transform" }}
                        >
                            {[...companies, ...companies].map((logo, idx) => (
                                <img 
                                    key={idx} 
                                    src={logo} 
                                    alt="Tech Company" 
                                    className="h-8 md:h-10 opacity-30 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
                                />
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ── 4. BENTO BOX FEATURES GRID ── */}
                <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-display font-black text-white mb-4">Everything you need to <span className="text-[#C9963A]">dominate.</span></h2>
                        <p className="text-zinc-400 font-medium">Built for competitive programmers, by competitive programmers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                        
                        {/* Box 1: Arena */}
                        <div className="md:col-span-2 rounded-3xl bg-[#111]/40 backdrop-blur-md border border-white/[0.05] p-8 relative overflow-hidden group hover:border-[#C9963A]/30 transition-colors duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#C9963A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-[#C9963A]/10 border border-[#C9963A]/20 text-[#C9963A] flex items-center justify-center mb-auto shadow-[0_0_15px_rgba(201,150,58,0.1)]">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Global Contest Arena</h3>
                                    <p className="text-zinc-400 text-sm max-w-sm">Compete in weekly algorithmic challenges. Climb the global leaderboard and earn badges to show off your skills.</p>
                                </div>
                            </div>
                            <div className="absolute right-[-5%] bottom-[-20%] w-72 h-64 bg-[#0a0a0a] rounded-tl-3xl border-t border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 transform rotate-[-5deg] group-hover:rotate-0 group-hover:-translate-y-2 transition-all duration-500 flex flex-col gap-3">
                                <div className="w-full h-10 bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="w-3/4 h-10 bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="w-full h-10 bg-[#C9963A]/20 rounded-xl border border-[#C9963A]/30 flex items-center px-4"><div className="w-4 h-4 rounded-full bg-[#C9963A] animate-pulse"></div></div>
                            </div>
                        </div>

                        {/* Box 2: Editorials */}
                        <div className="rounded-3xl bg-[#111]/40 backdrop-blur-md border border-white/[0.05] p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-auto shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform duration-500">
                                    <Play size={24} fill="currentColor" className="ml-1" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Premium Editorials</h3>
                                    <p className="text-zinc-400 text-sm">Deep-dive video solutions explaining intuition and time-complexity.</p>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Code Execution */}
                        <div className="rounded-3xl bg-[#111]/40 backdrop-blur-md border border-white/[0.05] p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-auto shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                                    <Terminal size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Lightning Fast Env</h3>
                                    <p className="text-zinc-400 text-sm">Judge0 integration runs your C++, Java, or Python code in milliseconds.</p>
                                </div>
                            </div>
                        </div>

                        {/* Box 4: Analytics */}
                        <div className="md:col-span-2 rounded-3xl bg-[#111]/40 backdrop-blur-md border border-white/[0.05] p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-auto shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h3>
                                    <p className="text-zinc-400 text-sm max-w-sm">Track your submission heatmaps, monitor acceptance rates, and visually see your logic improving.</p>
                                </div>
                            </div>
                             <div className="absolute right-0 bottom-0 w-1/2 h-32 bg-gradient-to-t from-blue-500/20 to-transparent opacity-50 border-t border-blue-500/30 blur-[1px] group-hover:h-40 transition-all duration-500"></div>
                        </div>
                    </div>
                </section>

                {/* ── 5. FINAL CONDITIONAL CTA ── */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#C9963A]/5 blur-[100px] rounded-full w-[600px] h-[300px] left-1/2 -translate-x-1/2"></div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">Stop thinking. <span className="text-[#C9963A]">Start coding.</span></h2>
                        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of developers leveling up their algorithm skills every single day. Your next big career move starts with a single compiled line.
                        </p>
                        
                        {/* Dynamic Button based on Auth state */}
                        {!isAuthenticated ? (
                            <button 
                                onClick={() => navigate('/signup')}
                                className="px-10 py-5 rounded-2xl bg-[#C9963A] text-black font-bold text-xl hover:bg-[#E0B455] hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_40px_rgba(201,150,58,0.4)]"
                            >
                                Create Free Account
                            </button>
                        ) : (
                            <button 
                                onClick={() => navigate('/problems')}
                                className="px-10 py-5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_40px_rgba(255,255,255,0.05)] flex items-center justify-center gap-3 mx-auto"
                            >
                                Go to Dashboard <ArrowRight size={24} />
                            </button>
                        )}
                    </div>
                </section>

            </main>

            {/* ── WATCH INTRO MODAL (CAROUSEL) ── */}
            <AnimatePresence>
                {isIntroOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
                        onClick={() => setIsIntroOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden max-w-5xl w-full shadow-[0_20px_70px_rgba(0,0,0,0.8)] flex flex-col relative"
                            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing modal
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsIntroOpen(false)}
                                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Carousel Image Area */}
                            <div className="w-full aspect-video bg-black relative overflow-hidden flex items-center justify-center border-b border-white/5">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentSlide}
                                        src={introSlides[currentSlide].image}
                                        alt={introSlides[currentSlide].title}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="w-full h-full object-cover object-top opacity-90"
                                    />
                                </AnimatePresence>
                            </div>

                            {/* Carousel Text Area */}
                            <div className="p-8 bg-gradient-to-br from-[#161616] to-[#0a0a0a] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex gap-2 mb-3">
                                        {introSlides.map((_, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setCurrentSlide(idx)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#C9963A]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-white mb-2">
                                        {introSlides[currentSlide].title}
                                    </h3>
                                    <p className="text-zinc-400 text-sm max-w-2xl">
                                        {introSlides[currentSlide].desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FOOTER COMPONENT ── */}
            <Footer />
            
        </div>
    );
}

export default Homepage;