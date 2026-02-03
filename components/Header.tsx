import React from 'react';
import { motion } from 'framer-motion';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onHomeClick }) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'circOut' }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 pointer-events-none"
    >
      <div
        onClick={onHomeClick}
        className={`pointer-events-auto cursor-pointer flex flex-col items-start group ${currentView !== ViewState.TEAMS ? 'opacity-100' : 'opacity-100'}`}
      >
        {/* 
            INFO ZUM BILD-ORDNER:
            Der 'public'-Ordner befindet sich normalerweise im Hauptverzeichnis deines Projekts (neben 'src', 'package.json' etc.).
            1. Speichere dein Bild als 'logo.png' in den Ordner 'public'.
            2. Ändere unten src="..." zu src="/logo.png".
        */}
        <div className="relative">
          <img
            src="/Logo.png"
            alt="Athletes USA"
            className="h-16 md:h-24 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-6 text-sm font-display uppercase text-gray-400">
        <span>Showcase 2026</span>
        <span className="w-2 h-2 rounded-full bg-volt animate-pulse"></span>
        <span className="text-white">Live</span>
      </div>
    </motion.header>
  );
};

export default Header;