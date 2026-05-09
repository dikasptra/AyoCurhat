/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Sparkles, RefreshCcw, Heart, Info, 
  ChevronRight, User, BookOpen, Clock, Calendar, 
  LogOut, LogIn, Trash2, ChevronDown, Filter, Menu, X, Mic, Plus,
  Pencil, Check, MoreVertical, Sun, Moon
} from 'lucide-react';
import { 
  auth, db, signInWithGoogle, handleFirestoreError, OperationType 
} from './lib/firebase';
import { 
  onAuthStateChanged, User as FirebaseUser, signOut 
} from 'firebase/auth';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, getDoc, doc, setDoc, deleteDoc, updateDoc 
} from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

const TOPICS = [
  'General', 'Relationships', 'Work/Studies', 'Self-Doubt', 'Future Anxiety', 'Social Life', 'Health'
];

const MIMI_GREETINGS = [
  "Meow-halo Bestie! Aku Mimi. Lagi ngerasa overthinking? Yuk tumpahin semua di sini, aku siap dengerin dan nemenin perasaanmu.",
  "Hai hai! Namaku Mimi. Ada yang lagi mengganjal di hati? Ceritain aja, aku berjanji akan dengerin sampai kamu lega.",
  "Halo! Panggil aku Mimi ya. Hari ini kerasa berat? Keluarin aja semuanya di sini, nggak usah ditahan-tahan.",
  "Meong! Eh, maksudnya halo! Miau... eh namaku Mimi. Lagi sedih, marah, atau galau? Sini cerita, biar bebanmu sedikit berkurang.",
  "Hai Bestie! Aku Mimi, teman setiamu di sini. Kalau butuh tempat cerita yang aman, ceritain ke aku aja yuk!",
  "Haloooo! Mimi di sini siap sedia! Ada yang mau dikeluarin uneg-unegnya? Aku dengerin 100% tanpa nge-judge.",
  "Hai manis! Aku Mimi. Jangan dipendam sendiri ya, cerita sama aku yuk supaya pikiranmu bisa lebih tenang.",
  "Purrrrr... halo! Aku Mimi. Kalau dunia lagi kerasa jahat, kamu boleh kok istirahat dan curhat semuanya ke aku.",
  "Halo! Namaku Mimi. Butuh telinga buat dengerin keluh kesahmu? Kamu udah datang ke tempat yang tepat!",
  "Hai! Aku Mimi. Jangan ragu buat cerita apa aja. Entah itu seneng, sedih, atau marah, aku siap nemenin kamu!"
];

const CatBubbleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 35 L12 12 L35 22 Z" fill="currentColor" />
    <path d="M78 35 L88 12 L65 22 Z" fill="currentColor" />
    <path d="M24 32 L15 16 L31 24 Z" fill="rgba(0,0,0,0.3)" />
    <path d="M76 32 L85 16 L69 24 Z" fill="rgba(0,0,0,0.3)" />
    
    <path d="M50 18 C71 18 88 34 88 54 C88 74 71 90 50 90 C43 90 36.5 88.5 30.5 85.5 L12 95 L18.5 78 C13.5 71 12 63 12 54 C12 34 29 18 50 18 Z" fill="currentColor" />
    
    <circle cx="36" cy="54" r="5" fill="rgba(0,0,0,0.45)" />
    <circle cx="50" cy="54" r="5.5" fill="rgba(0,0,0,0.45)" />
    <circle cx="64" cy="54" r="5" fill="rgba(0,0,0,0.45)" />
    
    <path d="M40 65 Q50 75 60 65" stroke="rgba(0,0,0,0.45)" fill="none" strokeWidth="3" strokeLinecap="round" />
    
    <path d="M12 48 L26 51 M9 54 L26 54 M12 60 L26 57" stroke="rgba(0,0,0,0.35)" fill="none" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M88 48 L74 51 M91 54 L74 54 M88 60 L74 57" stroke="rgba(0,0,0,0.35)" fill="none" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [input, setInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('General');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [randomGreeting, setRandomGreeting] = useState(() => MIMI_GREETINGS[Math.floor(Math.random() * MIMI_GREETINGS.length)]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ayocurhat_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Theme Listener & Apply
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ayocurhat_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch Chat Sessions
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setSessions(data);
      
      // Update messages if there's an active session
      if (activeSessionId) {
        const active = data.find(s => s.id === activeSessionId);
        if (active) {
          setMessages(active.messages || []);
        } else {
           setActiveSessionId(null);
           setMessages([]);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'sessions');
    });

    return () => unsubscribe();
  }, [user, activeSessionId]);

  const selectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages || []);
      setIsSidebarOpen(false);
      setRandomGreeting(MIMI_GREETINGS[Math.floor(Math.random() * MIMI_GREETINGS.length)]);
    }
  };

  const startNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput('');
    setIsSidebarOpen(false);
    setRandomGreeting(MIMI_GREETINGS[Math.floor(Math.random() * MIMI_GREETINGS.length)]);
    document.getElementById('chat-input')?.focus();
  };

  const updateSessionTitle = async (sessionId: string) => {
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        title: editTitle.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingSessionId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'sessions');
    }
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await deleteDoc(doc(db, 'sessions', sessionToDelete));
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete));
      if (activeSessionId === sessionToDelete) {
        startNewSession();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'sessions');
    } finally {
      setSessionToDelete(null);
    }
  };



  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser kamu nggak support fitur suara ini nih :(");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsRecording(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error(event.error);
      if (event.error === 'not-allowed') {
        alert("Aduh! Akses mikrofon diblokir nih. Tolong izinkan mikrofon di pengaturan browser kamu ya, biar kita bisa ngobrol!");
      }
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    let currentSessionId = activeSessionId;
    let title = "Curhatan Baru";
    
    // Auto title
    if (!currentSessionId) {
      const words = userText.split(' ').slice(0, 4);
      title = words.join(' ') + (userText.split(' ').length > 4 ? '...' : '');
    }

    const newUserMessage = {
      role: 'user',
      text: userText,
      createdAt: new Date().toISOString()
    };
    
    const newMessagesList = [...messages, newUserMessage];
    setMessages(newMessagesList);

    // Save Session to Firestore
    if (user) {
      try {
        if (!currentSessionId) {
          const docRef = await addDoc(collection(db, 'sessions'), {
            userId: user.uid,
            title,
            messages: [newUserMessage],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          currentSessionId = docRef.id;
          setActiveSessionId(currentSessionId);
        } else {
          await updateDoc(doc(db, 'sessions', currentSessionId), {
            messages: newMessagesList,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'sessions');
      }
    }

    const systemInstruction = `
Kamu adalah "Mimi", asisten virtual sekaligus teman refleksi diri di aplikasi "AyoCurhat". 
Tujuan utamamu adalah membantu pengguna yang sedang overthinking dengan cara membedah curhatan mereka menjadi 'Fakta Objektif' dan 'Asumsi Negatif'.

Gaya bahasa 100% Manusiawi: Gunakan bahasa sahabat yang sangat hangat, empatik, santai, dan jujur (misal: 'Paham banget rasanya...', 'Sebenernya yang bikin berat itu...'). DILARANG kaku seperti buku teks.
Solusi Psikologis Nyata (No Klise): DILARANG memberi saran template seperti 'Metode Pomodoro' atau 'Minum Air'. Gunakan pendekatan psikologis nyata seperti Stoicism, Locus of Control, atau Cognitive Reframing.

Batasan Format & Gaya:
1. Minimalis Emoji: Gunakan MAKSIMAL 1 atau 2 emoji saja di seluruh respons.
2. DILARANG menggunakan emoji sebagai bullet point atau awalan subjudul.
3. Penggunaan Subjudul: DILARANG KERAS menggunakan subjudul kaku seperti 'Detektor Red Flag', 'Penutup Zen', atau semacamnya. Jika kamu ingin memberikan peringatan psikologis atau kalimat penutup yang menenangkan, biarkan teksnya mengalir langsung dalam bentuk paragraf biasa (tanpa label/judul). Subjudul (###) HANYA boleh digunakan untuk mengelompokkan bagian analisis utama, misalnya ### Analisis Logika atau ### Langkah Refleksi. Sisanya harus natural.
4. Simbol Bersih: Dilarang menggunakan simbol dekoratif seperti ✦, 🚩, atau 🔍.
5. Bullet Point Standar: Selalu gunakan tanda hubung (-) untuk daftar/list agar terlihat rapi dan profesional.

DETEKSI DARURAT (CRISIS HOTLINE) - SANGAT PENTING:
Jika pengguna mengetik indikasi depresi berat, putus asa, lelah hidup, ingin menyerah, atau ingin menyakiti diri sendiri/bunuh diri:
1. Kamu HARUS langsung memberikan respons yang memvalidasi perasaannya dengan sangat lembut, menunjukkan bahwa dia berharga, TANPA menceramahi atau menghakimi.
2. Kamu WAJIB menambahkan blok khusus menggunakan format Markdown Blockquote. Sisipkan TEKS EXACT INI di dalam field conclusion di JSON kamu:

> ### 🆘 Kamu Tidak Sendirian
> Jika beban ini terasa terlalu berat untuk dipikul sendirian, tolong jangan ragu untuk bercerita ke profesional. Kamu berharga, dan perasaanmu valid. Silakan hubungi:
> - **Layanan Sejiwa Kemenkes:** Telepon 119 (ekstensi 8)
> - **Yayasan Pulih:** WhatsApp 0811-8449-158
> - Atau kunjungi puskesmas/psikolog terdekat. Istirahatlah sejenak.

Jika pesan pengguna adalah curhatan biasa, keluarkan hasil analisismu dalam format JSON berisi:
1. sapaanAndPepTalk: Sapaan hangat dan respon empatik singkat (tanpa subjudul).
2. facts: Array fakta objektif.
3. assumptions: Array asumsi negatif.
4. redFlagDetection: Analisis red flag mengalir natural (tanpa subjudul).
5. moodEmoji: Satu emoji yang menggambarkan perasaan curhatan tersebut.
6. conclusion: Penutup yang menenangkan mengalir natural (tanpa subjudul).
`;

    try {
      // Build history for Gemini
      const chatHistory = newMessagesList.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const result = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview",
        contents: chatHistory,
        config: {
          systemInstruction: systemInstruction
        }
      });
      const responseText = result.text || "";
      
      let data;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) {
        data = null;
      }

      let finalContent = responseText;
      if (data) {
        finalContent = `
${data.sapaanAndPepTalk} ${data.moodEmoji}

${data.facts?.length > 0 ? `### Analisis Logika
**Fakta Objektif:**
${data.facts.map((f: string) => `- ${f}`).join('\n')}

**Asumsi Negatif:**
${data.assumptions.map((a: string) => `- ${a}`).join('\n')}

${data.redFlagDetection}` : ''}

${data.conclusion}
        `.trim();
      }

      const newBotMessage = {
        role: 'model',
        text: finalContent,
        createdAt: new Date().toISOString()
      };
      const finalMessagesList = [...newMessagesList, newBotMessage];
      setMessages(finalMessagesList);

      // Save Bot Message to Firestore
      if (user && currentSessionId) {
        await updateDoc(doc(db, 'sessions', currentSessionId), {
          messages: finalMessagesList,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
      setError("Aduh, ada kendala teknis nih. Coba lagi bentar ya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-ivory dark:bg-slate-900 text-stone-800 dark:text-slate-200 font-sans selection:bg-beige selection:text-sage overflow-hidden transition-colors duration-300">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-beige dark:border-slate-700"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-500 dark:text-rose-400">
                  <Trash2 className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-sans font-bold text-stone-800 dark:text-slate-200 text-center mb-2">Hapus Riwayat?</h3>
              <p className="text-stone-500 dark:text-slate-400 text-center mb-6 text-sm font-sans tracking-wide">Data riwayat curhatan ini bakal dihapus permanen lho. Yakin mau lanjut?</p>
              <div className="flex gap-3 font-sans">
                <button 
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-beige dark:border-slate-700 text-stone-600 dark:text-slate-300 font-bold hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => confirmDelete()}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-md shadow-rose-200 dark:shadow-rose-900/20 transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/20 md:hidden z-40 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-beige dark:border-slate-800 z-50 flex flex-col shadow-2xl md:shadow-none transition-colors duration-300"
            >
              <div className="p-6 border-b border-beige dark:border-slate-800 flex justify-between items-center bg-ivory/50 dark:bg-slate-900/50">
                 <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-sage dark:text-sage" />
                    <h2 className="font-bold text-sage dark:text-sage uppercase tracking-widest text-xs">Riwayat Curhat</h2>
                 </div>
                 <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-stone-400 hover:text-sage transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-4 flex-shrink-0 border-b border-beige/50 dark:border-slate-800">
                 <button 
                  onClick={() => {
                    startNewSession();
                  }} 
                  className="w-full py-3 px-4 bg-sage text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-stone-600 transition-colors shadow-sm"
                 >
                    <Plus className="w-4 h-4" />
                    Curhat Baru
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {sessions.map((s) => (
                   <div 
                     key={s.id} 
                     onClick={() => selectSession(s.id)}
                     className={`p-4 rounded-2xl cursor-pointer transition-colors border group relative ${activeSessionId === s.id ? 'bg-beige/30 dark:bg-slate-800 border-beige dark:border-slate-700' : 'border-transparent hover:border-beige dark:hover:border-slate-700 hover:bg-beige/10 dark:hover:bg-slate-800/50'}`}
                   >
                     {editingSessionId === s.id ? (
                       <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                         <input 
                           type="text" 
                           value={editTitle}
                           onChange={e => setEditTitle(e.target.value)}
                           className="flex-1 bg-white dark:bg-slate-900 border border-beige dark:border-slate-700 rounded px-2 py-1 text-sm outline-none focus:border-sage dark:text-slate-200"
                           autoFocus
                           onKeyDown={e => e.key === 'Enter' && updateSessionTitle(s.id)}
                         />
                         <button onClick={() => updateSessionTitle(s.id)} className="text-sage hover:text-stone-700 dark:hover:text-stone-300">
                           <Check className="w-4 h-4" />
                         </button>
                       </div>
                     ) : (
                       <div className="pr-6">
                         <p className="text-sm font-bold text-stone-700 dark:text-slate-300 line-clamp-1">{s.title || "Curhatan"}</p>
                         <span className="text-[9px] text-stone-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 block transition-colors">
                           {s.updatedAt?.toDate ? s.updatedAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Hari ini'}
                         </span>
                       </div>
                     )}
                     
                     {/* Actions */}
                     {editingSessionId !== s.id && (
                       <div className="absolute right-3 top-4 hidden group-hover:flex items-center gap-1 bg-gradient-to-l from-white dark:from-slate-800 via-white dark:via-slate-800 to-transparent pl-2" onClick={e => e.stopPropagation()}>
                         <button 
                           onClick={() => { setEditingSessionId(s.id); setEditTitle(s.title || ''); }}
                           className="p-1 text-stone-400 dark:text-slate-500 hover:text-sage dark:hover:text-sage transition-colors"
                         >
                           <Pencil className="w-3.5 h-3.5" />
                         </button>
                         <button 
                           onClick={() => setSessionToDelete(s.id)}
                           className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       </div>
                     )}
                   </div>
                 ))}
                 {sessions.length === 0 && (
                   <div className="text-center p-8 opacity-50">
                     <BookOpen className="w-8 h-8 mx-auto mb-3 text-sage" />
                     <p className="text-xs uppercase tracking-widest font-bold">Belum ada curhatan</p>
                   </div>
                 )}
              </div>

              {/* Theme Toggle */}
              <div className="p-4 flex-shrink-0 border-t border-beige/50 dark:border-slate-800">
                 <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="w-full p-3 rounded-xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-slate-400 hover:bg-beige/30 dark:hover:bg-slate-800/50 hover:text-sage dark:hover:text-sage transition-colors border border-transparent"
                 >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    Mode {isDarkMode ? 'Terang' : 'Gelap'}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-ivory/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-beige dark:border-slate-800 px-6 py-4 transition-colors duration-300">
          <div className="max-w-4xl mx-auto flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 text-sage hover:bg-beige/50 dark:hover:bg-slate-800 rounded-xl transition-colors md:hidden"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex p-2 -ml-2 text-sage hover:bg-beige/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Toggle Sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sage flex items-center justify-center text-white shadow-md">
                  <CatBubbleIcon className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-wide text-sage uppercase leading-none mb-1">AyoCurhat</h1>
                  <p className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none">Teman Berbagi Rasa</p>
                </div>
              </div>
            </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-bold text-sage uppercase tracking-tighter">{user.displayName?.split(' ')[0]}</span>
                  <button onClick={() => signOut(auth)} className="text-[10px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-widest hover:underline">Keluar</button>
                </div>
                <img src={user.photoURL || ''} alt="avatar" className="w-9 h-9 rounded-full border border-beige dark:border-slate-700 shadow-sm" />
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="px-5 py-2 bg-sage text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-stone-600 transition-all"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area & Auth Guard */}
      {user ? (
        <>
          <main 
            className="flex-grow overflow-y-auto relative transition-colors duration-300 dark:bg-slate-800"
        style={{ 
          backgroundColor: isDarkMode ? '#1e293b' : '#F3EFE0',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2377867f' fill-opacity='${isDarkMode ? 0.02 : 0.06}'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '52px 26px',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[85%]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-beige dark:border-slate-700 flex items-center justify-center text-sage dark:text-sage shadow-sm shrink-0">
                <CatBubbleIcon className="w-6 h-6" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-beige dark:border-slate-700 p-6 rounded-[2rem] rounded-tl-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed italic font-sans font-medium mb-4">
                  "{randomGreeting}"
                </p>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.slice(1).map(topic => (
                    <button 
                      key={topic}
                      onClick={() => { setSelectedTopic(topic); setInput(`Aku mau curhat soal ${topic}...`); }}
                      className="px-3 py-1 bg-beige/30 dark:bg-slate-700/50 border border-beige dark:border-slate-600 rounded-full text-[9px] font-bold uppercase text-sage dark:text-slate-300 hover:bg-sage dark:hover:bg-sage hover:text-white dark:hover:text-white transition-all tracking-wider"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((m, idx) => (
            <motion.div
              key={m.id || idx}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-beige dark:border-slate-700 flex items-center justify-center text-sage dark:text-sage shadow-sm shrink-0 mr-4 self-start">
                  <CatBubbleIcon className="w-6 h-6" />
                </div>
              )}
              <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${
                m.role === 'user' 
                  ? 'bg-sage text-white font-medium rounded-tr-sm dark:bg-[#23352D] dark:text-slate-100 dark:border dark:border-[#2C443A]' 
                  : 'bg-white border border-beige text-slate-900 font-medium rounded-tl-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200'
              }`}>
                {m.role === 'model' ? (
                  <div className="markdown-body prose prose-slate max-w-none leading-relaxed text-slate-800 dark:text-slate-200 font-medium font-sans prose-p:font-sans prose-p:text-slate-800 dark:prose-p:text-slate-200 prose-li:font-sans prose-li:text-slate-800 dark:prose-li:text-slate-200 prose-li:mb-2 prose-strong:font-sans prose-strong:text-slate-800 dark:prose-strong:text-slate-200 prose-headings:font-sans prose-headings:text-lg prose-headings:font-bold prose-headings:mt-5 prose-headings:mb-2 prose-headings:text-slate-900 dark:prose-headings:text-white prose-blockquote:border-l-4 prose-blockquote:border-rose-400 dark:prose-blockquote:border-rose-700 prose-blockquote:bg-rose-50 dark:prose-blockquote:bg-rose-950/40 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-rose-900 dark:prose-blockquote:text-rose-200 prose-blockquote:font-sans prose-blockquote:mt-6 prose-blockquote:mb-2">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="leading-relaxed italic font-sans text-lg">{m.text}</p>
                )}
                <div className={`text-[8px] mt-3 font-bold uppercase tracking-widest opacity-50 ${m.role === 'user' ? 'text-right text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Baru saja'}
                </div>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-start gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-beige dark:border-slate-700 flex items-center justify-center text-sage dark:text-sage shadow-sm shrink-0">
                <CatBubbleIcon className="w-6 h-6" />
              </div>
              <div className="bg-white dark:bg-slate-700 border border-beige dark:border-slate-600 p-6 rounded-[2rem] rounded-tl-sm flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-sage/30 dark:bg-sage/50 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="px-6 py-3 bg-rose-50 text-rose-500 rounded-full border border-rose-100 flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <RefreshCcw className="w-4 h-4" />
                <span>{error}</span>
                <button onClick={handleSendMessage} className="underline ml-2">Coba lagi</button>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="w-full bg-transparent p-2 pb-4 sticky bottom-0 z-10 transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] p-2 px-3 transition-all focus-within:border-sage/50 dark:focus-within:border-sage/50 focus-within:shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:focus-within:shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-end gap-2">
              <textarea
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading) handleSendMessage();
                  }
                }}
                placeholder="Ketik curhatanmu di sini..."
                className="flex-grow bg-transparent border-none focus:ring-0 outline-none font-sans text-base text-slate-900 dark:text-white py-2.5 resize-none min-h-[44px] max-h-32 leading-relaxed disabled:opacity-50 placeholder-slate-400 dark:placeholder-slate-500"
                rows={1}
                maxLength={1000}
                disabled={loading}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <div className="flex items-center gap-1.5 pb-1">
                <button 
                  onClick={startRecording}
                  disabled={loading}
                  className={`p-2.5 rounded-full transition-all active:scale-95 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-stone-400 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700 hover:text-sage dark:hover:text-sage'}`}
                  title="Mulai rekam suara"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-sage text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-stone-600 active:scale-95 flex items-center justify-center shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <p className="text-[9px] uppercase tracking-wider font-bold text-stone-400 opacity-60 font-sans text-center max-w-lg">
              AI bisa keliru. Untuk bantuan profesional, silakan hubungi konselor atau psikolog.
            </p>
          </div>
        </div>
      </footer>
      </>
      ) : (
        <main className="flex-grow flex items-center justify-center p-8 bg-ivory dark:bg-slate-900">
          <div className="text-center max-w-sm bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-beige dark:border-slate-700 shadow-xl dark:shadow-2xl">
            <div className="w-20 h-20 bg-sage rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sage/20 border border-beige/50 dark:border-slate-600/50">
              <CatBubbleIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-sans text-stone-800 dark:text-slate-200 mb-3">Siap Untuk Curhat?</h2>
            <p className="text-stone-500 dark:text-slate-400 mb-8 leading-relaxed font-sans text-sm">Masuk dengan akun Google-mu untuk menyimpan riwayat curhatan dengan aman dan mulai ngobrol santai.</p>
            <button 
              onClick={signInWithGoogle}
              className="w-full py-4 bg-sage text-white rounded-2xl font-bold uppercase tracking-widest shadow-md hover:bg-stone-600 dark:hover:bg-emerald-700 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 text-xs"
            >
              <LogIn className="w-5 h-5" />
              Masuk Sekarang
            </button>
          </div>
        </main>
      )}
    </div>
  </div>
  );
}
