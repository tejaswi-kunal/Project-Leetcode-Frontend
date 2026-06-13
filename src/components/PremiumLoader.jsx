import { motion } from "framer-motion";

function PremiumLoader() {
    return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden z-50">
            
            {/* 1. Ambient Background Pulse */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.15, 0.05]
                    }}
                    transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-72 h-72 bg-[#C9963A] rounded-full blur-[100px]"
                />
            </div>

            {/* 2. Main Loading Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center gap-8"
            >
                {/* Breathing SVG Icon */}
                <motion.div 
                    animate={{ 
                        opacity: [0.7, 1, 0.7],
                        scale: [0.97, 1.03, 0.97] 
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="drop-shadow-[0_0_30px_rgba(201,150,58,0.2)]"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 32 32" 
                        className="w-20 h-20 md:w-24 md:h-24 shrink-0"
                    >
                        <defs>
                            <radialGradient id="bgGlowLoader" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#C9963A" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#C9963A" stopOpacity="0" />
                            </radialGradient>

                            <linearGradient id="borderGradLoader" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#C9963A" stopOpacity="0.9" />
                                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
                                <stop offset="100%" stopColor="#C9963A" stopOpacity="0.4" />
                            </linearGradient>

                            <linearGradient id="slashGradLoader" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#B8860B" />
                                <stop offset="50%" stopColor="#FDE047" /> 
                                <stop offset="100%" stopColor="#C9963A" />
                            </linearGradient>

                            <filter id="slashGlowLoader" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        <rect x="2" y="2" width="28" height="28" rx="8" fill="#0A0A0A" />
                        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#bgGlowLoader)" />
                        <rect x="2" y="2" width="28" height="28" rx="8" fill="none" stroke="url(#borderGradLoader)" strokeWidth="1.2" />

                        <polyline 
                            points="12 10 7 16 12 22" 
                            fill="none" 
                            stroke="#F4F4F5" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <polyline 
                            points="20 10 25 16 20 22" 
                            fill="none" 
                            stroke="#F4F4F5" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <line 
                            x1="18" y1="7" 
                            x2="14" y2="25" 
                            fill="none" 
                            stroke="url(#slashGradLoader)" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            filter="url(#slashGlowLoader)" 
                        />
                    </svg>
                </motion.div>

                {/* Loader Bar & Text Container */}
                <div className="flex flex-col items-center gap-3 mt-2">
                    {/* Premium Sweeping Loader Bar */}
                    <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(201,150,58,0.1)]">
                        <motion.div
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-[#C9963A] to-transparent w-1/2"
                            animate={{ 
                                x: ["-100%", "200%"]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                    
                    {/* Hacker-style Subtext */}
                    <motion.span 
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]"
                    >
                        Initializing Environment
                    </motion.span>
                </div>

            </motion.div>
        </div>
    );
}

export default PremiumLoader;