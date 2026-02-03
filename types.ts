export interface Stats {
  label: string;
  value: number; // 0-100 for the visual bar
  displayValue: string; // The actual reading (e.g. "4.5s", "280cm")
}

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  bio: string;

  // New Bio/Vitals fields
  origin: string;
  currentTeam: string;
  showcaseTeam?: string; // ID or Name of the Showcase Squad (e.g. 't1', 'Team 1')
  height: string;
  foot: "Right" | "Left" | "Both";
  eligibility: string;
  dob: string;
  isSigned: boolean;

  image: string;
  stats: Stats[];
}

export interface Team {
  id: string;
  name: string;
  slogan: string;
  image: string; // Cover image for the team
  imageStyle?: string; // Optional custom tailwind classes
  players: Player[];
}

export enum ViewState {
  TEAMS = 'TEAMS',
  PLAYERS = 'PLAYERS',
  PLAYER_DETAIL = 'PLAYER_DETAIL'
}