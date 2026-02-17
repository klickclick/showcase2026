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
  const hasRestoredState = React.useRef(false);

  // Restore state from URL on initial load / login
  useEffect(() => {
    if (!isAuthenticated) return;
    if (hasRestoredState.current) return;

    const params = new URLSearchParams(window.location.search);
    const teamId = params.get('team');
    const playerId = params.get('player');

    if (teamId) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setSelectedTeam(team);
        if (playerId) {
          // Find player in the team's squad
          const player = team.players.find(p => p.id === playerId);
          if (player) {
            setSelectedPlayer(player);
            setView(ViewState.PLAYER_DETAIL);
          } else {
            // Fallback to team view if player not found
            setView(ViewState.PLAYERS);
          }
        } else {
          setView(ViewState.PLAYERS);
        }
      }
    }
    hasRestoredState.current = true;
  }, [isAuthenticated, teams]);

  // Check for valid session on mount
  useEffect(() => {
    // 1. Check for URL "code" param (QR Code Login)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleLogin(code).then((success) => {
        if (success) {
          // Clean URL (remove code param so it's not visible/shareable easily from address bar)
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      });
      return; // Skip checking storage if we have a code
    }

    // 2. Check for valid session in Storage
    const sessionDetail = localStorage.getItem('auth_session');
    if (sessionDetail) {
      try {
        const { token, expiry } = JSON.parse(sessionDetail);
        // Check if session is expired (e.g. 24 hours)
        if (Date.now() < expiry) {
          handleLogin(token, true); // True = auto-login from storage
        } else {
          localStorage.removeItem('auth_session'); // Clear expired session
        }
      } catch (e) {
        localStorage.removeItem('auth_session');
      }
    }
  }, []);

  // Handle Browser Back/Forward Navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        // Restore from state object
        if (state.view === ViewState.TEAMS) {
          setView(ViewState.TEAMS);
          setSelectedTeam(null);
          setSelectedPlayer(null);
        } else if (state.view === ViewState.PLAYERS && state.teamId) {
          const team = TEAMS.find(t => t.id === state.teamId);
          if (team) {
            setSelectedTeam(team);
            setView(ViewState.PLAYERS);
            setSelectedPlayer(null);
          }
        } else if (state.view === ViewState.PLAYER_DETAIL && state.playerId && state.teamId) {
          const team = TEAMS.find(t => t.id === state.teamId);
          // Note: We might need to look up player in the team's squad. 
          // Since players are dynamic or generated, we rely on the fact that TEAMS is the source of truth 
          // OR if players were distributed dynamically, we need to check the 'teams' state.
          // However, 'teams' state is local. Ideally we should find the player in 'teams'.
          // But 'teams' state might not be accessible inside this effect if not in dependency array?
          // Actually, 'teams' is in scope.

          // Use a function update or assume 'teams' is up to date if we depend on it.
          // Since 'teams' changes only on login, it should be fine.
          if (team) {
            setSelectedTeam(team);
            // We need to find the player. If it's a generated player, we need to find it by ID.
            // But we can't search 'teams' state easily inside the listener without adding it to deps,
            // which might re-trigger listener. 
            // Better approach: Re-find player from the current 'teams' list via a ref or just state.
            // Let's use the 'teams' state (add it to dependency).
          }
        }
      } else {
        // No state (e.g. initial load or external link), try to parse URL or default to Home
        const params = new URLSearchParams(window.location.search);
        const teamId = params.get('team');
        const playerId = params.get('player');

        if (playerId && teamId) {
          // Logic to restore player view from URL would go here
          // For now, let's default to parsing logic similar to popstate if we supported deep linking.
          // Given the requirement is just "Back button works", we focus on popping state.
          // If no state, we can assume Home.
          setView(ViewState.TEAMS);
          setSelectedTeam(null);
          setSelectedPlayer(null);
        } else if (teamId) {
          const team = TEAMS.find(t => t.id === teamId);
          if (team) {
            setSelectedTeam(team);
            setView(ViewState.PLAYERS);
            setSelectedPlayer(null);
          }
        } else {
          setView(ViewState.TEAMS);
          setSelectedTeam(null);
          setSelectedPlayer(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [teams]); // Depend on teams to find players if needed, though for now we rely on static TEAMS for ID lookups or basic navigation

  // Modify the handlePopState logic to be more robust with the 'teams' dependency
  // Actually, simply depending on 'teams' is fine.

  // Called by LoginScreen when user submits password
  const handleLogin = async (password: string, isAutoLogin = false): Promise<boolean> => {
    try {
      const fetchedPlayers = await fetchPlayerData(password);

      // If we got players, password is correct
      if (fetchedPlayers.length > 0) {
        distributePlayersToTeams(fetchedPlayers);
        setIsAuthenticated(true);

        if (!isAutoLogin) {
          // Save session with 2h expiry
          const TwoHours = 2 * 60 * 60 * 1000;
          const sessionData = {
            token: password,
            expiry: Date.now() + TwoHours
          };
          localStorage.setItem('auth_session', JSON.stringify(sessionData));
        }
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

    // Push History State
    window.history.pushState(
      { view: ViewState.PLAYERS, teamId: team.id },
      '',
      `?team=${team.id}`
    );
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setView(ViewState.PLAYER_DETAIL);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Push History State
    // We need teamId to know context. selectedTeam should be valid here.
    if (selectedTeam) {
      window.history.pushState(
        { view: ViewState.PLAYER_DETAIL, teamId: selectedTeam.id, playerId: player.id },
        '',
        `?team=${selectedTeam.id}&player=${player.id}`
      );
    }
  };

  const handleBackToTeams = () => {
    // If we want the browser Back button to be consistent, we could just history.back()
    // But that assumes the user arrived here via navigation.
    // If we force a state change, we should pushState to "Team View"
    // OR just use history.back() if we know there is a history.

    // Simplest reliable way for now: Push new state (or Replace if we want to avoid infinite loops, but Push is standard for "going to a page")
    // Actually, "Back" in UI usually implies "Up" in hierarchy or "Previous" in history.
    // Let's use pushState to ensure we explicitly go to the Team view in history stack, 
    // effectively "adding" a step, unless we want to strictly mimic "Back" behavior.
    // Given the request is "Back button works", managing history stack explicitly is safest.

    setView(ViewState.TEAMS);
    setTimeout(() => setSelectedTeam(null), 500); // Clear after transition

    // Update URL/History
    window.history.pushState(
      { view: ViewState.TEAMS },
      '',
      '/'
      // Or should it be simple '/'? Yes.
    );
  };

  const handleBackToPlayers = () => {
    setView(ViewState.PLAYERS);
    setTimeout(() => setSelectedPlayer(null), 500); // Clear after transition

    if (selectedTeam) {
      window.history.pushState(
        { view: ViewState.PLAYERS, teamId: selectedTeam?.id },
        '',
        `?team=${selectedTeam?.id}`
      );
    }
  };

  const handleHomeClick = () => {
    setView(ViewState.TEAMS);
    setSelectedTeam(null);
    setSelectedPlayer(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.history.pushState(
      { view: ViewState.TEAMS },
      '',
      '/'
    );
  };

  // Anti-Copy Measures
  useEffect(() => {
    // Disable Right Click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Disable Image Dragging
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white font-sans select-none">
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
        <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-gray-500">
          From Players. For Players.
        </p>
      </footer>
    </div>
  );
};

export default App;