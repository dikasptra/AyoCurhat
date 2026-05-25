import React, { useState, useEffect } from 'react';
import { X, Play, Square, Trash2, Droplets, Palette, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type GameType = 'breathing' | 'bubble' | 'shredder' | 'zen' | null;

interface MindfulnessGamesProps {
  activeGame: GameType;
  onClose: () => void;
}

export default function MindfulnessGames({ activeGame, onClose }: MindfulnessGamesProps) {
  if (!activeGame) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-800/60 backdrop-blur-md transition-all">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 dark:border-white/10"
      >
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-teal-500/10 to-transparent dark:from-teal-500/5 pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all z-20 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="relative z-10 p-6 sm:p-10 pt-12">
          {activeGame === 'breathing' && <BreathingExercise />}
          {activeGame === 'bubble' && <BubbleWrap />}
          {activeGame === 'shredder' && <ThoughtShredder />}
          {activeGame === 'zen' && <ZenPattern />}
        </div>
      </motion.div>
    </div>
  );
}

function BreathingExercise() {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    let isMounted = true;

    const runCycle = async () => {
      if (!isMounted) return;
      setPhase('inhale');
      
      await new Promise(r => setTimeout(r, 4000));
      if (!isMounted) return;
      setPhase('hold');
      
      await new Promise(r => setTimeout(r, 4000));
      if (!isMounted) return;
      setPhase('exhale');
      
      await new Promise(r => setTimeout(r, 6000));
      if (!isMounted) return;
      
      runCycle();
    };

    runCycle();

    return () => { isMounted = false; };
  }, [isActive]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-teal-100 dark:ring-teal-900/50">
        <span className="text-3xl drop-shadow-md" role="img" aria-label="paru-paru">🫁</span>
      </div>
      <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100 tracking-tight">Atur Nafas</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-[280px]">
        Ikuti panduan ini untuk menenangkan pikiranmu perlahan-lahan.
      </p>
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-6 mt-0">
        <div className="absolute inset-0 bg-teal-50 dark:bg-teal-900/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
        <motion.div
          animate={{
            scale: phase === 'inhale' || phase === 'hold' ? 1.6 : 1,
            opacity: phase === 'inhale' || phase === 'hold' ? 1 : 0.8,
          }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0,
            ease: 'easeInOut'
          }}
          className="relative z-10 w-28 h-28 bg-gradient-to-tr from-teal-500/80 to-teal-400/80 dark:from-teal-600/80 dark:to-teal-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.5)] border border-white/30"
        >
          <span className="text-6xl drop-shadow-xl" role="img" aria-label="paru-paru">🫁</span>
        </motion.div>
      </div>

      <div className="h-8 mb-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span 
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`text-xl font-medium tracking-wide ${phase === 'idle' ? 'text-slate-400' : 'text-teal-600 dark:text-teal-400'}`}
          >
            {phase === 'idle' && "Siap untuk mulai?"}
            {phase === 'inhale' && "Tarik Nafas..."}
            {phase === 'hold' && "Tahan Nafas..."}
            {phase === 'exhale' && "Buang Nafas..."}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 mb-8 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
        <div className="flex flex-col items-center gap-2">
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${phase === 'inhale' ? 'bg-teal-500 scale-125 shadow-md shadow-teal-500/40' : 'bg-slate-300 dark:bg-slate-600'}`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tarik</span>
        </div>
        <div className="w-10 h-[2px] bg-slate-200 dark:bg-slate-700 -mt-5" />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${phase === 'hold' ? 'bg-amber-500 scale-125 shadow-md shadow-amber-500/40' : 'bg-slate-300 dark:bg-slate-600'}`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tahan</span>
        </div>
        <div className="w-10 h-[2px] bg-slate-200 dark:bg-slate-700 -mt-5" />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${phase === 'exhale' ? 'bg-blue-500 scale-125 shadow-md shadow-blue-500/40' : 'bg-slate-300 dark:bg-slate-600'}`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Buang</span>
        </div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className={`group flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-bold uppercase tracking-wider text-[11px] transition-all duration-300 active:scale-95 ${
          isActive 
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/50 dark:hover:bg-rose-900/40' 
            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 hover:-translate-y-0.5'
        }`}
      >
        {isActive ? (
          <><Square className="w-3.5 h-3.5" /> Berhenti</>
        ) : (
          <><Play className="w-3.5 h-3.5 ml-0.5" /> Mulai Relaksasi</>
        )}
      </button>
    </div>
  );
}

function BubbleWrap() {
  const [stressWord, setStressWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bubbles, setBubbles] = useState<boolean[]>(Array(24).fill(true));
  const bubblesLeft = bubbles.filter(b => b).length;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (stressWord.trim()) {
      setIsPlaying(true);
      setBubbles(Array(24).fill(true));
    }
  };

  const popBubble = (index: number) => {
    setBubbles(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center min-h-[420px]">
      <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-sky-100 dark:ring-sky-900/50">
        <Droplets className="w-7 h-7 text-sky-500 dark:text-sky-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100 tracking-tight">Pecah Gelembung</h3>

      {!isPlaying ? (
        <AnimatePresence>
          <motion.form 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleStart} 
            className="w-full flex flex-col gap-5 mt-6"
          >
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 text-center">
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                Apa yang sedang membebani pikiranmu saat ini? Ketik dalam satu kata.
              </label>
              <input 
                type="text"
                value={stressWord}
                onChange={e => setStressWord(e.target.value)}
                placeholder="Contoh: Pekerjaan, Uang, Tugas"
                className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:text-white transition-all shadow-sm font-medium"
                required
                maxLength={40}
              />
            </div>
            <button type="submit" className="w-full py-4 bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 text-white rounded-2xl font-bold uppercase tracking-wider text-[11px] transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Kurung dalam Gelembung
            </button>
          </motion.form>
        </AnimatePresence>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center px-4">
            Pecahkan semua gelembung untuk melepaskan <span className="font-bold text-sky-600 dark:text-sky-400 px-1 py-0.5 bg-sky-50 dark:bg-sky-900/30 rounded">{stressWord}</span> dari pikiranmu.
          </p>
          
          <div className="grid grid-cols-6 gap-3 sm:gap-4 p-5 bg-sky-50 dark:bg-slate-800/80 rounded-3xl shadow-inner border border-sky-100 dark:border-slate-700/50 w-full max-w-[340px]">
            {bubbles.map((isPopped, idx) => (
              <div key={idx} className="relative aspect-square flex items-center justify-center">
                <AnimatePresence>
                  {isPopped && (
                     <motion.button
                       initial={false}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0, opacity: 0, filter: "blur(4px)" }}
                       transition={{ duration: 0.2, ease: "easeOut" }}
                       onClick={() => popBubble(idx)}
                       className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/90 to-white/40 dark:from-slate-600/90 dark:to-slate-700/40 backdrop-blur-md rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),_0_3px_6px_rgba(0,0,0,0.08)] border border-white dark:border-slate-500/50 hover:scale-105 active:scale-75 transition-transform group"
                     >
                       <div className="absolute top-[20%] left-[20%] w-[25%] h-[25%] bg-white rounded-full opacity-60 group-hover:scale-110 transition-transform" />
                     </motion.button>
                  )}
                </AnimatePresence>
                {!isPopped && <div className="w-2 h-2 bg-sky-200 dark:bg-slate-600 rounded-full opacity-50" />}
              </div>
            ))}
          </div>

          {bubblesLeft === 0 && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-8 flex flex-col items-center">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold mb-4 bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-5 h-5" /> Selesai!
              </div>
              <button 
                onClick={() => { setIsPlaying(false); setStressWord(''); }} 
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-4 opacity-80 hover:opacity-100 transition-all"
              >
                Mulai Lagi
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function ThoughtShredder() {
  const [text, setText] = useState('');
  const [shredding, setShredding] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleShred = () => {
    if (!text.trim()) return;
    setShredding(true);
    setTimeout(() => {
      setShredding(false);
      setCompleted(true);
      setText('');
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center min-h-[420px]">
      <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-amber-100 dark:ring-amber-900/50">
        <Trash2 className="w-7 h-7 text-amber-500 dark:text-amber-400" />
      </div>
      <h3 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-100 tracking-tight">Mesin Penghancur</h3>

      {!completed ? (
        <div className="relative w-full flex flex-col items-center">
          <div className="w-full flex justify-center z-10 h-48 overflow-hidden relative">
            <motion.div 
              animate={{ y: shredding ? 300 : 0, filter: shredding ? 'brightness(0.9)' : 'brightness(1)' }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="relative w-full max-w-[280px] bg-[#fcf9f2] dark:bg-slate-100 border border-slate-300 shadow-[0_5px_15px_rgba(0,0,0,0.05)] rounded-sm pb-10 origin-bottom"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #94a3b833 28px)',
                backgroundAttachment: 'local'
              }}
            >
              <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-rose-300/50" />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                disabled={shredding}
                placeholder="Tuliskan keluh kesah atau pikiran negatifmu di sini..."
                className="w-full h-44 resize-none pl-12 pr-4 py-4 pb-0 bg-transparent outline-none text-slate-700 leading-[28px] mt-[1px] font-[500] placeholder:text-slate-400 placeholder:italic"
                style={{ fontFamily: "'Indie Flower', cursive, sans-serif" }}
              />
            </motion.div>
            
            {/* The Shredder Machine */}
            <div className="absolute bottom-0 inset-x-4 h-14 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg z-20 flex flex-col justify-end pb-3 items-center shadow-lg border border-slate-300 dark:border-slate-600">
               <div className="w-full max-w-[320px] h-3 bg-slate-900 dark:bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-slate-400/30" />
               <div className="w-2 h-2 rounded-full mt-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            </div>
            
            <AnimatePresence>
               {shredding && (
                 <div className="absolute bottom-[-20px] w-[260px] h-28 flex justify-between z-0 px-1 overflow-visible">
                    {[...Array(18)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ y: 0, opacity: 0, rotate: 0 }}
                        animate={{ y: [0, 120], opacity: [0, 1, 0], rotate: [-5, 5, -10] }}
                        transition={{ duration: 1.2, delay: 0.8 + (Math.random() * 1.5), ease: "linear" }}
                        className="w-1.5 h-10 bg-[#fcf9f2] dark:bg-slate-200 border-x border-slate-200/50 rounded-sm shadow-sm"
                      />
                    ))}
                 </div>
               )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleShred}
            disabled={!text.trim() || shredding}
            className="mt-12 w-full max-w-[280px] py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {shredding ? (
              <span className="flex items-center gap-2 animate-pulse">Menghancurkan...</span>
            ) : (
              'Hancurkan Pikiran Ini'
            )}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mt-12 w-full">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50 dark:ring-green-900/10 text-green-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-center text-slate-700 dark:text-slate-300 font-semibold mb-8 text-lg">Pikiran negatif berhasil dimusnahkan.</p>
          <button 
            onClick={() => setCompleted(false)} 
            className="w-full max-w-[280px] py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Tulis Pikiran Lain
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ZenPattern() {
  const [activeColor, setActiveColor] = useState('#34d399'); 
  const [isFinished, setIsFinished] = useState(false);
  
  const colors = [
    { id: 'green', val: '#34d399' },
    { id: 'blue', val: '#60a5fa' },
    { id: 'indigo', val: '#818cf8' },
    { id: 'purple', val: '#c084fc' },
    { id: 'rose', val: '#fb7185' },
    { id: 'amber', val: '#fbbf24' }
  ];

  const patternsList = [
  // 1. Mandala (original)
  [
    { id: 1, d: 'M100 20 A80 80 0 0 1 180 100 L100 100 Z', fill: 'transparent' },
    { id: 2, d: 'M180 100 A80 80 0 0 1 100 180 L100 100 Z', fill: 'transparent' },
    { id: 3, d: 'M100 180 A80 80 0 0 1 20 100 L100 100 Z', fill: 'transparent' },
    { id: 4, d: 'M20 100 A80 80 0 0 1 100 20 L100 100 Z', fill: 'transparent' },
    { id: 5, d: 'M100 40 A60 60 0 0 1 142 58 L100 100 Z', fill: 'transparent' },
    { id: 6, d: 'M142 58 A60 60 0 0 1 160 100 L100 100 Z', fill: 'transparent' },
    { id: 7, d: 'M160 100 A60 60 0 0 1 142 142 L100 100 Z', fill: 'transparent' },
    { id: 8, d: 'M142 142 A60 60 0 0 1 100 160 L100 100 Z', fill: 'transparent' },
    { id: 9, d: 'M100 160 A60 60 0 0 1 58 142 L100 100 Z', fill: 'transparent' },
    { id: 10, d: 'M58 142 A60 60 0 0 1 40 100 L100 100 Z', fill: 'transparent' },
    { id: 11, d: 'M40 100 A60 60 0 0 1 58 58 L100 100 Z', fill: 'transparent' },
    { id: 12, d: 'M58 58 A60 60 0 0 1 100 40 L100 100 Z', fill: 'transparent' },
    { id: 13, d: 'M 100 30 Q 120 65 100 100 Q 80 65 100 30 Z', fill: 'transparent' },
    { id: 14, d: 'M 100 170 Q 120 135 100 100 Q 80 135 100 170 Z', fill: 'transparent' },
    { id: 15, d: 'M 30 100 Q 65 120 100 100 Q 65 80 30 100 Z', fill: 'transparent' },
    { id: 16, d: 'M 170 100 Q 135 120 100 100 Q 135 80 170 100 Z', fill: 'transparent' },
    { id: 17, d: 'M 50 50 Q 85 65 100 100 Q 65 85 50 50 Z', fill: 'transparent' },
    { id: 18, d: 'M 150 50 Q 115 65 100 100 Q 135 85 150 50 Z', fill: 'transparent' },
    { id: 19, d: 'M 150 150 Q 115 135 100 100 Q 135 115 150 150 Z', fill: 'transparent' },
    { id: 20, d: 'M 50 150 Q 85 135 100 100 Q 65 115 50 150 Z', fill: 'transparent' },
    { id: 21, d: 'M 100 100 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0', fill: 'transparent' }
  ],
  // 2. Crystal
  [
    { id: 1, d: 'M100 20 L140 60 L100 100 L60 60 Z', fill: 'transparent' },
    { id: 2, d: 'M140 60 L180 100 L140 140 L100 100 Z', fill: 'transparent' },
    { id: 3, d: 'M100 100 L140 140 L100 180 L60 140 Z', fill: 'transparent' },
    { id: 4, d: 'M60 60 L100 100 L60 140 L20 100 Z', fill: 'transparent' },
    { id: 5, d: 'M100 20 L180 100 L140 60 Z', fill: 'transparent' },
    { id: 6, d: 'M180 100 L100 180 L140 140 Z', fill: 'transparent' },
    { id: 7, d: 'M100 180 L20 100 L60 140 Z', fill: 'transparent' },
    { id: 8, d: 'M20 100 L100 20 L60 60 Z', fill: 'transparent' },
    { id: 9, d: 'M100 60 L120 100 L100 140 L80 100 Z', fill: 'transparent' },
    { id: 10, d: 'M100 80 L110 100 L100 120 L90 100 Z', fill: 'transparent' }
  ],
  // 3. Sunflower
  [
    { id: 1, d: 'M100 100 m -40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0', fill: 'transparent' },
    { id: 2, d: 'M 100 20 Q 115 40 100 60 Q 85 40 100 20 Z', fill: 'transparent' },
    { id: 3, d: 'M 100 180 Q 115 160 100 140 Q 85 160 100 180 Z', fill: 'transparent' },
    { id: 4, d: 'M 20 100 Q 40 115 60 100 Q 40 85 20 100 Z', fill: 'transparent' },
    { id: 5, d: 'M 180 100 Q 160 115 140 100 Q 160 85 180 100 Z', fill: 'transparent' },
    { id: 6, d: 'M 43 43 Q 65 50 72 72 Q 50 65 43 43 Z', fill: 'transparent' },
    { id: 7, d: 'M 157 157 Q 135 150 128 128 Q 150 135 157 157 Z', fill: 'transparent' },
    { id: 8, d: 'M 157 43 Q 135 50 128 72 Q 150 65 157 43 Z', fill: 'transparent' },
    { id: 9, d: 'M 43 157 Q 65 150 72 128 Q 50 135 43 157 Z', fill: 'transparent' },
    { id: 10, d: 'M100 100 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0', fill: 'transparent' }
  ],
  // 4. Abstract Geo
  [
    { id: 1, d: 'M20 20 L180 20 L100 100 Z', fill: 'transparent' },
    { id: 2, d: 'M20 20 L100 100 L20 180 Z', fill: 'transparent' },
    { id: 3, d: 'M180 20 L180 180 L100 100 Z', fill: 'transparent' },
    { id: 4, d: 'M20 180 L180 180 L100 100 Z', fill: 'transparent' },
    { id: 5, d: 'M60 60 L140 60 L100 100 Z', fill: 'transparent' },
    { id: 6, d: 'M60 140 L140 140 L100 100 Z', fill: 'transparent' },
    { id: 7, d: 'M60 60 L60 140 L100 100 Z', fill: 'transparent' },
    { id: 8, d: 'M140 60 L140 140 L100 100 Z', fill: 'transparent' }
  ]
];

  const [patternIndex, setPatternIndex] = useState(0);
  const [paths, setPaths] = useState(patternsList[0]);

  const handleColor = (id: number) => {
    setPaths(prev => prev.map(p => p.id === id ? { ...p, fill: activeColor } : p));
  };

  return (
    <div className="flex flex-col items-center">
       <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-indigo-100 dark:ring-indigo-900/50">
        <Palette className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100 tracking-tight">Pola Zen</h3>
      
      {!isFinished ? (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center px-6">
            Warnai pola mandala ini perlahan. Fokuslah pada setiap warna dan sentuhan.
          </p>

          <div className="w-64 h-64 bg-slate-50 dark:bg-slate-800/80 rounded-3xl shadow-inner border border-slate-200 dark:border-slate-700/80 flex items-center justify-center p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            <svg viewBox="0 0 200 200" className="w-[110%] h-[110%] drop-shadow-md cursor-crosshair relative z-10 transition-transform hover:scale-105 duration-700">
              {paths.map((p) => (
                <path
                  key={p.id}
                  d={p.d}
                  fill={p.fill === 'transparent' ? 'rgba(255,255,255, 0.5)' : p.fill}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1.5"
                  className="transition-colors duration-500 hover:brightness-95 dark:hover:brightness-110"
                  onClick={() => handleColor(p.id)}
                />
              ))}
            </svg>
          </div>

          <div className="flex gap-3 sm:gap-4 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full shadow-inner border border-slate-200 dark:border-slate-700 mb-6">
            {colors.map(color => (
              <button
                key={color.id}
                onClick={() => setActiveColor(color.val)}
                className={`w-8 h-8 rounded-full shadow-sm transition-all duration-300 ${activeColor === color.val ? 'scale-110 ring-4 ring-white dark:ring-slate-700 shadow-md translate-y-[-2px]' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                style={{ backgroundColor: color.val }}
              />
            ))}
          </div>

          <button 
            onClick={() => setIsFinished(true)} 
            className="w-full max-w-[280px] py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[1rem] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            Selesai Mewarnai
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mt-6 w-full">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50 dark:ring-indigo-900/10 text-indigo-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-center text-slate-700 dark:text-slate-300 font-semibold mb-6 text-lg">Karyamu sangat indah!</p>
          <div className="w-40 h-40 mb-8 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
              {paths.map((p) => (
                <path
                  key={p.id}
                  d={p.d}
                  fill={p.fill === 'transparent' ? 'rgba(255,255,255, 0.5)' : p.fill}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                />
              ))}
            </svg>
          </div>
          <button 
            onClick={() => {
              setIsFinished(false);
              const nextIndex = (patternIndex + 1) % patternsList.length;
              setPatternIndex(nextIndex);
              setPaths(patternsList[nextIndex]);
            }} 
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-4 opacity-80 hover:opacity-100 transition-all"
          >
            Mulai Ulang
          </button>
        </motion.div>
      )}
    </div>
  );
}
