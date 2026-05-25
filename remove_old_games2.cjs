const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The chunk dealing with Sambung Kata from line ~1095 to ~1121
const sambungKataRegex = /\s*\/\/ LOGIC FOR SAMBUNG KATA[\s\S]*?\} else \{\n\s*try \{/g;
if (code.match(sambungKataRegex)) {
  console.log("matched sambungKataRegex");
  code = code.replace(sambungKataRegex, "\n      } else {\n\n      try {");
} else {
  // Let's do a more careful replace if it failed
  console.log("fallback regex 1");
  const sambungKataLogic = /\/\/ LOGIC FOR SAMBUNG KATA[\s\S]*?\/\/ --- CHECK FOR TRIGGER WORDS/;
  code = code.replace(sambungKataLogic, "// --- CHECK FOR TRIGGER WORDS");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Done 2");
