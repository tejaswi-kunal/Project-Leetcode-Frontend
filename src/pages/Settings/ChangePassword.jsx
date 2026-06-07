import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "../../components/Header";
import axiosClient from "../../utils/axiosClient";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "Must be at least 8 characters long")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function ChangePassword() {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null); 
    
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(passwordSchema),
        mode: "onChange" 
    });

    const newPwd = watch("newPassword", "");
    const confirmPwd = watch("confirmPassword", "");
    
    const isMatching = newPwd.length > 0 && newPwd === confirmPwd;

    const onSubmit = async (data) => {
        setStatus(null);
        try {
            await axiosClient.put('/auth/changePassword', {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            });
            setStatus({ type: "success", msg: "Password changed successfully!" });
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setStatus({ type: "error", msg: err.response?.data || "Failed to change password." });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans relative selection:bg-[#C9963A] selection:text-black flex flex-col">
            
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />
            
            {/* Reduced vertical padding here to fit on smaller screens without scrolling */}
            <div className="relative z-10 max-w-xl mx-auto px-4 py-8 md:py-10 w-full flex-1 flex flex-col justify-center">
                
                {/* Slimmed down internal padding */}
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#C9963A] to-zinc-800"></div>

                    {/* Slimmed down Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 mx-auto flex items-center justify-center mb-3 shadow-inner">
                            <KeyRound size={22} className="text-[#C9963A]" />
                        </div>
                        <h2 className="font-display text-2xl font-black text-white tracking-wide mb-1">Update Password</h2>
                        <p className="text-zinc-500 font-medium text-[13px]">Your security is in your hands. Choose a strong password.</p>
                    </div>

                    {/* Tighter Disclaimer Box */}
                    <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-3.5 mb-6 flex items-start gap-3">
                        <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-display text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-0.5">Security Requirements</p>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">At least <strong className="text-zinc-200">8 characters</strong>, <strong className="text-zinc-200">one number</strong>, and <strong className="text-zinc-200">one special character</strong> (e.g., !@#$%^&*).</p>
                        </div>
                    </div>
                    
                    {status?.msg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-xl mb-5 text-xs font-bold flex items-center gap-2 shadow-lg ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20'}`}>
                            {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                            {status.msg}
                        </motion.div>
                    )}

                    {/* Tighter form spacing */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        <div className="flex flex-col gap-1 relative">
                            <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Password</label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                {/* Reduced input padding py-2.5 */}
                                <input 
                                    type={showOld ? "text" : "password"} 
                                    {...register("oldPassword")}
                                    placeholder="Enter current password"
                                    className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-12 py-2.5 text-zinc-200 font-mono text-sm focus:outline-none transition-all shadow-sm ${errors.oldPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`}
                                />
                                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {errors.oldPassword && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.oldPassword.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1 relative">
                            <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Password</label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9963A]/70 pointer-events-none" />
                                <input 
                                    type={showNew ? "text" : "password"} 
                                    {...register("newPassword")}
                                    placeholder="e.g. 8+ chars, 1 number, 1 symbol"
                                    className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-12 py-2.5 text-zinc-200 font-mono text-sm focus:outline-none transition-all shadow-sm ${errors.newPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`}
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {errors.newPassword && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.newPassword.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1 relative">
                            <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confirm New Password</label>
                            <div className="relative">
                                {isMatching ? (
                                    <CheckCircle2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] pointer-events-none transition-all duration-300 scale-110" />
                                ) : (
                                    <CheckCircle2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none transition-all duration-300" />
                                )}
                                
                                <input 
                                    type={showConfirm ? "text" : "password"} 
                                    {...register("confirmPassword")}
                                    placeholder="Type your new password again"
                                    className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-12 py-2.5 text-zinc-200 font-mono text-sm focus:outline-none transition-all shadow-sm ${
                                        isMatching 
                                            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 focus:border-emerald-500/50' 
                                            : errors.confirmPassword 
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' 
                                                : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'
                                    }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.confirmPassword.message}</span>}
                        </div>

                        {/* Tighter Action Area */}
                        <div className="pt-6 mt-2 border-t border-zinc-800/80 flex justify-end gap-3">
                            <button type="button" onClick={() => navigate('/profile')} className="px-5 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-[13px] font-bold">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold shadow-[0_0_20px_rgba(201,150,58,0.2)] disabled:opacity-50 disabled:shadow-none transition-all text-[13px] flex items-center gap-2">
                                {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : null}
                                {isSubmitting ? 'Securing...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default ChangePassword;