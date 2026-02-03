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

                        // PASS 1: Calculate Min/Max for Dynamic Scaling
                        let minSpeed = 100, maxSpeed = 0;
                        let minBroad = 500, maxBroad = 0;
                        let minCMJ = 100, maxCMJ = 0;

                        rawRows.forEach(row => {
                            const speed = parseFloat(row.Speed_40yd);
                            const broad = parseFloat(row.Broad_Jump);
                            const cmj = parseFloat(row.CMJ_Vert);

                            if (!isNaN(speed) && speed > 0) {
                                if (speed < minSpeed) minSpeed = speed; // Lower is better (Best)
                                if (speed > maxSpeed) maxSpeed = speed; // Higher is worse (Worst)
                            }
                            if (!isNaN(broad) && broad > 0) {
                                if (broad < minBroad) minBroad = broad; // Lower is worse (Worst)
                                if (broad > maxBroad) maxBroad = broad; // Higher is better (Best)
                            }
                            if (!isNaN(cmj) && cmj > 0) {
                                if (cmj < minCMJ) minCMJ = cmj; // Lower is worse (Worst)
                                if (cmj > maxCMJ) maxCMJ = cmj; // Higher is better (Best)
                            }
                        });

                        // Fallback defaults if data is missing or single entry to avoid /0
                        if (maxSpeed === minSpeed) { maxSpeed = minSpeed + 1; }
                        if (maxBroad === minBroad) { minBroad = 0; }
                        if (maxCMJ === minCMJ) { minCMJ = 0; }

                        const players: Player[] = rawRows.map((rawRow, index) => {
                            // Helper to clean strings
                            const clean = (val: string) => val ? val.trim() : "";

                            // Normalize keys: Remove spaces from column names (e.g. "Bio " -> "Bio")
                            const row: any = {};
                            Object.keys(rawRow).forEach(key => {
                                const cleanKey = key.trim();
                                row[cleanKey] = rawRow[key];
                            });

                            // Parse Stats with Dynamic Scaling
                            // Speed: Low is Best. Range [Max, Min] -> [0, 100]
                            const speedVal = parseFloat(row.Speed_40yd);
                            const speedScore = isNaN(speedVal) ? 0 : calculateStatScore(speedVal, minSpeed, maxSpeed, true);

                            // Broad: High is Best. Range [Min, Max] -> [0, 100]
                            const broadVal = parseFloat(row.Broad_Jump);
                            const broadScore = isNaN(broadVal) ? 0 : calculateStatScore(broadVal, minBroad, maxBroad, false);

                            // CMJ: High is Best. Range [Min, Max] -> [0, 100]
                            const cmjVal = parseFloat(row.CMJ_Vert);
                            const cmjScore = isNaN(cmjVal) ? 0 : calculateStatScore(cmjVal, minCMJ, maxCMJ, false);

                            const stats: Stats[] = [
                                {
                                    label: "40 Yard Dash",
                                    value: speedScore,
                                    displayValue: clean(row.Speed_40yd) ? `${clean(row.Speed_40yd)}s` : "-"
                                },
                                {
                                    label: "Broad Jump",
                                    value: broadScore,
                                    displayValue: clean(row.Broad_Jump) ? `${clean(row.Broad_Jump)}cm` : "-"
                                },
                                {
                                    label: "CMJ (Vert)",
                                    value: cmjScore,
                                    displayValue: clean(row.CMJ_Vert) ? `${clean(row.CMJ_Vert)}cm` : "-"
                                }
                            ];

                            return {
                                id: clean(row.ID) || `gen-${index}`,
                                name: clean(row.Name) || "Unknown Player",
                                number: clean(row.Number) || "0",
                                position: clean(row.Position) || "ATH",
                                bio: clean(row.Bio) || "",
                                image: transformImage(clean(row.Image_URL)),
                                origin: clean(row.Origin),
                                currentTeam: clean(row.CurrentTeam),
                                showcaseTeam: clean(row.Showcase_Team) || clean(row.Team), // Map from CSV
                                height: clean(row.Height),
                                foot: (clean(row.Foot) as "Right" | "Left" | "Both") || "Right",
                                gpa: clean(row.GPA),
                                eligibility: clean(row.Eligibility),
                                dob: clean(row.DOB) || clean(row.Date_of_Birth) || clean(row.Birthday) || "",
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
// For lowBest (Speed): min=Best(4.4), max=Worst(5.5). Val=4.4 -> 100%. Val=5.5 -> 0%.
// Formula: (Max - Val) / (Max - Min) * 100
// For highBest (Jump): min=Worst(200), max=Best(300). Val=300 -> 100%. Val=200 -> 0%.
// Formula: (Val - Min) / (Max - Min) * 100
const calculateStatScore = (val: number, bestOrMin: number, worstOrMax: number, lowBest: boolean): number => {
    if (isNaN(val)) return 0;

    // Safety check for flat range
    if (bestOrMin === worstOrMax) return 100;

    let score = 0;
    if (lowBest) {
        // lowBest=true. "bestOrMin" is the lowest value (BEST). "worstOrMax" is the highest value (WORST).
        // scale: Worst(Max) -> 0, Best(Min) -> 100
        score = ((worstOrMax - val) / (worstOrMax - bestOrMin)) * 100;
    } else {
        // lowBest=false. "bestOrMin" is the lowest value (WORST). "worstOrMax" is the highest value (BEST).
        // scale: Worst(Min) -> 0, Best(Max) -> 100
        score = ((val - bestOrMin) / (worstOrMax - bestOrMin)) * 100;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
};

// Helper: Transform various image URL formats to be embeddable
const transformImage = (url: string): string => {
    if (!url) return "/generic avatar.png"; // Fallback

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
