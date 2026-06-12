import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { loginUser } from "../redux/authSlice";
import { Eye, EyeOff, AlertCircle } from "lucide-react"; // NEW: Lucide Imports
import Header from "../components/Header"; // NEW: Header Import
 
const userSchema = z.object({
    emailId: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Minimum 8 characters required")
});
 
 
function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Extracted location to handle smart redirects
 
    const { loading, error, isAuthenticated } = useSelector((state) => state.authSlice);
 
    useEffect(() => {
        if (isAuthenticated) {
            // SMART REDIRECT: Go back to where they came from, or default to homepage
            const origin = location.state?.from?.pathname || '/';
            navigate(origin, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);
 
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema)
    });
 
    const submittedData = (data) => {
        dispatch(loginUser(data));
    };
 
    return (
        <div className="min-h-screen flex flex-col bg-[#080808]">
            <Header /> {/* NEW: Header integration */}
            
            <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#C9963A]/8 blur-[100px]" />
                    <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#C9963A]/5 blur-[80px]" />
                </div>
    
                {/* Card */}
                <div className="relative z-10 w-full max-w-md bg-[#111] border border-white/[0.06] rounded-3xl p-8 shadow-2xl hover:border-[#C9963A]/25 transition-colors duration-300">
                    
                    {/* Header with font-display */}
                    <div className="text-center mb-8">
                        <p className="font-display text-[#C9963A] text-[10px] tracking-widest uppercase mb-2 font-bold">
                            Welcome Back
                        </p>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">
                            Sign In
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Good to see you again. Let's get coding.
                        </p>
                    </div>
    
                    <form onSubmit={handleSubmit(submittedData)} className="flex flex-col gap-4">
    
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <input
                                type="email"
                                {...register("emailId")}
                                placeholder="Email Address"
                                className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9963A]/60 focus:bg-white/[0.05] transition-all duration-200"
                            />
                            {errors.emailId && <span className="text-red-400 text-xs pl-1 font-medium">{errors.emailId.message}</span>}
                        </div>
    
                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder="Password"
                                    className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9963A]/60 focus:bg-white/[0.05] transition-all duration-200 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#C9963A] transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} {/* NEW: Lucide Icon */}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-400 text-xs pl-1 font-medium">{errors.password.message}</span>}
                        </div>
    
                        <div className="text-right -mt-1">
                            <span className="text-zinc-500 text-xs cursor-pointer hover:text-[#C9963A] transition-colors duration-200 font-medium">
                                Forgot password?
                            </span>
                        </div>
    
                        {/* Error Alert using Lucide AlertCircle */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
                                <AlertCircle size={16} className="text-red-400 shrink-0" />
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </div>
                        )}
    
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl py-3 mt-2 bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(201,150,58,0.35)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="loading loading-spinner loading-xs border-black" />
                                    Signing in...
                                </span>
                            ) : "Sign In"}
                        </button>
    
                        <p className="text-center text-zinc-500 text-xs mt-3">
                            Don't have an account?{" "}
                            <span onClick={() => navigate('/signup')} className="text-[#C9963A] cursor-pointer hover:text-[#E0B455] transition-colors duration-200 font-bold">
                                Create one
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
 
export default Login;