import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import TeamGrid from './components/TeamGrid';
import PlayerList from './components/PlayerList';
import PlayerCard from './components/PlayerCard';
import GrainOverlay from './components/GrainOverlay';
import { ViewState, Team, Player } from './types';
import { TEAMS } from './constants';
import { fetchPlayerData, SHEET_URL } from './utils/sheetService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<Team[]>(TEAMS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedPlayers = await fetchPlayerData(SHEET_URL);

        // If we have fetched players, distribute them into teams
        if (fetchedPlayers.length > 0) {
          const updatedTeams = TEAMS.map(team => {
            // Find players whose "CurrentTeam" or "Team" matches the Team Name or ID
            // Assumption: The Sheet has a "Team" column matching "Team 1", "Team 2" etc.
            const teamPlayers = fetchedPlayers.filter(p =>
              p.showcaseTeam === team.name ||
              p.showcaseTeam === team.id ||
              (p.showcaseTeam && p.showcaseTeam.includes(team.name)) // loose match
            );

            // If matches found, replace static players. Else keep static players (or empty?)
            // Defaulting to OVERRIDE if matches found.
            if (teamPlayers.length > 0) {
              return { ...team, players: teamPlayers };
            }
            return team;
          });
          setTeams(updatedTeams);
        }
      } catch (error) {
        console.error("Failed to load sheet data", error);
        // Keep default TEAMS on error
      }
    };

    loadData();
  }, []);

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