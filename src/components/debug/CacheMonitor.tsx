'use client';

import React, { useState, useEffect } from 'react';
import { useBookDataStore } from '@/store/bookDataStore';

interface CacheMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const CacheMonitor: React.FC<CacheMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}) => {
  const { getCacheStats, clearExpiredCache, clearAllCache } = useBookDataStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState(() => getCacheStats());

  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      setStats(getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [enabled, getCacheStats]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      <div className="bg-base-300 rounded-lg shadow-lg p-2 min-w-48">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="text-xs font-semibold text-base-content">
            📚 Cache Monitor
          </div>
          <div className="text-xs text-base-content/70">
            {stats.cachedBooks}/{stats.totalBooks}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-base-content/60">Total Books:</div>
                <div className="font-mono">{stats.totalBooks}</div>
              </div>
              <div>
                <div className="text-base-content/60">Cached:</div>
                <div className="font-mono text-success">{stats.cachedBooks}</div>
              </div>
              <div>
                <div className="text-base-content/60">Cache Size:</div>
                <div className="font-mono">{stats.cacheSize} items</div>
              </div>
              <div>
                <div className="text-base-content/60">Hit Rate:</div>
                <div className="font-mono">
                  {stats.totalBooks > 0 
                    ? `${Math.round((stats.cachedBooks / stats.totalBooks) * 100)}%`
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {stats.oldestCacheTime && (
              <div className="text-xs">
                <div className="text-base-content/60">Oldest Cache:</div>
                <div className="font-mono text-xs">
                  {formatTime(stats.oldestCacheTime)}
                </div>
              </div>
            )}

            <div className="flex gap-1">
              <button
                className="btn btn-xs btn-warning"
                onClick={() => {
                  clearExpiredCache();
                  setStats(getCacheStats());
                }}
                title="清除过期缓存"
              >
                🧹 Expired
              </button>
              <button
                className="btn btn-xs btn-error"
                onClick={() => {
                  clearAllCache();
                  setStats(getCacheStats());
                }}
                title="清除所有缓存"
              >
                🗑️ All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheMonitor;