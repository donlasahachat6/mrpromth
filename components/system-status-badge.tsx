'use client'

import { useEffect, useState } from 'react'

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'error'
  mode?: 'mock' | 'live'
  message?: string
  services?: {
    database?: { status: string; message?: string }
    authentication?: { status: string; message?: string }
    ai?: { status: string; message?: string }
  }
}

export function SystemStatusBadge() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        status: 'error',
        message: 'Cannot check system status',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!status || status.status === 'healthy') {
    // Don't show badge if everything is healthy
    return null
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'degraded':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`${getStatusColor()} border rounded-lg shadow-lg transition-all duration-200 ${
          expanded ? 'w-80' : 'w-auto'
        }`}
      >
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:opacity-80 transition-opacity"
        >
          {getStatusIcon()}
          <span className="text-xs font-medium">
            {status.mode === 'mock' ? '⚠️ Mock Mode' : 'System Status'}
          </span>
          <svg
            className={`w-4 h-4 ml-auto transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="px-3 pb-3 space-y-2 border-t border-current/10">
            {status.message && (
              <p className="text-xs mt-2">{status.message}</p>
            )}

            {status.services && (
              <div className="space-y-1 text-xs">
                {status.services.database && (
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <span className="font-medium">
                      {status.services.database.status}
                    </span>
                  </div>
                )}
                {status.services.authentication && (
                  <div className="flex items-center justify-between">
                    <span>Auth:</span>
                    <span className="font-medium">
                      {status.services.authentication.status}
                    </span>
                  </div>
                )}
                {status.services.ai && (
                  <div className="flex items-center justify-between">
                    <span>AI:</span>
                    <span className="font-medium">
                      {status.services.ai.status}
                    </span>
                  </div>
                )}
              </div>
            )}

            {status.mode === 'mock' && (
              <div className="mt-2 pt-2 border-t border-current/10">
                <p className="text-xs">
                  <strong>Note:</strong> Running in mock mode. Data will not persist.
                </p>
              </div>
            )}

            <button
              onClick={checkSystemStatus}
              className="w-full mt-2 px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Refresh Status
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
