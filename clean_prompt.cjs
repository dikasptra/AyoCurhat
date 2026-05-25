const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /MODE GAME & MELATIH OTAK \(SASSY & KOCAK\):[\s\S]*?PERSONA & GAYA BAHASA \(BERLAKU UNTUK SEMUA OBROLAN DAN GAME\):/g;

code = code.replace(regex, "PERSONA & GAYA BAHASA:");

// Remove another piece of prompt related to game
const regex2 = /ATURAN MODE GAME \(JIKA PENGGUNA INGIN MAIN\):[\s\S]*?Solusi Psikologis Nyata/g;
code = code.replace(regex2, "Solusi Psikologis Nyata");

// Set teasing to only be valid if needed (or remove teasing entirely, but I'll just change the comment)
code = code.replace(
  /- \[mood:teasing\] -> Gunakan ini HANYA SAAT BERMAIN GAME \(ngeledek, julid, asyik, sassy\)\./g,
  "- [mood:teasing] -> Gunakan ini saat ingin bercanda atau ngeledek pengguna secara akrab."
);

fs.writeFileSync('src/App.tsx', code);
