import Papa from 'papaparse';
import { Player, Stats } from '../types';

// Default / Example Sheet URL (User to replace)
// This should be the "Published to Web" -> "CSV" link
export const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtcteQ713KHARlTHp2mxT96M_3xqkRGyIBa_UmXmGJVsmIKfOp_Kz9VIjH0BeLLU52n72DDVVOfi5c/pub?output=csv";

interface SheetRow {
    ID: string;
    Name: string;
    Showcase_Team: string;
    Team: string;
    Number: string;
    Position: string;
    Height: string;
    Foot: string;
    Bio: string;
    Image_URL: string;
    Origin: string;
    CurrentTeam: string;
    GPA: string;
    Eligibility: string;

    // Stats
    Speed_40yd: string;
    Broad_Jump: string;
    CMJ_Vert: string;
}

export const fetchPlayerData = async (csvUrl: string): Promise<Player[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as SheetRow[];

                const players: Player[] = rows.map((row, index) => {
                    // Helper to clean strings
                    const clean = (val: string) => val ? val.trim() : "";

                    // Parse Stats
                    const stats: Stats[] = [
                        {
                            label: "40 Yard Dash",
                            value: calculateStatScore(parseFloat(row.Speed_40yd), 4.2, 5.2, true),
                            displayValue: clean(row.Speed_40yd) || "-"
                        },
                        {
                            label: "Broad Jump",
                            value: calculateStatScore(parseFloat(row.Broad_Jump), 200, 300, false),
                            displayValue: clean(row.Broad_Jump) || "-"
                        },
                        {
                            label: "CMJ (Vert)",
                            value: calculateStatScore(parseFloat(row.CMJ_Vert), 30, 80, false),
                            displayValue: clean(row.CMJ_Vert) || "-"
                        }
                    ];

                    return {
                        id: clean(row.ID) || `gen-${index}`,
                        name: clean(row.Name) || "Unknown Player",
                        number: clean(row.Number) || "0",
                        position: clean(row.Position) || "ATH",
                        bio: clean(row.Bio) || "No bio available.",
                        image: clean(row.Image_URL) || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1934&auto=format&fit=crop", // Fallback
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
