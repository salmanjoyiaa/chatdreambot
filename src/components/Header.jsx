import DarkModeToggle from './DarkModeToggle'
import { useAuth } from '../context/AuthContext'

export default function Header({ isDark, onToggleDark, user }) {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-white/95 via-slate-50/95 to-blue-50/95 dark:from-slate-950/95 dark:via-slate-900/95 dark:to-slate-950/95 border-b border-slate-200/50 dark:border-slate-700/30 shadow-sm">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative p-2 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl shadow-md flex-shrink-0 ring-1 ring-blue-400/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
                Property AI
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Smart BnB Assistant</p>
            </div>
          </div>

          {/* User Info and Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user && (
              <>
                <div className="hidden sm:block text-right border-r border-slate-200 dark:border-slate-700 pr-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Logged in</p>
                  <p className="text-sm text-slate-900 dark:text-slate-200 font-medium truncate max-w-xs">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                >
                  Logout
                </button>
              </>
            )}

            {/* Dark Mode Toggle */}
            <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
          </div>
        </div>
      </div>
    </header>
  )
}