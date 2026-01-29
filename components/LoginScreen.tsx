import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (password: string) => Promise<boolean>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        const success = await onLogin(password);

        if (!success) {
            setError(true);
            setIsLoading(false);
        }
        // If success, parent comp handles unmounting, so no need to set loading false
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
            >
                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-volt blur-[80px] opacity-20 rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <ShieldCheck className="w-8 h-8 text-volt" />
                            </motion.div>
                        ) : (
                            <Lock className="w-8 h-8 text-volt" />
                        )}
                    </div>

                    <h1 className="text-3xl font-display font-bold uppercase text-white mb-2">
                        Restricted Access
                    </h1>
                    <p className="text-gray-400 text-sm mb-8 px-4">
                        This showcase is password protected for authorized scouts and coaches only.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="relative">
                            <motion.input
                                type="password"
                                placeholder="Enter Access Code"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(false);
                                }}
                                className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-white/10 focus:border-volt'} rounded-lg px-4 py-4 text-center text-white placeholder-gray-600 outline-none transition-all font-mono tracking-widest text-lg`}
                                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className={`w-full bg-volt text-black font-bold uppercase tracking-widest py-4 rounded-lg flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95 transition-all text-sm ${isLoading || !password ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span>{isLoading ? 'Verifying...' : 'Unlock Showcase'}</span>
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 w-full">
                        <p className="text-[10px] uppercase tracking-widest text-gray-600">
                            Secured by Athletes USA
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginScreen;
