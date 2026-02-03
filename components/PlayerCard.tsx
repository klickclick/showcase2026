import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types';
import { ArrowLeft, MapPin, Shield, Activity, GraduationCap, Calendar } from 'lucide-react';

interface PlayerCardProps {
    player: Player;
    onBack: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onBack }) => {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen w-full relative bg-black flex flex-col md:flex-row overflow-x-hidden"
        >
            {/* Sticky Mobile Back Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-4 right-4 z-50 md:hidden bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 text-white active:scale-90 transition-all"
                onClick={onBack}
            >
                <ArrowLeft className="w-6 h-6" />
            </motion.button>

            {/* Left Side - Image (Reduced height on mobile) */}
            <div className="w-full h-[55vh] md:w-1/2 md:h-screen relative flex-shrink-0">
                <motion.div
                    initial={{ scale: 1.1, filter: 'grayscale(100%)' }}
                    animate={{ scale: 1, filter: 'grayscale(0%)' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    <img
                        src={player.image}
                        alt={player.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            console.log("Image failed to load:", player.image);
                            e.currentTarget.style.display = 'none'; // Hide broken image to show what's behind or fallback handled differently
                            e.currentTarget.parentElement?.classList.add('bg-gray-800'); // Fallback background
                        }}
                        className="w-full h-full object-cover object-center md:object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-100 md:opacity-80"></div>
                </motion.div>

                {/* Desktop Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onClick={onBack}
                    className="hidden md:flex absolute top-24 left-12 z-20 items-center space-x-2 text-white hover:text-volt transition-colors bg-black/50 backdrop-blur-md px-4 py-2 rounded-full"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="uppercase font-bold tracking-widest text-xs">Back to Squad</span>
                </motion.button>
            </div>

            {/* Right Side - Info */}
            <div className="w-full md:w-1/2 h-auto md:h-screen relative z-10 flex flex-col bg-black md:bg-transparent -mt-12 md:mt-0 rounded-t-3xl md:rounded-none overflow-visible">
                <div className="px-6 py-8 md:px-16 md:py-12 md:overflow-y-auto h-full scrollbar-hide">

                    {/* Header Number & Pos */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center gap-3 mb-2 md:mb-4"
                    >
                        <span className="text-volt font-display font-bold text-5xl md:text-8xl">#{player.number}</span>
                        <span className="text-white/80 font-sans font-bold uppercase tracking-widest text-xs md:text-sm border border-white/20 px-3 py-1 rounded bg-surface/50 backdrop-blur-sm">
                            {player.position}
                        </span>
                    </motion.div>

                    {/* Name */}
                    <motion.h1
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-7xl font-display font-bold uppercase leading-[0.9] md:tracking-wide mb-6 text-white"
                    >
                        {player.name}
                    </motion.h1>

                    {/* Compact Bio Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-surface/30 p-4 rounded-lg border border-white/5">
                        <div className="flex items-center space-x-3 text-sm">
                            <MapPin className="w-4 h-4 text-volt flex-shrink-0" />
                            <span className="text-gray-400 uppercase tracking-wider text-[10px] md:text-xs">From:</span>
                            <span className="text-white font-bold truncate">{player.origin}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Shield className="w-4 h-4 text-volt flex-shrink-0" />
                            <span className="text-gray-400 uppercase tracking-wider text-[10px] md:text-xs">Club:</span>
                            <span className="text-white font-bold truncate">{player.currentTeam}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Calendar className="w-4 h-4 text-volt flex-shrink-0" />
                            <span className="text-gray-400 uppercase tracking-wider text-[10px] md:text-xs">Born:</span>
                            <span className="text-white font-bold truncate">
                                {player.dob} {(() => {
                                    if (!player.dob) return '';
                                    try {
                                        // Handle "DD.MM.YYYY" or "YYYY-MM-DD"
                                        const now = new Date();
                                        let birthDate: Date;

                                        if (player.dob.includes('.')) {
                                            const parts = player.dob.split('.');
                                            // Assume DD.MM.YYYY
                                            birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                                        } else {
                                            birthDate = new Date(player.dob);
                                        }

                                        if (isNaN(birthDate.getTime())) return '';

                                        let age = now.getFullYear() - birthDate.getFullYear();
                                        const m = now.getMonth() - birthDate.getMonth();
                                        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
                                            age--;
                                        }
                                        return <span className="text-gray-500 font-normal ml-1">({age})</span>;
                                    } catch (e) {
                                        return '';
                                    }
                                })()}
                            </span>
                        </div>
                    </div>

                    {player.bio && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="prose prose-invert prose-sm md:prose-lg mb-8"
                        >
                            <p className="text-gray-300 font-light leading-relaxed">
                                {player.bio}
                            </p>
                        </motion.div>
                    )}

                    {/* Vitals Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-3 md:gap-4 mb-8"
                    >
                        <div className="bg-surface border border-white/10 p-3 md:p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Height</span>
                                <Activity className="w-3 h-3 text-volt" />
                            </div>
                            <span className="text-white font-display text-lg md:text-2xl tracking-wide">{player.height}</span>
                        </div>
                        <div className="bg-surface border border-white/10 p-3 md:p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Foot</span>
                                <Activity className="w-3 h-3 text-volt" />
                            </div>
                            <span className="text-white font-display text-lg md:text-2xl tracking-wide">{player.foot}</span>
                        </div>
                        <div className="bg-surface border border-white/10 p-3 md:p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">GPA</span>
                                <GraduationCap className="w-3 h-3 text-volt" />
                            </div>
                            <span className="text-white font-display text-lg md:text-2xl tracking-wide">{player.gpa}</span>
                        </div>
                        <div className="bg-surface border border-white/10 p-3 md:p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Recruiting Class</span>
                                <GraduationCap className="w-3 h-3 text-volt" />
                            </div>
                            <span className="text-white font-display text-lg md:text-2xl tracking-wide">{player.eligibility}</span>
                        </div>
                    </motion.div>

                    {/* Combine Results Grid */}
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-volt font-sans font-bold uppercase text-xs tracking-[0.2em] mb-4 border-b border-white/10 pb-2"
                    >
                        Official Combine Results
                    </motion.h3>

                    <div className="grid grid-cols-1 gap-5 pb-20">
                        {player.stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
                                className="group"
                            >
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-gray-400 uppercase text-[10px] md:text-xs font-bold tracking-widest group-hover:text-white transition-colors">
                                        {stat.label}
                                    </span>
                                    <span className="text-white font-sans font-bold text-base md:text-lg text-shadow-glow">
                                        {stat.displayValue}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 md:h-2 bg-gray-900 rounded-full overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stat.value}%` }}
                                        transition={{ delay: 0.8 + (index * 0.1), duration: 1, ease: "circOut" }}
                                        className="h-full bg-volt shadow-[0_0_8px_rgba(210,255,0,0.5)]"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PlayerCard;