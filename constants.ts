import { Team, Player, Stats } from './types';

// --- IMAGERY ASSETS ---

// Team Cover Images (Atmospheric Football/Soccer)
const TEAM_IMGS = [
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop", // Stadium Dark
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop", // Action Kick
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop", // Ball on Line
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1978&auto=format&fit=crop", // Floodlights
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop", // Training
  "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop"  // Low Angle Grass
];

// Placeholder Player Images
const PLAYER_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1934&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1929&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1628891435256-3f71ab48c02c?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1887&auto=format&fit=crop"
];

const CITIES = ["Berlin, GER", "Munich, GER", "London, UK", "Paris, FRA", "Madrid, ESP", "Hamburg, GER", "Cologne, GER", "Manchester, UK"];
const ACADEMIES = ["FC Berlin Academy", "Munich Elite", "London Youth", "Paris SG U19", "Ruhr Valley HS", "North District Club"];

// --- GENERATOR FUNCTIONS ---

// Generate specific positions based on squad number logic
// 1-2: GK
// 3-7: Defenders (CB, LB, RB)
// 8-12: Midfield (CDM, CM, CAM)
// 13-15: Forwards (RW, LW, ST)
const getSpecificPositionByIndex = (index: number): string => {
  // Goalkeepers
  if (index < 2) return "GK";

  // Defenders
  if (index === 2) return "LB • LWB";
  if (index === 3) return "CB";
  if (index === 4) return "CB • CDM"; // Versatile CB
  if (index === 5) return "CB";
  if (index === 6) return "RB • RWB";

  // Midfielders
  if (index === 7) return "CDM • CM";
  if (index === 8) return "CM • CAM";
  if (index === 9) return "LM • LW";
  if (index === 10) return "RM • RW";
  if (index === 11) return "CAM • CF";

  // Forwards
  if (index === 12) return "LW • ST";
  if (index === 13) return "RW • ST";
  return "ST"; // Pure Striker
};

// Helper to determine base category for stats based on specific position string
const getBaseCategory = (pos: string): "GK" | "DEF" | "MID" | "FWD" => {
  if (pos.includes("GK")) return "GK";
  if (pos.includes("CB") || pos.includes("LB") || pos.includes("RB")) return "DEF";
  if (pos.includes("ST") || pos.includes("LW") || pos.includes("RW") || pos.includes("CF")) return "FWD";
  return "MID";
};

// Helper to generate realistic combine stats based on position logic
const generateCombineStats = (positionString: string): Stats[] => {
  const category = getBaseCategory(positionString);
  const randFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // 1. 40 Yard Dash (Lower is better)
  // Range: 4.3s (Elite) to 5.2s (Slow)
  let speedRaw = 0;
  if (category === "FWD" || positionString.includes("WB")) speedRaw = parseFloat(randFloat(4.35, 4.65)); // Fast wingers/strikers
  else if (category === "MID" || category === "DEF") speedRaw = parseFloat(randFloat(4.55, 4.90));
  else speedRaw = parseFloat(randFloat(4.80, 5.20)); // GK/Slow CB

  const speedScore = Math.max(40, Math.min(100, 100 - ((speedRaw - 4.2) * 60)));

  // 2. Broad Jump (Higher is better)
  // Range: 220cm to 300cm
  let broadRaw = randInt(230, 290);
  if (category === "GK") broadRaw = randInt(250, 300); // GKs have explosive legs
  const broadScore = Math.max(40, Math.min(100, ((broadRaw - 200) / 100) * 100));

  // 3. Counter Movement Jump (CMJ) (Higher is better)
  // Range: 40cm to 70cm
  let cmjRaw = randInt(50, 80);
  if (category === "GK" || positionString.includes("CB")) cmjRaw = randInt(60, 85); // Aerial threats
  const cmjScore = Math.max(40, Math.min(100, ((cmjRaw - 30) / 50) * 100));

  return [
    { label: "40 Yard Dash", value: Math.round(speedScore), displayValue: `${speedRaw}s` },
    { label: "Broad Jump", value: Math.round(broadScore), displayValue: `${broadRaw} cm` },
    { label: "CMJ (Vert)", value: Math.round(cmjScore), displayValue: `${cmjRaw} cm` }
  ];
};

const generateSquad = (teamId: string): Player[] => {
  const squad: Player[] = [];

  for (let i = 1; i <= 15; i++) {
    const position = getSpecificPositionByIndex(i - 1);
    const imageIndex = (i + parseInt(teamId.replace('t', ''))) % PLAYER_PLACEHOLDERS.length;

    // Random Vitals
    const height = Math.floor(Math.random() * (198 - 172 + 1) + 172);
    const gpa = (Math.random() * (4.0 - 2.8) + 2.8).toFixed(1);
    const year = Math.floor(Math.random() * (2028 - 2024 + 1) + 2024);

    // Determine Strong Foot based on position
    let foot: "Right" | "Left" | "Both" = "Right";
    if (position.includes("LB") || position.includes("LW")) foot = "Left";
    else if (position.includes("RW") || position.includes("RB")) foot = "Right";
    else foot = Math.random() > 0.8 ? "Both" : "Right";

    squad.push({
      id: `${teamId}-p${i}`,
      name: `Player ${i < 10 ? '0' + i : i}`,
      number: i === 1 ? '1' : `${Math.floor(Math.random() * 98) + 2}`,
      position: position,
      bio: "An elite prospect known for technical discipline and explosive athleticism. Consistently outperforms in high-stakes matches and demonstrates exceptional leadership qualities on the field.",
      image: PLAYER_PLACEHOLDERS[imageIndex],

      // New Specific Fields
      origin: CITIES[Math.floor(Math.random() * CITIES.length)],
      currentTeam: ACADEMIES[Math.floor(Math.random() * ACADEMIES.length)],
      height: `${height} cm`,
      foot: foot,
      gpa: gpa,
      eligibility: `Fall ${year}`,

      stats: generateCombineStats(position)
    });
  }
  return squad;
};

// --- TEAM DEFINITIONS ---

export const TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Team 1 (White)',
    slogan: 'Pick Team to see full Roster.',
    image: TEAM_IMGS[0],
    players: generateSquad('t1')
  },
  {
    id: 't2',
    name: 'Team 2 (Red)',
    slogan: 'Pick Team to see full Roster.',
    image: TEAM_IMGS[1],
    players: generateSquad('t2')
  },
  {
    id: 't3',
    name: 'Team 3 (Blue)',
    slogan: 'Pick Team to see full Roster.',
    image: TEAM_IMGS[2],
    players: generateSquad('t3')
  },
  {
    id: 't4',
    name: 'Team 4 (Yellow)',
    slogan: 'Pick Team to see full Roster.',
    image: TEAM_IMGS[3],
    players: generateSquad('t4')
  },
  {
    id: 't5',
    name: 'Team 5 (Black)',
    slogan: 'Pick Team to see full Roster.',
    image: TEAM_IMGS[4],
    players: generateSquad('t5')
  },
  {
    id: 't6',
    name: 'ITP 1.FC Köln (Red/White)',
    slogan: 'Pick Team to see full Roster.',
    image: "/itp.png",
    players: generateSquad('t6')
  }
];
