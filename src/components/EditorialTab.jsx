import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, PlayCircle, VideoOff } from 'lucide-react';

function EditorialTab({ problem }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    // Update current time during playback
    useEffect(() => {
        const video = videoRef.current;
        const handleTimeUpdate = () => {
            if (video) setCurrentTime(video.currentTime);
        };
        
        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            return () => video.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }, [problem?.secureUrl]);

    // ── PREMIUM EMPTY STATE ──
    if (!problem || !problem.secureUrl) {
        return (
            <div className="w-full bg-[#111] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] shadow-lg animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <VideoOff size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No Video Solution</h3>
                <p className="text-zinc-500 text-sm max-w-md text-center">
                    The editorial and video solution for this problem are currently being prepared. Check back soon!
                </p>
            </div>
        );
    }

    const { secureUrl, thumbnailUrl, duration } = problem;

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Calculate progress percentage for the custom purple track
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
            
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    <PlayCircle size={16} />
                </div>
                <h2 className="font-display text-xl font-bold text-white">Video Solution</h2>
            </div>

            {/* Premium Video Player */}
            <div 
                className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Actual Video Tag */}
                <video
                    ref={videoRef}
                    src={secureUrl}
                    poster={thumbnailUrl}
                    onClick={togglePlayPause}
                    className="w-full aspect-video cursor-pointer"
                />

                {/* Center Giant Play Button (Visible only when paused) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[2px] transition-all duration-300">
                        <div className="w-20 h-20 rounded-full bg-purple-600/90 flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] pl-1.5 transform scale-100 group-hover:scale-110 transition-transform duration-300 backdrop-blur-md">
                            <Play size={40} fill="currentColor" />
                        </div>
                    </div>
                )}
                
                {/* Bottom Controls Bar (Glassmorphic) */}
                <div 
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-6 pb-6 pt-16 transition-opacity duration-300 ${
                        isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div className="flex items-center gap-5">
                        
                        {/* Small Play/Pause Toggle */}
                        <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md shrink-0"
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                        
                        {/* Custom Layered Progress Scrubber */}
                        <div className="flex items-center w-full gap-4 relative group/slider">
                            {/* Current Time */}
                            <span className="text-white text-xs font-mono w-10 text-right shrink-0">
                                {formatTime(currentTime)}
                            </span>
                            
                            {/* Scrubber Area */}
                            <div className="relative w-full h-4 flex items-center cursor-pointer">
                                
                                {/* 1. The background track (dim white) */}
                                <div className="absolute w-full h-1.5 bg-white/20 rounded-full overflow-hidden pointer-events-none">
                                    
                                    {/* 2. The filled track (Purple) */}
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-75"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>

                                {/* 3. The actual invisible input range for accurate dragging math */}
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    step="0.1"
                                    value={currentTime}
                                    onChange={(e) => {
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = Number(e.target.value);
                                            setCurrentTime(Number(e.target.value));
                                        }
                                    }}
                                    onPointerDown={() => videoRef.current?.pause()}
                                    onPointerUp={() => { if(isPlaying) videoRef.current?.play() }}
                                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                />

                                {/* 4. The Glowing Thumb (Appears on hover) */}
                                <div 
                                    className="absolute h-3.5 w-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] pointer-events-none transition-transform transform scale-0 group-hover/slider:scale-100 z-0"
                                    style={{ left: `calc(${progressPercent}% - 7px)` }}
                                ></div>
                            </div>
                            
                            {/* Total Duration */}
                            <span className="text-zinc-500 text-xs font-mono w-10 shrink-0">
                                {formatTime(duration)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditorialTab;