import Papa from 'papaparse';
import { Player, Stats } from '../types';

// Default / Example Sheet URL (User to replace)
// This should be the "Published to Web" -> "CSV" link
// Removed public SHEET_URL export for security
// The URL is now stored in Netlify Environment Variables

export const fetchPlayerData = async (password: string): Promise<Player[]> => {
    return new Promise((resolve, reject) => {
        // Fetch from our own backend proxy
        fetch('/.netlify/functions/get-data', {
            method: 'POST',
            body: JSON.stringify({ password }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Unauthorized or Failed");
                }
                return response.text(); // Get CSV text
            })
            .then((csvData) => {
                Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const rawRows = results.data as any[];

                        const players: Player[] = rawRows.map((rawRow, index) => {
                            // Helper to clean strings
                            const clean = (val: string) => val ? val.trim() : "";

                            // Normalize keys: Remove spaces from column names (e.g. "Bio " -> "Bio")
                            const row: any = {};
                            Object.keys(rawRow).forEach(key => {
                                const cleanKey = key.trim();
                                row[cleanKey] = rawRow[key];
                            });

                            // Parse Stats
                            const stats: Stats[] = [
                                {
                                    label: "40 Yard Dash",
                                    value: calculateStatScore(parseFloat(row.Speed_40yd), 4.2, 5.2, true),
                                    displayValue: clean(row.Speed_40yd) ? `${clean(row.Speed_40yd)}s` : "-"
                                },
                                {
                                    label: "Broad Jump",
                                    value: calculateStatScore(parseFloat(row.Broad_Jump), 200, 300, false),
                                    displayValue: clean(row.Broad_Jump) ? `${clean(row.Broad_Jump)}cm` : "-"
                                },
                                {
                                    label: "CMJ (Vert)",
                                    value: calculateStatScore(parseFloat(row.CMJ_Vert), 30, 80, false),
                                    displayValue: clean(row.CMJ_Vert) ? `${clean(row.CMJ_Vert)}cm` : "-"
                                }
                            ];

                            return {
                                id: clean(row.ID) || `gen-${index}`,
                                name: clean(row.Name) || "Unknown Player",
                                number: clean(row.Number) || "0",
                                position: clean(row.Position) || "ATH",
                                bio: clean(row.Bio) || "No bio available.",
                                image: transformImage(clean(row.Image_URL)),
                                origin: clean(row.Origin),
                                currentTeam: clean(row.CurrentTeam),
                                showcaseTeam: clean(row.Showcase_Team) || clean(row.Team), // Map from CSV
                                height: clean(row.Height),
                                foot: (clean(row.Foot) as "Right" | "Left" | "Both") || "Right",
                                gpa: clean(row.GPA),
                                eligibility: clean(row.Eligibility),
                                stats: stats
                            };
                        });

                        resolve(players);
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// Helper: 0-100 Score
// lowBest: true if lower number is better (like sprint time)
const calculateStatScore = (val: number, min: number, max: number, lowBest: boolean): number => {
    if (isNaN(val)) return 50;

    let score = 0;
    if (lowBest) {
        // e.g. 4.2 is 100, 5.2 is 0
        score = 100 - ((val - min) / (max - min)) * 100;
    } else {
        // e.g. 300 is 100, 200 is 0
        score = ((val - min) / (max - min)) * 100;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
};

// Helper: Transform various image URL formats to be embeddable
const transformImage = (url: string): string => {
    if (!url) return "/Frame 3.png"; // Fallback

    // Handle Google Drive Links
    // Input: https://drive.google.com/file/d/123456789/view?usp=sharing
    // Output: https://drive.google.com/uc?export=view&id=123456789
    if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
        const idMatch = url.match(/\/d\/(.*?)(?:\/|$)/);
        if (idMatch && idMatch[1]) {
            // Use lh3.googleusercontent.com for better embedding reliability
            return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
        }
    }

    // Handle Dropbox Links (dl=0 -> raw=1)
    if (url.includes("dropbox.com") && url.includes("dl=0")) {
        return url.replace("dl=0", "raw=1");
    }

    return url;
};
