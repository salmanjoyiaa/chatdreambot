import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import StreamingMessage from './components/StreamingMessage'
import ChatInput from './components/ChatInput'
import TypingDots from './components/TypingDots'
import QuickActions from './components/QuickActions'
import PropertyCard from './components/PropertyCard'
import EmptyState from './components/EmptyState'
import useChat from './hooks/useChat'
import useAutoScroll from './hooks/useAutoScroll'
import useDarkMode from './hooks/useDarkMode'
import useSmartSuggestions from './hooks/useSmartSuggestions'


export default function App() {
const { messages, sendMessage, isLoading, error } = useChat()
const listRef = useRef(null)
useAutoScroll(listRef, [messages, isLoading], isLoading || messages.length > 0)
const [isDark, toggleDark] = useDarkMode()
const [currentIntent, setCurrentIntent] = useState(null)
const smartSuggestions = useSmartSuggestions(messages, currentIntent)


useEffect(() => {
// On first load, greet the user if there are no messages
if (!messages.length) {
sendMessage('', {
systemGreet: true,
})
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])


// Check if message contains property list (for PropertyCard)
const isPropertyList = (text) => {
  if (!text) return false
  // Check for bullet points, unit numbers, or property list patterns
  const hasBullets = text.includes('•') || text.includes('-')
  const hasUnits = /Unit\s+\d+/i.test(text)
  const hasMultipleProperties = (text.match(/Unit\s+\d+/gi) || []).length > 1
  const hasListPattern = /Here are|Here is|properties with|properties that/i.test(text)
  
  return (hasBullets || hasUnits) && (hasMultipleProperties || hasListPattern)
}

return (
<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
<Header isDark={isDark} onToggleDark={toggleDark} />

<main className="flex-1 mx-auto w-full max-w-4xl px-3 sm:px-4 lg:px-6 pb-24 sm:pb-32 md:pb-36 pt-2 sm:pt-4">
<div
ref={listRef}
className="mt-2 sm:mt-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-14rem)] max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-14rem)] overflow-y-auto border border-slate-200/60 dark:border-slate-700/60 scroll-smooth will-change-scroll"
>
{messages.length === 0 && !isLoading && (
<EmptyState onSelect={(question) => {
  sendMessage(question)
  if (question.toLowerCase().includes('unit')) {
    setCurrentIntent('property_query')
  } else {
    setCurrentIntent('dataset_query')
  }
}} />
)}
<div className="space-y-4">
{messages.map((m, index) => {
  const isNewMessage = index === messages.length - 1
  
  // Check if this is a property list response
  if (m.role === 'bot' && isPropertyList(m.text)) {
    // Split by bullet points or lines, handle both • and - bullets
    const lines = m.text.split(/\n/).filter(line => line.trim())
    const propertyItems = lines.filter(line => {
      const trimmed = line.trim()
      return trimmed.startsWith('•') || 
             trimmed.startsWith('-') || 
             /Unit\s+\d+/i.test(trimmed) ||
             (trimmed.includes('–') && /Unit/i.test(trimmed))
    })
    
    if (propertyItems.length > 0) {
      // Also show the intro text if present
      const introText = lines.find(line => 
        !line.trim().startsWith('•') && 
        !line.trim().startsWith('-') &&
        /Here are|Here is|properties/i.test(line)
      )
      
      return (
        <div key={m.id}>
          {introText && (
            <div className="mb-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
              {introText.trim()}
            </div>
          )}
          <div className="space-y-3">
            {propertyItems.map((item, idx) => (
              <PropertyCard
                key={`${m.id}-${idx}`}
                property={item.replace(/^[•\-]\s*/, '').trim()}
                onQuickAction={(action) => {
                  sendMessage(action)
                  setCurrentIntent('property_query')
                }}
              />
            ))}
          </div>
        </div>
      )
    }
  }
  
  return (
    <div key={m.id}>
      <StreamingMessage 
        role={m.role} 
        text={m.text} 
        timestamp={m.timestamp}
        isNewMessage={isNewMessage}
        onComplete={() => {
          // Update intent based on response
          if (m.role === 'bot' && m.text) {
            if (m.text.includes('property') || m.text.includes('Unit')) {
              setCurrentIntent('property_query')
            } else if (m.text.includes('properties') || m.text.includes('Which')) {
              setCurrentIntent('dataset_query')
            }
          }
        }}
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
<div className="mt-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200/60 dark:border-red-800/60 rounded-xl p-4 shadow-sm">
<div className="flex items-start gap-2">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
</svg>
<span>{error}</span>
</div>
</div>
)}

{!isLoading && messages.length > 0 && smartSuggestions.length > 0 && (
<QuickActions 
  onSelect={(question) => {
    sendMessage(question)
    if (question.includes('property') || question.includes('Unit')) {
      setCurrentIntent('property_query')
    } else {
      setCurrentIntent('dataset_query')
    }
  }} 
  visible={!isLoading}
  suggestions={smartSuggestions}
/>
)}
</div>
</main>

<ChatInput onSend={(message) => {
  sendMessage(message)
  // Try to detect intent from message
  if (message.toLowerCase().includes('unit') || message.toLowerCase().match(/unit\s+\d+/i)) {
    setCurrentIntent('property_query')
  } else if (message.toLowerCase().includes('which') || message.toLowerCase().includes('properties')) {
    setCurrentIntent('dataset_query')
  }
}} isDark={isDark} />
</div>
)
}