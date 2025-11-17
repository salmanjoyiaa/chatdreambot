import { useState, useMemo, useCallback } from 'react'

export default function PropertyResultsCard({ properties = [], area, onQuickAction }) {
  const [activeFilter, setActiveFilter] = useState('all')

  // Validate properties array
  const validProperties = useMemo(() => {
    if (!Array.isArray(properties)) return []
    return properties.filter(p => p && typeof p === 'object')
  }, [properties])

  // Extract unique filters from properties
  const filters = useMemo(() => {
    const hasPool = validProperties.some(p => p.hasPool === true)
    const hasCamera = validProperties.some(p => p.hasCamera === true)
    const types = new Set(validProperties.map(p => p.type).filter(Boolean))

    return {
      hasPool,
      hasCamera,
      types: Array.from(types).sort(),
    }
  }, [validProperties])

  // Filter properties based on active filter
  const filteredProperties = useMemo(() => {
    if (activeFilter === 'all') return validProperties
    if (activeFilter === 'pool') return validProperties.filter(p => p.hasPool === true)
    if (activeFilter === 'camera') return validProperties.filter(p => p.hasCamera === true)
    return validProperties.filter(p => p.type === activeFilter)
  }, [validProperties, activeFilter])

  return (
    <div className="space-y-4 w-full">
      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
        {/* All Properties Button */}
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
            activeFilter === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20'
              : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-600/50'
          }`}
        >
          All ({validProperties.length})
        </button>

        {/* Pool/Hot Tub Filter */}
        {filters.hasPool && (
          <button
            onClick={() => setActiveFilter('pool')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
              activeFilter === 'pool'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20'
                : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-600/50'
            }`}
          >
            <span>🏊</span>
            <span>Pool ({validProperties.filter(p => p.hasPool).length})</span>
          </button>
        )}

        {/* Camera Filter */}
        {filters.hasCamera && (
          <button
            onClick={() => setActiveFilter('camera')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
              activeFilter === 'camera'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20'
                : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-600/50'
            }`}
          >
            <span>📹</span>
            <span>Security ({validProperties.filter(p => p.hasCamera).length})</span>
          </button>
        )}

        {/* Property Type Filters */}
        {filters.types.map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 capitalize ${
              activeFilter === type
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20'
                : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-600/50'
            }`}
          >
            {type} ({validProperties.filter(p => p.type === type).length})
          </button>
        ))}
      </div>

      {/* Property Grid */}
      <div className="space-y-3">
        {filteredProperties.length === 0 ? (
          <div className="p-6 text-center text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-sm">No properties match this filter</p>
          </div>
        ) : (
          filteredProperties.map((prop, idx) => (
            <div
              key={`${prop.unit}-${idx}`}
              className="group p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300/50 dark:hover:border-blue-600/30"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  {prop.unit && (
                    <span className="inline-block px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg mb-2 shadow-md shadow-blue-500/20">
                      Unit {prop.unit}
                    </span>
                  )}
                  {prop.title && (
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words leading-tight">
                      {prop.title}
                    </h4>
                  )}
                </div>
                {prop.rating && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100/80 dark:bg-yellow-900/30 rounded-lg flex-shrink-0">
                    <span className="text-yellow-500 dark:text-yellow-400">⭐</span>
                    <span className="text-xs sm:text-sm font-bold text-yellow-700 dark:text-yellow-300">
                      {prop.rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs sm:text-sm">
                {prop.price && (
                  <div className="bg-slate-50/80 dark:bg-slate-700/40 p-2 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-0.5">Price</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">${prop.price}/night</span>
                  </div>
                )}
                {prop.type && (
                  <div className="bg-slate-50/80 dark:bg-slate-700/40 p-2 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-0.5">Type</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 capitalize">{prop.type}</span>
                  </div>
                )}
                {prop.bedBath && (
                  <div className="bg-slate-50/80 dark:bg-slate-700/40 p-2 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-0.5">Beds/Bath</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{prop.bedBath}</span>
                  </div>
                )}
                {prop.maxGuests && (
                  <div className="bg-slate-50/80 dark:bg-slate-700/40 p-2 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-0.5">Guests</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">Max {prop.maxGuests}</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {(prop.hasPool || prop.hasCamera || prop.hasWifi) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {prop.hasPool && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
                      🏊 Pool
                    </span>
                  )}
                  {prop.hasCamera && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold">
                      📹 Security
                    </span>
                  )}
                  {prop.hasWifi && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-semibold">
                      📶 WiFi
                    </span>
                  )}
                </div>
              )}

              {/* Area Badge */}
              {(prop.area || area) && (
                <div className="mb-3 text-xs text-slate-600 dark:text-slate-400">
                  📍 <span className="font-semibold text-slate-900 dark:text-slate-200">{prop.area || area}</span>
                </div>
              )}

              {/* Quick Actions */}
              {onQuickAction && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                  <button
                    onClick={() => onQuickAction(`WiFi password for unit ${prop.unit}`)}
                    className="flex-1 min-w-[100px] px-3 py-2 text-xs font-semibold bg-slate-100/70 dark:bg-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-600/60 text-slate-700 dark:text-slate-200 rounded-lg transition-all duration-200 active:scale-95 border border-slate-200/50 dark:border-slate-600/50"
                  >
                    📶 WiFi
                  </button>
                  <button
                    onClick={() => onQuickAction(`Does unit ${prop.unit} have parking?`)}
                    className="flex-1 min-w-[100px] px-3 py-2 text-xs font-semibold bg-slate-100/70 dark:bg-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-600/60 text-slate-700 dark:text-slate-200 rounded-lg transition-all duration-200 active:scale-95 border border-slate-200/50 dark:border-slate-600/50"
                  >
                    🚗 Parking
                  </button>
                  <button
                    onClick={() => onQuickAction(`Tell me more about unit ${prop.unit}`)}
                    className="flex-1 min-w-[100px] px-3 py-2 text-xs font-semibold bg-blue-100/70 dark:bg-blue-900/30 hover:bg-blue-200/70 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 active:scale-95 border border-blue-200/50 dark:border-blue-700/50"
                  >
                    ℹ️ Details
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
