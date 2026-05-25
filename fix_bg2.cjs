const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/dark:bg-slate-900/g, 'dark:bg-slate-800');

fs.writeFileSync('src/App.tsx', code);
