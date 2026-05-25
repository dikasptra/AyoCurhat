const fs = require('fs');
let code = fs.readFileSync('src/components/MindfulnessGames.tsx', 'utf8');

code = code.replace(/dark:bg-slate-950/g, 'dark:bg-slate-800');
code = code.replace(/dark:bg-slate-900/g, 'dark:bg-slate-800');

fs.writeFileSync('src/components/MindfulnessGames.tsx', code);
