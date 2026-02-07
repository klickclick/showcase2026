import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, Loader2 } from 'lucide-react';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerName: string;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, playerName }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const myForm = e.currentTarget;
        const formData = new FormData(myForm);

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData as any).toString(),
        })
            .then(() => {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false); // Reset for next time
                    setIsSubmitting(false);
                }, 2000);
            })
            .catch((error) => {
                alert(error);
                setIsSubmitting(false);
            });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative w-full max-w-md bg-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
                            <h3 className="text-white font-display font-bold uppercase tracking-wider">
                                Request Player Info
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6">
                            {success ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                                    >
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </motion.div>
                                    <h4 className="text-white font-bold text-xl mb-2">Request Sent!</h4>
                                    <p className="text-gray-400">We'll get back to you shortly.</p>
                                </div>
                            ) : (
                                <form
                                    name="coach-request"
                                    method="POST"
                                    data-netlify="true"
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <input type="hidden" name="form-name" value="coach-request" />
                                    <input type="hidden" name="subject" value={`New Request for ${playerName}`} />

                                    {/* Player Name (Read-only) */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">
                                            Target Player
                                        </label>
                                        <input
                                            type="text"
                                            name="player_name"
                                            value={playerName}
                                            readOnly
                                            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white/50 font-bold focus:outline-none"
                                        />
                                    </div>

                                    {/* Coach Name */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">
                                            Coach Name
                                        </label>
                                        <input
                                            type="text"
                                            name="coach_name"
                                            required
                                            placeholder="e.g. John Smith"
                                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-volt transition-colors"
                                        />
                                    </div>

                                    {/* University / Club */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">
                                            University / Club
                                        </label>
                                        <input
                                            type="text"
                                            name="organization"
                                            required
                                            placeholder="e.g. University of Florida"
                                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-volt transition-colors"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="coach@university.edu"
                                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-volt transition-colors"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="text-xs text-gray-400 text-center px-1">
                                        You will receive all information and contact details about the player via email after the showcase.
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-2 bg-volt text-black font-bold uppercase tracking-wider py-3 rounded hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Request <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RequestModal;
