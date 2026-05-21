const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacementAuthScreen = `{isAuthChecking ? (
        <main className="flex-grow flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 relative chat-pattern-bg overflow-hidden">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg border border-slate-200/50 animate-pulse">
              <CatBubbleIcon className="w-8 h-8 text-white" />
            </div>
            <p className="text-teal-700 dark:text-teal-400 font-bold uppercase tracking-widest text-xs animate-pulse">Memuat...</p>
          </div>
        </main>
      ) : (
        <main className="flex-grow flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-900 relative chat-pattern-bg overflow-hidden">
          <div className="w-full max-w-sm bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="w-16 h-16 bg-sage/20 dark:bg-teal-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-teal-600/10">
              <CatBubbleIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl font-bold font-sans text-center text-slate-800 dark:text-slate-200 mb-1">
              Selamat datang di AyoCurhat
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center text-xs mb-6 px-4">
              Ruang aman untuk berkeluh kesah dan menenangkan pikiran.
            </p>

            {authMode !== 'forgot-password' && (
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-6 shadow-inner">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                  className={\`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all \${authMode === 'login' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                  className={\`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all \${authMode === 'register' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                >
                  Daftar
                </button>
              </div>
            )}

            {authMode === 'forgot-password' && (
              <div className="mb-4">
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                  className="flex items-center gap-1 text-slate-500 hover:text-teal-600 text-xs font-medium transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> Kembali ke Masuk
                </button>
              </div>
            )}

            {(authError || authSuccess) && (
              <div className={\`p-3 -mt-2 mb-4 rounded-xl text-xs font-medium border \${authError ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-400' : 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800/50 dark:text-teal-400'}\`}>
                {authError || authSuccess}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 ml-1">Nama Panggilan</label>
                  <input 
                    type="text"
                    required
                    value={authDisplayName}
                    onChange={e => setAuthDisplayName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 dark:focus:border-teal-400 transition-colors dark:text-white"
                    placeholder="Nama kamu..."
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 ml-1">Email</label>
                <input 
                  type="email"
                  required
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 dark:focus:border-teal-400 transition-colors dark:text-white"
                  placeholder="email@contoh.com"
                />
              </div>

              {authMode !== 'forgot-password' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 ml-1">Kata Sandi</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none focus:border-teal-500 dark:focus:border-teal-400 transition-colors dark:text-white"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authMode === 'login' && (
                    <div className="flex justify-end mt-1">
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode('forgot-password'); setAuthError(''); setAuthSuccess(''); }}
                        className="text-[10px] text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3 bg-teal-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  authMode === 'login' ? 'Masuk' : authMode === 'register' ? 'Daftar Sekarang' : 'Kirim Link Reset'
                )}
              </button>
            </form>

            {authMode !== 'forgot-password' && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Atau</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                </div>
                
                <button 
                  onClick={() => signInWithGoogle()}
                  type="button"
                  className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Lanjutkan dengan Google
                </button>
              </>
            )}
          </div>
        </main>
      )}`;

const replacementRegex = /<main className="flex-grow flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 relative chat-pattern-bg overflow-hidden">[\s\S]*?<\/main>/;

code = code.replace(replacementRegex, replacementAuthScreen);

fs.writeFileSync('src/App.tsx', code);
