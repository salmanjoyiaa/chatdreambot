import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useToast } from './Toast'

export default function StreamingMessage({ text, role = 'bot', timestamp, onComplete, isNewMessage = false, onRetry }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (!text) return

    // Show full text immediately for both user and bot messages.
    // This removes the typing/streaming animation so replies appear instantly.
    setDisplayedText(text)
    setIsStreaming(false)
    if (onComplete) onComplete()
  }, [text, role, onComplete, isNewMessage])

  useEffect(() => {
    // entrance animation
    const t = setTimeout(() => setMounted(true), 20)
    return () => clearTimeout(t)
  }, [])

  const isUser = role === 'user'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayedText || text || '')
      showToast('Copied to clipboard', 'success')
    } catch (e) {
      console.warn('Copy failed', e)
      showToast('Copy failed', 'error')
    }
  }

  const handleRetry = () => {
    if (onRetry) onRetry()
  }

  const handleRetryWithToast = () => {
    if (onRetry) {
      showToast('Regenerating response...', 'info')
      onRetry()
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-3`}>
      <div
        className={`relative group ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
            : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 shadow-md shadow-slate-900/5 dark:shadow-slate-900/30'
        } rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] border ${
          isUser ? 'border-blue-400/30' : 'border-slate-200/60 dark:border-slate-700/40'
        } break-words backdrop-blur-sm transition-all duration-200 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        {/* Action buttons */}
        <div className="absolute -top-10 right-0 flex items-center gap-2 z-20 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-150">
          <button
            onClick={handleCopy}
            title="Copy message"
            aria-label="Copy message"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M16 1H4a2 2 0 00-2 2v12h2V3h12V1z" />
              <path d="M20 5H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h12v14z" />
            </svg>
          </button>

          {onRetry && (
            <button
              onClick={handleRetryWithToast}
              title="Regenerate"
              aria-label="Retry message"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-4 h-4"
              >
                <path d="M21 12a9 9 0 11-3.4-7.1" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            </button>
          )}
        </div>

        {/* Message content */}
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-strong:font-semibold prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-a:font-medium hover:prose-a:underline">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            components={{
              p: ({ node, ...props }) => (
                <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  {...props}
                />
              ),
              code: ({ node, inline, className, children, ...props }) =>
                inline ? (
                  <code
                    className={`${className || ''} font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code className={`${className || ''} block font-mono text-xs`} {...props}>
                    {children}
                  </code>
                ),
            }}
          >
            {displayedText || ''}
          </ReactMarkdown>
        </div>

        {isStreaming && role === 'bot' && (
          <span className="inline-block w-1.5 h-4 ml-1.5 bg-blue-500 dark:bg-blue-400 animate-pulse rounded-sm" />
        )}

        {timestamp && (
          <div
            className={`mt-2 text-xs font-medium ${
              isUser ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>
    </div>
  )
}

