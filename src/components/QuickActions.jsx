const DEFAULT_QUESTIONS = [
  "Which properties have pools?",
  "Show me properties under $200",
  "Which property is a mansion?",
  "What's the highest-rated property?",
  "Properties with 3 bedrooms?",
  "Which properties sleep 8+ guests?",
]

export default function QuickActions({ onSelect, visible = true, suggestions = null }) {
  if (!visible) return null

  const questions = suggestions || DEFAULT_QUESTIONS

  return (
    <div className="mt-4 sm:mt-6">
      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 px-1 break-words overflow-wrap-anywhere">
        {suggestions ? "You might also want to know:" : "Try asking:"}
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {questions.slice(0, 6).map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(question)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-800 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] min-w-0"
            style={{ 
              wordBreak: 'break-word', 
              whiteSpace: 'normal',
              lineHeight: '1.4',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
            title={question}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

