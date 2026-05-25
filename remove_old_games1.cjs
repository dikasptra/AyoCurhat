const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import for MindfulnessGames
code = code.replace(
  "import { \n  auth, db,",
  "import MindfulnessGames, { GameType } from './components/MindfulnessGames';\nimport { \n  auth, db,"
);

// 2. Remove SAMBUNG_KATA_WORDS
code = code.replace(/const SAMBUNG_KATA_WORDS = \[[\s\S]*?\];\n+/, '');

// 3. Remove sambungKataState 
code = code.replace(/const \[sambungKataState, setSambungKataState\].*?\n/, '');

// 4. Add new state for Mindfulness Games
code = code.replace(
  /const \[isAuthChecking, setIsAuthChecking\] = useState\(true\);\n/,
  "const [isAuthChecking, setIsAuthChecking] = useState(true);\n  const [activeGameModal, setActiveGameModal] = useState<GameType>(null);\n"
);

fs.writeFileSync('src/App.tsx', code);
