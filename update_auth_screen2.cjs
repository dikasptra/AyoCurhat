const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacementAuthScreen = `{isAuthChecking ? (
        <main className="flex-grow flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 relative chat-pattern-bg overflow-hidden">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
              <CatBubbleIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-grow flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-900 relative chat-pattern-bg overflow-hidden">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl dark:shadow-2xl z-10 relative">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-teal-100 dark:ring-teal-900/50">
                <CatBubbleIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
                {authMode === 'login' ? 'Selamat Datang' : authMode === 'register' ? 'Buat Akun' : 'Reset Sandi'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                {authMode === 'login' ? 'Masuk untuk melanjutkan curhatmu.' : authMode === 'register' ? 'Daftar agar riwayatmu tersimpan aman.' : 'Masukkan emailmu untuk mengatur ulang sandi.'}
              </p>
            </div>

            {(authError || authSuccess) && (
              <div className={\`p-3 mb-6 rounded-lg text-sm font-medium border \${authError ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-400' : 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800/50 dark:text-teal-400'}\`}>
                {authError || authSuccess}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <input 
                    type="text"
                    required
                    value={authDisplayName}
                    onChange={e => setAuthDisplayName(e.target.value)}
                    className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400 placeholder:text-slate-400"
                    placeholder="Nama Panggilan"
                  />
                </div>
              )}

              <div>
                <input 
                  type="email"
                  required
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className={\`w-full bg-transparent border \${authEmail && !authEmail.includes('@') ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500 dark:focus:border-teal-400 dark:focus:ring-teal-400'} rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 transition-all dark:text-white placeholder:text-slate-400\`}
                  placeholder="Email"
                />
              </div>

              {authMode !== 'forgot-password' && (
                <div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className={\`w-full bg-transparent border \${authPassword && authPassword.length < 8 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500 dark:focus:border-teal-400 dark:focus:ring-teal-400'} rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:ring-1 transition-all dark:text-white placeholder:text-slate-400\`}
                      placeholder="Kata Sandi"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'login' && (
                <div className="flex justify-end pt-1">
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('forgot-password'); setAuthError(''); setAuthSuccess(''); }}
                    className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                  >
                    Lupa sandi?
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={authLoading || !authEmail.includes('@') || (authMode !== 'forgot-password' && authPassword.length < 8) || (authMode === 'register' && !authDisplayName.trim())}
                className="w-full mt-2 py-3 bg-teal-600 text-white rounded-xl font-medium text-sm shadow-sm hover:bg-teal-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  authMode === 'login' ? 'Masuk' : authMode === 'register' ? 'Daftar' : 'Kirim Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {authMode === 'login' ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Belum punya akun?{' '}
                  <button onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                    Daftar di sini
                  </button>
                </p>
              ) : authMode === 'register' ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sudah punya akun?{' '}
                  <button onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                    Masuk
                  </button>
                </p>
              ) : (
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                  className="flex items-center justify-center w-full gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> Kembali ke Masuk
                </button>
              )}
            </div>

            {authMode !== 'forgot-password' && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                  <span className="text-xs text-slate-400 font-medium px-1">Atau</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                </div>
                
                <button 
                  onClick={() => signInWithGoogle()}
                  type="button"
                  className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
              </>
            )}
          </div>
        </main>
      )}`;

const replacementRegex = /\{isAuthChecking \? \([\s\S]*?<\/main>\n      \)/;

code = code.replace(replacementRegex, replacementAuthScreen);

fs.writeFileSync('src/App.tsx', code);
