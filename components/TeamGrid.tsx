import React from 'react';
import { motion, Variants } from 'framer-motion';
import { TEAMS } from '../constants';
import { Team } from '../types';

interface TeamGridProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item: Variants = {
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const TeamGrid: React.FC<TeamGridProps> = ({ teams, onSelectTeam }) => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="min-h-screen w-full flex flex-col px-4 md:px-8 py-20 md:py-24"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-4xl md:text-8xl font-display font-bold uppercase md:tracking-wide mb-8 md:mb-12 text-center md:text-left text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500"
      >
        Select Squad
      </motion.h1>

      {/* 
            Grid Layout Optimization:
            - Mobile: Compact rows (200px height) to see multiple teams at a glance.
            - Desktop: Taller cards for impact.
        */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 auto-rows-[200px] md:auto-rows-[450px] w-full max-w-[1600px] mx-auto pb-12">
        {teams.map((team) => (
          <motion.div
            key={team.id}
            variants={item}
            onClick={() => onSelectTeam(team)}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full h-full cursor-pointer overflow-hidden rounded-sm border-l-4 border-transparent hover:border-volt bg-surface transition-all duration-300"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={team.image}
                alt={team.name}
                className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-110 opacity-60 group-hover:opacity-80 grayscale group-hover:grayscale-0 ${team.imageStyle || 'object-cover'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent md:bg-gradient-to-t md:from-black md:via-transparent md:to-transparent opacity-90"></div>
            </div>

            {/* Content - Optimized for quick scanning on mobile */}
            <div className="absolute inset-0 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-end p-6 md:p-8">
              <div className="flex flex-col z-10 w-full">
                <h2 className={`${team.name.length > 25 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-display font-bold uppercase md:tracking-wide leading-none text-white drop-shadow-lg`}>
                  {team.name}
                </h2>
                <p className="text-volt font-sans font-bold text-[10px] md:text-sm tracking-widest uppercase mt-1 md:mt-2 opacity-90">
                  {team.slogan}
                </p>
              </div>

              {/* Athlete Count Badge */}
              <div className="flex-shrink-0 md:mt-6 flex items-center justify-end md:justify-start">
                <span className="text-[10px] md:text-xs font-bold uppercase bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white/80 group-hover:text-volt group-hover:border-volt/50 transition-colors">
                  {team.players.length} Players
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamGrid;