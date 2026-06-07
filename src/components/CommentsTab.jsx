import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MessageSquare, Send, Trash2, Edit2, Check, X } from "lucide-react";
import axiosClient from "../utils/axiosClient";

function CommentsTab({ problemId }) {
    const { user } = useSelector((state) => state.authSlice);
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Edit States
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    const fetchComments = async () => {
        try {
            const res = await axiosClient.get(`/comment/getComments/${problemId}`);
            setComments(res.data.comments);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [problemId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await axiosClient.post(`/comment/addComment/${problemId}`, { text: newComment });
            setNewComment("");
            fetchComments(); 
        } catch (err) {
            console.error("Failed to add comment", err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await axiosClient.delete(`/comment/deleteComment/${commentId}`);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const startEditing = (comment) => {
        setEditingId(comment._id);
        setEditText(comment.text);
    };

    const handleSaveEdit = async (commentId) => {
        if (!editText.trim()) return;
        try {
            await axiosClient.put(`/comment/editComment/${commentId}`, { text: editText });
            setComments(prev => prev.map(c => c._id === commentId ? { ...c, text: editText } : c));
            setEditingId(null);
        } catch (err) {
            console.error("Failed to edit comment", err);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-10"><span className="loading loading-spinner text-[#C9963A]"></span></div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header - APPLIED font-display */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-[#C9963A]/10 border border-[#C9963A]/20 flex items-center justify-center">
                    <MessageSquare size={16} className="text-[#C9963A]" />
                </div>
                <h3 className="text-xl font-display font-bold text-white tracking-wide">Discussion</h3>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="mb-8 relative group">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your approach, ask a question, or leave a hint..."
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 pr-14 text-sm text-zinc-300 focus:outline-none focus:border-[#C9963A]/50 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(201,150,58,0.1)] resize-none min-h-[120px] transition-all duration-300 placeholder:text-zinc-600"
                ></textarea>
                <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute bottom-5 right-5 bg-[#C9963A] hover:bg-[#E0B455] text-black w-10 h-10 flex items-center justify-center rounded-xl disabled:opacity-50 disabled:hover:bg-[#C9963A] transition-all shadow-[0_0_10px_rgba(201,150,58,0.2)] hover:shadow-[0_0_20px_rgba(201,150,58,0.4)] disabled:shadow-none"
                >
                    <Send size={16} className={newComment.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={20} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 text-sm font-medium">No comments yet.</p>
                        <p className="text-zinc-600 text-xs mt-1">Be the first to start the discussion!</p>
                    </div>
                ) : (
                    comments.map(comment => {
                        const isOwner = comment.user?._id === user?._id;
                        const isEditing = editingId === comment._id;

                        return (
                            <div key={comment._id} className="bg-[#111] border border-white/[0.04] hover:border-white/10 rounded-2xl p-5 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#C9963A]/20 flex items-center justify-center shadow-inner">
                                            {/* Initials - APPLIED font-display */}
                                            <span className="text-[#C9963A] font-display text-xs font-bold tracking-wider uppercase">
                                                {comment.user?.userName?.slice(0, 2) || "?"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            {/* Username - APPLIED font-display */}
                                            <span className="text-sm font-display font-semibold text-zinc-200">
                                                {comment.user?.userName || "Unknown Hacker"}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
                                                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Owner */}
                                    {isOwner && !isEditing && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                                            <button onClick={() => startEditing(comment)} className="p-1.5 rounded-md text-zinc-500 hover:text-[#C9963A] hover:bg-[#C9963A]/10 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(comment._id)} className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Content Area */}
                                {isEditing ? (
                                    <div className="mt-4 relative animate-in fade-in slide-in-from-top-2 duration-200">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full bg-[#080808] border border-[#C9963A]/40 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#C9963A]/50 resize-none"
                                            rows={3}
                                        />
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <X size={14} /> Cancel
                                            </button>
                                            <button onClick={() => handleSaveEdit(comment._id)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#C9963A]/10 text-[#C9963A] hover:bg-[#C9963A] hover:text-black border border-[#C9963A]/20 hover:border-[#C9963A] transition-all">
                                                <Check size={14} /> Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap pl-11">
                                        {comment.text}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default CommentsTab;