import React from 'react';
import { motion } from 'framer-motion';
import { Team, Player } from '../types';
import { ArrowLeft, ChevronRight, BadgeCheck } from 'lucide-react';

interface PlayerListProps {
    team: Team;
    onSelectPlayer: (player: Player) => void;
    onBack: () => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ team, onSelectPlayer, onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.05, right: 0.2 }}
            onDragEnd={(_, info) => {
                if (info.offset.x > 100 && info.velocity.x > 20) {
                    onBack();
                }
            }}
            className="min-h-screen w-full relative pt-24 md:pt-32 pb-12 px-0 md:px-12 flex flex-col bg-black touch-pan-y"
        >
            {/* Background Decor */}
            <div className="fixed top-0 right-0 w-1/2 h-screen opacity-10 pointer-events-none z-0">
                <h1 className="text-[20vw] font-display font-bold uppercase leading-none text-right text-stroke text-transparent select-none">
                    {team.name.split(' ')[0]}
                </h1>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto md:px-0">
                {/* Mobile Header / Navigation */}
                <div className="px-4 md:px-0 mb-6 md:mb-12">
                    <motion.button
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={onBack}
                        className="flex items-center space-x-2 text-white/70 hover:text-volt transition-colors mb-4 md:mb-8 group"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase font-bold tracking-widest text-xs md:text-sm">Back to Teams</span>
                    </motion.button>

                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="border-l-4 border-volt pl-4 md:pl-6"
                    >
                        <h2 className="text-4xl md:text-8xl font-display font-bold uppercase md:tracking-wide text-white leading-tight">
                            {team.name}
                        </h2>
                        <p className="text-sm md:text-xl text-gray-400 mt-2 font-light truncate">
                            Pick player to see details.
                        </p>
                    </motion.div>
                </div>

                {/* Squad List container */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 px-2 md:px-0 pb-20">
                    {team.players.map((player, index) => (
                        <motion.div
                            key={player.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + (index * 0.05), ease: "easeOut" }}
                            onClick={() => onSelectPlayer(player)}
                            className="group cursor-pointer"
                        >
                            {/* MOBILE LAYOUT: Compact List Card */}
                            <div className="flex md:hidden bg-surface/50 border border-white/5 rounded-lg overflow-hidden active:scale-[0.98] transition-transform">
                                {/* Avatar */}
                                <div className="w-24 h-24 relative flex-shrink-0">
                                    <img
                                        src={player.image}
                                        alt={player.name}
                                        className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all"
                                    />
                                    <div className="absolute top-0 left-0 bg-volt text-black font-bold font-display text-sm px-1.5 py-0.5 z-10">
                                        #{player.number}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 p-3 flex flex-col justify-center relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-display font-bold uppercase leading-none text-white mb-1 flex items-center gap-2 flex-wrap">
                                                {player.name}
                                                {player.isSigned && (
                                                    <div className="flex items-center gap-1">
                                                        <BadgeCheck className="w-4 h-4 text-volt fill-volt/10" />
                                                        <span className="text-[10px] font-sans font-bold text-volt tracking-wider uppercase pt-0.5">Signed</span>
                                                    </div>
                                                )}
                                            </h3>
                                            <span className="text-volt text-[10px] font-bold uppercase tracking-widest bg-volt/10 px-2 py-0.5 rounded inline-block">
                                                {player.position}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-volt" />
                                    </div>

                                    {/* Quick Stats Row for Mobile */}
                                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-gray-400 font-sans font-bold">
                                        <span className="flex items-center"><span className="text-white mr-1">{player.height}</span></span>
                                        <span className="w-px h-3 bg-gray-700"></span>
                                        <span>{player.foot} Foot</span>
                                        <span className="w-px h-3 bg-gray-700"></span>
                                        <span>{player.eligibility}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DESKTOP LAYOUT: Vertical Card (Existing) */}
                            <div className="hidden md:block relative aspect-[3/4] bg-surface overflow-hidden hover:-translate-y-2 transition-transform duration-500 rounded-sm">
                                <div className="absolute top-0 left-0 bg-volt text-black font-bold font-display text-xl px-3 py-1 z-20">
                                    #{player.number}
                                </div>
                                <img
                                    src={player.image}
                                    alt={player.name}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 filter grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>

                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <span className="block text-6xl font-display font-bold text-transparent text-stroke opacity-20 absolute -top-12 left-4 group-hover:text-volt group-hover:opacity-40 transition-colors duration-300">
                                        {player.number}
                                    </span>
                                    <div className="relative z-10">
                                        <p className="text-volt text-xs font-bold uppercase tracking-widest mb-1">
                                            {player.position}
                                        </p>
                                        <h3 className="text-3xl font-display font-bold uppercase md:tracking-wide leading-none mb-2">
                                            {player.name}
                                        </h3>
                                        <div className="h-1 w-0 bg-volt group-hover:w-full transition-all duration-500 ease-out mb-2"></div>
                                        {player.isSigned && (
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <BadgeCheck className="w-5 h-5 text-volt fill-volt/10" />
                                                <span className="text-xs font-sans font-bold text-volt tracking-widest uppercase pt-0.5">Signed Athlete</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default PlayerList;