import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import ChatInput from './components/ChatInput'
import { ToastProvider } from './components/Toast'
import TypingDots from './components/TypingDots'
import EmptyState from './components/EmptyState'
import StreamingMessage from './components/StreamingMessage'
import AuthPage from './pages/AuthPage'
import useChat from './hooks/useChat'
import useAutoScroll from './hooks/useAutoScroll'
import useDarkMode from './hooks/useDarkMode'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const {
    messages,
    properties,
    currentProperty,
    sendMessage,
    isLoading,
    error,
    isInitializing,
  } = useChat(user?.id)

  const listRef = useRef(null)
  useAutoScroll(listRef, [messages, isLoading], isLoading || messages.length > 0)
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

        <Header
          isDark={isDark}
          onToggleDark={toggleDark}
          user={user}
          currentProperty={currentProperty}
        />

        <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 pt-1 relative z-10">
          <div
            ref={listRef}
            className="mt-1 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-2xl shadow-md p-4 sm:p-6 min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-12rem)] max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto border border-white/10 dark:border-slate-700/40 scroll-smooth will-change-scroll ring-1 ring-black/5 dark:ring-white/5"
          >
            {messages.length === 0 && !isLoading && (
              <EmptyState
                onSelect={(question) => {
                  sendMessage(question)
                }}
              />
            )}

            <div className="space-y-4" role="log" aria-live="polite" aria-atomic="false">
              {messages.map((m, index) => {
                const isNewMessage = index === messages.length - 1

                return (
                  <div key={m.id} aria-label={`${m.role} message`}>
                    <StreamingMessage
                      role={m.role}
                      text={m.text}
                      timestamp={m.timestamp}
                      isNewMessage={isNewMessage}
                    />
                  </div>
                )
              })}
            </div>

            {isLoading && (
              <div>
                <TypingDots />
              </div>
            )}

            {error && (
              <div className="mt-4 text-sm text-red-700 dark:text-red-300 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200/60 dark:border-red-800/50 rounded-2xl p-4 sm:p-5 shadow-lg shadow-red-500/10 dark:shadow-red-900/20 ring-1 ring-red-200/50 dark:ring-red-800/30">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>
        </main>

        <ChatInput
          onSend={(message) => {
            sendMessage(message)
          }}
          isDark={isDark}
        />
      </div>
    </ToastProvider>
  )
}
