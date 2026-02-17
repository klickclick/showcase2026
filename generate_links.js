const fs = require('fs');

const TEAMS = [
    { id: 't1', name: 'Team 1 (Blue)' },
    { id: 't2', name: 'Team 2 (Green)' },
    { id: 't3', name: 'Team 3 (White)' },
    { id: 't4', name: 'Team 4 (Light Blue)' },
    { id: 't5', name: 'Team 5 (Black)' },
    { id: 't6', name: 'ITP 1.FC Köln (Red/White)' },
    { id: 't7', name: 'Borussia Mönchengladbach Integrated Academy' },
    { id: 't8', name: 'Womens (Dark Blue)' }
];

let content = "# Player Profile Deep Links\n\n";
content += "Add your domain before the path (e.g., `https://showcase.athletesusa.org`).\n\n";

TEAMS.forEach(team => {
    content += `## ${team.name} (ID: ${team.id})\n\n`;
    for (let i = 1; i <= 15; i++) {
        const playerId = `${team.id}-p${i}`;
        const playerNum = i < 10 ? `0${i}` : `${i}`;
        const playerName = `Player ${playerNum}`;
        const link = `/?team=${team.id}&player=${playerId}`;
        content += `- **${playerName}**: \`${link}\`\n`;
    }
    content += "\n";
});

console.log(content);
