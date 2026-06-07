import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "../../components/Header";
import axiosClient from "../../utils/axiosClient";
import { checkUser } from "../../redux/authSlice";
import { motion } from "framer-motion";
import { User, Image as ImageIcon, Link as LinkIcon, BookOpen, ShieldAlert, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";

// Zod Schema strictly matching your Mongoose Schema limits
const profileSchema = z.object({
    firstName: z.string().min(3, "Min 3 characters").max(50, "Max 50 characters").optional().or(z.literal('')),
    lastName: z.string().min(3, "Min 3 characters").max(50, "Max 50 characters").optional().or(z.literal('')),
    age: z.coerce.number().min(5, "Minimum age is 5").optional().or(z.literal('')),
    gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
    profilePicture: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    bio: z.string().max(300, "Bio cannot exceed 300 characters").optional().or(z.literal('')),
    college: z.string().max(100, "College name cannot exceed 100 characters").optional().or(z.literal('')),
    github: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    linkedin: z.string().url("Must be a valid URL").optional().or(z.literal(''))
});

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [accountLoading, setAccountLoading] = useState(true);
    
    // Read-only baseline state from the API fetch for username and email fields
    const [staticCredentials, setStaticCredentials] = useState({ userName: "", emailId: "" });

    const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting, isDirty, dirtyFields } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "", lastName: "", age: "", gender: "other", profilePicture: "", bio: "", college: "", github: "", linkedin: ""
        }
    });

    const profilePicUrl = watch("profilePicture");

    useEffect(() => {
        const fetchCurrentProfileData = async () => {
            try {
                const res = await axiosClient.get("/auth/getAccount");
                const userData = res.data?.user;

                if (userData) {
                    setStaticCredentials({
                        userName: userData.userName || "",
                        emailId: userData.emailId || ""
                    });

                    reset({
                        firstName: userData.firstName || "",
                        lastName: userData.lastName || "",
                        age: userData.age || "",
                        gender: userData.gender || "other",
                        profilePicture: userData.profilePicture || "",
                        bio: userData.bio || "",
                        college: userData.college || "",
                        github: userData.github || "",
                        linkedin: userData.linkedin || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch fresh account data for editing:", err);
                setStatus({ type: "error", msg: "Failed to load pre-existing profile details." });
            } finally {
                setAccountLoading(false);
            }
        };

        fetchCurrentProfileData();
    }, [reset]);

    const onSubmit = async (data) => {
        setStatus(null);

        // Only extract fields that the user actually changed
        const partialData = Object.keys(dirtyFields).reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
        }, {});

        if (Object.keys(partialData).length === 0) {
            setStatus({ type: "error", msg: "No fields were modified." });
            return;
        }

        try {
            await axiosClient.put('/auth/updateProfile', partialData);
            setStatus({ type: "success", msg: "Profile updated successfully!" });
            
            dispatch(checkUser()); 
            setTimeout(() => navigate('/profile'), 1500);

        } catch (err) {
            const errorMessage = err.response?.data || "Update failed.";
            const lowerError = errorMessage.toLowerCase();

            if (lowerError.includes("first name")) {
                setError("firstName", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else if (lowerError.includes("last name")) {
                setError("lastName", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else if (lowerError.includes("bio")) {
                setError("bio", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else if (lowerError.includes("age")) {
                setError("age", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else {
                setStatus({ type: "error", msg: errorMessage.replace("Error : ", "") });
            }
        }
    };

    if (accountLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-[#C9963A]"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 pb-12 font-sans relative selection:bg-[#C9963A] selection:text-black">
            
            {/* Glowing Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mt-12">
                
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
                    
                    {/* Header Section */}
                    <motion.div variants={sectionVariants}>
                        <h1 className="font-display text-4xl font-black text-white tracking-wide">Edit Profile</h1>
                        <p className="text-zinc-500 font-medium text-sm mt-2">Customize your presence and public identity on HackForge.</p>
                        
                        {status?.msg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-4 rounded-xl text-sm flex items-center gap-3 font-bold border backdrop-blur-sm shadow-lg ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5'}`}>
                                {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                {status.msg}
                            </motion.div>
                        )}
                    </motion.div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        
                        {/* 1. Account Identity (Read-Only) */}
                        <motion.div variants={sectionVariants} className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-zinc-700/80 transition-colors duration-300">
                            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700"></div>
                            <h3 className="font-display text-white font-bold mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert size={16} className="text-zinc-500" /> Account Credentials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Username</label>
                                    <input type="text" value={staticCredentials.userName} disabled className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed font-mono text-sm" />
                                </div>
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                                    <input type="email" value={staticCredentials.emailId} disabled className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed font-mono text-sm" />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-zinc-600 mt-5 bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/30">
                                Username and Email cannot be changed to preserve competitive submission integrity.
                            </p>
                        </motion.div>

                        {/* 2. Public Profile */}
                        <motion.div variants={sectionVariants} className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-[#C9963A]/30 transition-colors duration-300">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#C9963A]"></div>
                            <h3 className="font-display text-white font-bold mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                                <User size={16} className="text-[#C9963A]" /> Personal Information
                            </h3>
                            
                            {/* Profile Picture Row */}
                            <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                                <div className="w-24 h-24 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                                    {profilePicUrl ? (
                                        <img src={profilePicUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        <ImageIcon size={32} className="text-zinc-700" />
                                    )}
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Profile Picture URL</label>
                                    <input type="url" {...register("profilePicture")} placeholder="https://example.com/my-photo.jpg" className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 font-mono text-sm transition-all shadow-sm ${errors.profilePicture ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`} />
                                    {errors.profilePicture && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.profilePicture.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">First Name</label>
                                    <input type="text" {...register("firstName")} className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 text-sm font-medium transition-all shadow-sm ${errors.firstName ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`} />
                                    {errors.firstName && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.firstName.message}</span>}
                                </div>
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Last Name</label>
                                    <input type="text" {...register("lastName")} className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 text-sm font-medium transition-all shadow-sm ${errors.lastName ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`} />
                                    {errors.lastName && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.lastName.message}</span>}
                                </div>
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Age</label>
                                    <input type="number" {...register("age")} className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 font-mono text-sm transition-all shadow-sm ${errors.age ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`} />
                                    {errors.age && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.age.message}</span>}
                                </div>
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Gender</label>
                                    <div className="relative">
                                        <select {...register("gender")} className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-zinc-200 focus:outline-none focus:border-[#C9963A]/50 focus:bg-zinc-900 focus:ring-2 focus:ring-[#C9963A]/10 text-sm font-medium transition-all cursor-pointer shadow-sm">
                                            <option value="male" className="bg-zinc-900">Male</option>
                                            <option value="female" className="bg-zinc-900">Female</option>
                                            <option value="other" className="bg-zinc-900">Other</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. About & Education */}
                        <motion.div variants={sectionVariants} className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-300">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <h3 className="font-display text-white font-bold mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={16} className="text-emerald-500" /> Background
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Bio</label>
                                    <textarea {...register("bio")} rows="3" placeholder="Tell the community about yourself..." className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 text-sm font-medium transition-all shadow-sm resize-none ${errors.bio ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'}`}></textarea>
                                    {errors.bio && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.bio.message}</span>}
                                </div>
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">College / University</label>
                                    <input type="text" {...register("college")} className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 text-sm font-medium transition-all shadow-sm ${errors.college ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'}`} />
                                    {errors.college && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.college.message}</span>}
                                </div>
                            </div>
                        </motion.div>

                        {/* 4. Social Links */}
                        <motion.div variants={sectionVariants} className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors duration-300">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="font-display text-white font-bold mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                                <LinkIcon size={16} className="text-blue-500" /> Links
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">GitHub URL</label>
                                    <input type="url" {...register("github")} placeholder="https://github.com/..." className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 font-mono text-sm transition-all shadow-sm ${errors.github ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'}`} />
                                    {errors.github && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.github.message}</span>}
                                </div>
                                <div>
                                    <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">LinkedIn URL</label>
                                    <input type="url" {...register("linkedin")} placeholder="https://linkedin.com/in/..." className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:bg-zinc-900 font-mono text-sm transition-all shadow-sm ${errors.linkedin ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'}`} />
                                    {errors.linkedin && <span className="font-display text-red-400 text-[10px] uppercase tracking-wider mt-2 block font-bold">{errors.linkedin.message}</span>}
                                </div>
                            </div>
                        </motion.div>

                        {/* Sticky Action Footer */}
                        <motion.div variants={sectionVariants} className="sticky bottom-8 z-20 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex justify-end gap-4 items-center">
                            {isDirty && <span className="font-display text-[10px] uppercase tracking-widest text-zinc-400 font-bold mr-auto pl-2">Unsaved changes</span>}
                            
                            <button type="button" onClick={() => navigate('/profile')} className="px-6 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-bold">
                                Cancel
                            </button>
                            
                            <button type="submit" disabled={isSubmitting || !isDirty} className="px-8 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold shadow-[0_0_20px_rgba(201,150,58,0.3)] disabled:opacity-50 disabled:shadow-none transition-all text-sm flex items-center gap-2">
                                {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : null}
                                {isSubmitting ? 'Saving Updates...' : 'Save Changes'}
                            </button>
                        </motion.div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default EditProfile;