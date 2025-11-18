import Header from './components/Header'
import ChatPage from './pages/ChatPage'
import { ToastProvider } from './components/Toast'
import AuthPage from './pages/AuthPage'
import useChat from './hooks/useChat'
import useDarkMode from './hooks/useDarkMode'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const {
    messages,
    properties,
    currentProperty,
    conversationId,
    sendMessage,
    isLoading,
    error,
    isInitializing,
    switchToProperty,
    switchToHome,
  } = useChat(user?.id)

  const [isDark, toggleDark] = useDarkMode()

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />
  }

  // Show loading state while chat is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Initializing chat…</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 via-indigo-50/20 to-purple-50/10 dark:from-slate-950 dark:via-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors relative overflow-hidden">
        {/* Premium background pattern */}
        <div className="fixed inset-0 opacity-30 dark:opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <Header isDark={isDark} onToggleDark={toggleDark} user={user} />

        <ChatPage
          messages={messages}
          properties={properties}
          currentProperty={currentProperty}
          conversationId={conversationId}
          sendMessage={sendMessage}
          isLoading={isLoading}
          error={error}
          switchToProperty={switchToProperty}
          switchToHome={switchToHome}
          isDark={isDark}
        />
      </div>
    </ToastProvider>
  )
}
