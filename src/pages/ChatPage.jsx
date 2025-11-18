import { useState, useRef, useEffect } from 'react'
import StreamingMessage from '../components/StreamingMessage'
import TypingDots from '../components/TypingDots'
import EmptyState from '../components/EmptyState'
import ChatInput from '../components/ChatInput'
import useAutoScroll from '../hooks/useAutoScroll'

export default function ChatPage({
  messages,
  properties,
  currentProperty,
  conversationId,
  sendMessage,
  isLoading,
  error,
  switchToProperty,
  switchToHome,
  isDark,
}) {
  const [activeTab, setActiveTab] = useState('home')
  const listRef = useRef(null)

  useAutoScroll(listRef, [messages, isLoading], isLoading || messages.length > 0)

  // Auto-switch tab when currentProperty changes
  useEffect(() => {
    if (currentProperty) {
      setActiveTab(`property-${currentProperty.id}`)
    } else {
      setActiveTab('home')
    }
  }, [currentProperty])

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'home') {
      switchToHome()
    } else {
      const propertyId = tabId.replace('property-', '')
      switchToProperty(propertyId)
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 relative z-10">
      {/* Sidebar with tabs */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-sm p-3 sm:p-4 overflow-y-auto">
          <div className="space-y-2">
            {/* Home Tab */}
            <button
              onClick={() => handleTabClick('home')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M10.795 16.505a.75.75 0 00-1.06 0l-6-6a.75.75 0 111.06-1.06L9.75 14.69l5.25-5.25a.75.75 0 111.06 1.06l-6 6z" />
                </svg>
                <span>Home</span>
              </div>
              <p className="text-xs opacity-75 mt-1 ml-6">General Questions</p>
            </button>

            {/* Property Tabs */}
            {properties.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Properties
                </p>
                {properties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => handleTabClick(`property-${prop.id}`)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 truncate ${
                      activeTab === `property-${prop.id}`
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                    title={prop.name}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 flex-shrink-0"
                      >
                        <path d="M11.47 3.84a.75.75 0 001.06 0l8.69 8.69a.75.75 0 101.06-1.06L12 2.69 2.81 11.88a.75.75 0 001.06 1.06l8.69-8.69z" />
                      </svg>
                      <span className="truncate">{prop.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Chat messages container */}
        <div
          ref={listRef}
          className="flex-1 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-2xl shadow-md p-4 sm:p-6 overflow-y-auto border border-white/10 dark:border-slate-700/40 scroll-smooth will-change-scroll ring-1 ring-black/5 dark:ring-white/5"
        >
          <div className="space-y-4" role="log" aria-live="polite" aria-atomic="false">
            {messages.length === 0 && !isLoading && <EmptyState onSelect={sendMessage} />}

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

            {isLoading && <TypingDots />}

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
        </div>

        {/* Chat input */}
        <div className="mt-4">
          <ChatInput onSend={sendMessage} isDark={isDark} />
        </div>
      </main>
    </div>
  )
}
