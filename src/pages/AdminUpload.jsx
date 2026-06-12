import { useParams, useNavigate } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { UploadCloud, FileVideo, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

function AdminUpload() {
    // Note: ensure this matches your App.js route parameter exactly (e.g., /admin/videos/upload/:id)
    const { id: problemId } = useParams(); 
    const navigate = useNavigate();
    
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [serverError, setServerError] = useState('');
    
    const { register, handleSubmit, watch, formState: { errors }, reset, clearErrors } = useForm();
    
    const selectedFile = watch('videoFile')?.[0];
    
    const onSubmit = async (data) => {
        const file = data.videoFile[0];
        
        setUploading(true);
        setUploadProgress(0);
        setServerError('');
        clearErrors();
    
        try {
            // Step 1: Get upload signature from backend
            const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
            const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;
    
            // Step 2: Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
            formData.append('api_key', api_key);
    
            // Step 3: Upload directly to Cloudinary
            const uploadResponse = await axios.post(upload_url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });
    
            const cloudinaryResult = uploadResponse.data;
    
            // Step 4: Save video metadata to backend
            await axiosClient.post('/video/save', {
                problemId: problemId,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secure_url,
                duration: cloudinaryResult.duration,
            });
    
            setSuccessMessage("Video uploaded and linked successfully!");
            reset();
            
            // Auto-redirect after 4 seconds
            setTimeout(() => {
                navigate("/admin/videos");
            }, 4000);
            
        } catch (err) {
            console.error('Upload error:', err);
            setServerError(err.response?.data?.message || 'Upload failed. Please try again.');
            
            setTimeout(() => setServerError(''), 4000);
        } finally {
            setUploading(false);
        }
    };
    
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white pb-20 relative animate-in fade-in duration-500">
            
            {/* ── CENTERED SUCCESS MODAL ── */}
            {successMessage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-purple-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(168,85,247,0.15)] flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">Upload Complete!</h3>
                        <p className="text-zinc-400 text-sm mb-6">{successMessage}</p>
                        <div className="w-full bg-[#161618] h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full animate-[shrink_4s_linear_forwards]" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CENTERED ERROR MODAL ── */}
            {serverError && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setServerError("")}>
                    <div className="bg-[#111] border border-red-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(239,68,68,0.15)] flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">Upload Failed</h3>
                        <p className="text-zinc-400 text-sm mb-6">{serverError}</p>
                        <button onClick={() => setServerError("")} className="w-full py-3 rounded-xl bg-[#161618] hover:bg-white/5 border border-white/10 text-zinc-300 font-bold text-sm transition-colors">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Back Button & Header */}
            <div className="mb-8">
                <button onClick={() => navigate('/admin/videos')} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Video Management
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <UploadCloud size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Upload Video Solution</h1>
                </div>
                <p className="text-purple-400 font-medium text-sm bg-purple-500/10 border border-purple-500/20 inline-block px-4 py-2 rounded-lg mt-2">
                    Select a high-quality .mp4 file to stream directly to Cloudinary.
                </p>
            </div>

            {/* Main Form Area */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-lg">
                
                {/* Custom File Dropzone Area */}
                <div className="relative group cursor-pointer mb-6">
                    <input
                        type="file"
                        accept="video/*"
                        {...register('videoFile', {
                            required: 'Please select a video file',
                            validate: {
                                isVideo: (files) => {
                                    if (!files || !files[0]) return 'Please select a video file';
                                    return files[0].type.startsWith('video/') || 'Please select a valid video file (.mp4, .webm)';
                                },
                                fileSize: (files) => {
                                    if (!files || !files[0]) return true;
                                    const maxSize = 100 * 1024 * 1024; // 100MB
                                    return files[0].size <= maxSize || 'File size must be less than 100MB';
                                }
                            }
                        })}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    
                    <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all duration-300 ${errors.videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-[#161618] group-hover:border-purple-500/50 group-hover:bg-purple-500/5'}`}>
                        {selectedFile ? (
                            <>
                                <FileVideo size={48} className="text-purple-400 mb-4" />
                                <p className="text-white font-bold text-lg mb-1 text-center">{selectedFile.name}</p>
                                <p className="text-zinc-500 text-sm font-mono">{formatFileSize(selectedFile.size)}</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={48} className="text-zinc-600 mb-4 group-hover:text-purple-400 transition-colors" />
                                <p className="text-white font-bold text-lg mb-1 text-center">Click or drag video to upload</p>
                                <p className="text-zinc-500 text-sm">MP4, WebM, or OGG (Max 100MB)</p>
                            </>
                        )}
                    </div>
                </div>

                {errors.videoFile && (
                    <p className="text-red-400 text-sm flex items-center gap-1.5 mb-6 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <AlertCircle size={16} /> {errors.videoFile.message}
                    </p>
                )}

                {/* Progress Bar Area */}
                {uploading && (
                    <div className="mb-8 p-4 bg-[#161618] border border-white/5 rounded-xl">
                        <div className="flex justify-between text-sm font-bold mb-3">
                            <span className="text-zinc-300 flex items-center gap-2">
                                <span className="loading loading-spinner loading-xs text-purple-400"></span> 
                                Uploading to Cloudinary...
                            </span>
                            <span className="text-purple-400 font-mono">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-white/5">
                            <div 
                                className="bg-purple-500 h-full rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${uploadProgress}%` }}
                            >
                                <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={uploading || !selectedFile || successMessage !== ""}
                    className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-all disabled:opacity-50 disabled:hover:bg-purple-600 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                >
                    {uploading ? 'Processing Upload...' : 'Begin Upload'}
                </button>
            </form>
        </div>
    );
}

export default AdminUpload;