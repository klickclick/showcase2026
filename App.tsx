import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import TeamGrid from './components/TeamGrid';
import PlayerList from './components/PlayerList';
import PlayerCard from './components/PlayerCard';
import GrainOverlay from './components/GrainOverlay';
import { ViewState, Team, Player } from './types';
import { TEAMS } from './constants';
import LoginScreen from './components/LoginScreen';
import { fetchPlayerData } from './utils/sheetService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<Team[]>(TEAMS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Called by LoginScreen when user submits password
  const handleLogin = async (password: string): Promise<boolean> => {
    try {
      const fetchedPlayers = await fetchPlayerData(password);

      // If we got players, password is correct
      if (fetchedPlayers.length > 0) {
        distributePlayersToTeams(fetchedPlayers);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const distributePlayersToTeams = (fetchedPlayers: Player[]) => {
    const updatedTeams = TEAMS.map(team => {
      // Helper for loose matching (ignore spaces and case)
      const normalize = (str: string) => str ? str.toLowerCase().replace(/\s/g, '') : '';

      // Find players whose "CurrentTeam" or "Team" matches the Team Name or ID
      const teamPlayers = fetchedPlayers.filter(p => {
        const pTeam = normalize(p.showcaseTeam);
        const tName = normalize(team.name); // "team1"
        const tId = normalize(team.id);     // "t1"

        return pTeam === tName || pTeam === tId || pTeam.includes(tName);
      });

      // If matches found, replace static players.
      if (teamPlayers.length > 0) {
        // Sort players by Number (Ascending: 1, 2, 3...)
        teamPlayers.sort((a, b) => {
          const numA = parseInt(a.number) || 0;
          const numB = parseInt(b.number) || 0;
          return numA - numB;
        });

        return { ...team, players: teamPlayers }; // Override static
      }
      return team;
    });
    setTeams(updatedTeams);
  };

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setView(ViewState.PLAYERS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setView(ViewState.PLAYER_DETAIL);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTeams = () => {
    setView(ViewState.TEAMS);
    setTimeout(() => setSelectedTeam(null), 500); // Clear after transition
  };

  const handleBackToPlayers = () => {
    setView(ViewState.PLAYERS);
    setTimeout(() => setSelectedPlayer(null), 500); // Clear after transition
  };

  const handleHomeClick = () => {
    setView(ViewState.TEAMS);
    setSelectedTeam(null);
    setSelectedPlayer(null);
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-volt selection:text-black">
      {!isAuthenticated && <LoginScreen onLogin={handleLogin} />}

      <GrainOverlay />

      <Header currentView={view} onHomeClick={handleHomeClick} />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {view === ViewState.TEAMS && (
            <TeamGrid key="team-grid" teams={teams} onSelectTeam={handleSelectTeam} />
          )}

          {view === ViewState.PLAYERS && selectedTeam && (
            <PlayerList
              key="player-list"
              team={selectedTeam}
              onSelectPlayer={handleSelectPlayer}
              onBack={handleBackToTeams}
            />
          )}

          {view === ViewState.PLAYER_DETAIL && selectedPlayer && (
            <PlayerCard
              key="player-card"
              player={selectedPlayer}
              onBack={handleBackToPlayers}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Copyright */}
      <footer className="fixed bottom-4 left-0 w-full text-center pointer-events-none z-0 opacity-30">
        <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-gray-500">
          Designed for performance. Engineered to win.
        </p>
      </footer>
    </div>
  );
};

export default App;