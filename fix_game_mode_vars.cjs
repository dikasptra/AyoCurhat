const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /contents: isSambungKataAction \? \[\{ role: 'user', parts: \[\{ text: sambungKataSysPrompt \}\] \}\] : chatHistory,/g,
  "contents: chatHistory,"
);

// also remove `const isGameMode = ...` since it's no longer a text game
code = code.replace(
  /const isGameMode = userText\.toLowerCase\(\)\.includes\("ayo main"\);\n/g,
  ""
);

code = code.replace(
  /temperature: isGameMode \? 0\.85 : 0\.65,/g,
  "temperature: 0.65,"
);

fs.writeFileSync('src/App.tsx', code);
