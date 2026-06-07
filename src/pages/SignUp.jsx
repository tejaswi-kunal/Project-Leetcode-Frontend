import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { registerUser } from "../redux/authSlice";
import { Eye, EyeOff, AlertCircle } from "lucide-react"; // NEW: Lucide Imports
import Header from "../components/Header"; // NEW: Header Import

const userSchema = z.object({
    userName: z.string().min(3, "At least 3 characters required"),
    emailId: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Minimum 8 characters required")
});

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
);

const GitHubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
);

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error, isAuthenticated } = useSelector((state) => state.authSlice);

    useEffect(() => {
        if (isAuthenticated) {
            // SMART REDIRECT
            const origin = location.state?.from?.pathname || '/';
            navigate(origin, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema)
    });

    const submittedData = (data) => {
        dispatch(registerUser(data));
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#080808]">
            <Header /> {/* NEW: Header integration */}

            <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#C9963A]/8 blur-[100px]" />
                    <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#C9963A]/5 blur-[80px]" />
                </div>

                {/* Card */}
                <div className="relative z-10 w-full max-w-md bg-[#111] border border-white/[0.06] rounded-3xl p-8 shadow-2xl hover:border-[#C9963A]/25 transition-colors duration-300">
                    
                    {/* Header with font-display */}
                    <div className="text-center mb-8">
                        <p className="font-display text-[#C9963A] text-[10px] tracking-widest uppercase mb-2 font-bold">
                            New Account
                        </p>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">
                            Create Account
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Join thousands of coders improving every day.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(submittedData)} className="flex flex-col gap-4">

                        {/* Username */}
                        <div className="flex flex-col gap-1.5">
                            <input
                                type="text"
                                {...register("userName")}
                                placeholder="Username"
                                className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9963A]/60 focus:bg-white/[0.05] transition-all duration-200"
                            />
                            {errors.userName && <span className="text-red-400 text-xs pl-1 font-medium">{errors.userName.message}</span>}
                        </div>

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

                        {/* Error Alert using Lucide AlertCircle */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
                                <AlertCircle size={16} className="text-red-400 shrink-0" />
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl py-3 mt-2 bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(201,150,58,0.35)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="loading loading-spinner loading-xs border-black" />
                                    Creating account...
                                </span>
                            ) : "Create Account"}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center my-2">
                            <div className="flex-grow border-t border-white/[0.06]"></div>
                            <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] tracking-widest uppercase font-bold">or continue with</span>
                            <div className="flex-grow border-t border-white/[0.06]"></div>
                        </div>

                        {/* Social */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Google", Icon: GoogleIcon },
                                { label: "GitHub", Icon: GitHubIcon }
                            ].map(({ label, Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-400 text-sm font-semibold hover:border-[#C9963A]/40 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                                >
                                    <Icon /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <p className="text-center text-zinc-500 text-xs mt-3">
                            Already have an account?{" "}
                            <span onClick={() => navigate('/login')} className="text-[#C9963A] cursor-pointer hover:text-[#E0B455] transition-colors duration-200 font-bold">
                                Sign in
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp;