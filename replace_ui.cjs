const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Sidebar Game Menu Array
const oldGameMenu = /\{\[\s*\{\s*name:\s*'Tebak Emoji',\s*icon:\s*'🎭'\s*\},[\s\S]*?\].map\(game => \([\s\S]*?<\/button>\s*\)\)/;
const newGameMenu = `[
  { id: 'breathing', name: 'Atur Nafas', icon: '🫁' },
  { id: 'bubble', name: 'Gelembung', icon: '🫧' },
  { id: 'shredder', name: 'Penghancur', icon: '🗄️' },
  { id: 'zen', name: 'Pola Zen', icon: '🎨' }
].map(game => (
  <button
    key={game.id}
    onClick={() => {
      if (isMobile) setIsSidebarOpen(false);
      setActiveGameModal(game.id as GameType);
    }}
    className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-slate-100 dark:border-slate-800 rounded-xl transition-colors shrink-0 text-center"
  >
    <span className="text-xl leading-none">{game.icon}</span>
    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">{game.name}</span>
  </button>
))`;

code = code.replace(oldGameMenu, newGameMenu);

// Replace Floating Game Chips
const oldGameChips = /<AnimatePresence>\s*\{\(showGameChips && messages\.length === 1\) && \([\s\S]*?<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>/;
const newGameChips = `<AnimatePresence>
            {(showGameChips && messages.length === 1) && (
              <motion.div
                id="game-chips-container"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute flex gap-2 justify-center flex-wrap z-10 max-w-[95%] w-max"
                style={{ bottom: 'calc(100% + 15px)', left: '50%', transform: 'translateX(-50%)', animation: 'floatBob 2.5s ease-in-out infinite' }}
              >
                <button
                  onClick={() => {
                    setShowGameChips(false);
                    setActiveGameModal('breathing');
                  }}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-bold text-[13px] whitespace-nowrap rounded-[20px] shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  🫁 Atur Nafas
                </button>
                <button
                  onClick={() => {
                    setShowGameChips(false);
                    setActiveGameModal('bubble');
                  }}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-bold text-[13px] whitespace-nowrap rounded-[20px] shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  🫧 Pecah Gelembung
                </button>
                <button
                  onClick={() => {
                    setShowGameChips(false);
                    setActiveGameModal('shredder');
                  }}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-bold text-[13px] whitespace-nowrap rounded-[20px] shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  🗄️ Mesin Penghancur
                </button>
                <button
                  onClick={() => {
                    setShowGameChips(false);
                    setActiveGameModal('zen');
                  }}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-bold text-[13px] whitespace-nowrap rounded-[20px] shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  🎨 Pola Zen
                </button>
              </motion.div>
            )}
          </AnimatePresence>`;

code = code.replace(oldGameChips, newGameChips);

fs.writeFileSync('src/App.tsx', code);
