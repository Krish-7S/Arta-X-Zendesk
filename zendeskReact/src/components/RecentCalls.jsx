import { useState, useMemo } from 'react'
import { FaArrowDown, FaArrowUp, FaPhone, FaPhoneSlash, FaUserPlus } from 'react-icons/fa'
import { useAppContext } from '../app/contexts/AppContext'

export default function RecentCalls({ calls = [] }) {
  const { dispatch } = useAppContext()
  const [search, setSearch] = useState('')
  const zoom = document.getElementById('zoomCCP')

  const normalizedCalls = useMemo(() => {
    return calls.map((log) => {
      const incoming = log.direction === 'inbound'
      return {
        id: log.callId || log.callLogId,
        type: log.direction === 'inbound' ? 'incoming' : log.direction === 'outbound' ? 'outgoing' : 'missed',
        name: incoming ? log.caller?.name : log.callee?.name,
        number: incoming ? log.caller?.number : log.callee?.number,
        duration: log.duration || 0,
        dateTime: log.dateTime,
        email: log.caller?.email || log.callee?.email || null,
        result: log.result
      }
    })
  }, [calls])

  const filteredCalls = useMemo(() => {
    if (!search.trim()) return normalizedCalls
    return normalizedCalls.filter(
      c =>
        (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
        (c.number && c.number.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, normalizedCalls])

  const handleCall = (call) => {
    if (!zoom) {
      console.warn('Zoom CCP not found')
      return
    }

    zoom.contentWindow.postMessage(
      {
        type: 'zp-make-call',
        data: {
          number: call.number || ''
        }
      },
      'https://applications.zoom.us'
    )
  }

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0s'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const missedResults = ['Missed', 'Call Cancel', 'Rejected', 'No Answer']

  return (
    <div
      style={{
        padding: 8,
        fontFamily: 'Segoe UI, sans-serif',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--background)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recent calls..."
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--input-border)',
            outline: 'none',
            fontSize: 14,
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {filteredCalls.length > 0 ? filteredCalls.map((call, index) => {
        const isMissed = missedResults.includes(call.result)
        return (
          <div
            key={`${call.id}-${call.dateTime || index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface)',
              padding: 10,
              borderRadius: 8,
              marginBottom: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  color: isMissed
                    ? '#f44336'
                    : call.type === 'incoming'
                    ? '#4caf50'
                    : '#2196f3',
                  fontSize: 18,
                }}
              >
                {isMissed ? <FaPhoneSlash /> : call.type === 'incoming' ? <FaArrowDown /> : <FaArrowUp />}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{call.name || 'Unknown'}</span>
                {call.number && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{call.number}</span>}
                {call.email && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{call.email}</span>}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Duration: {formatDuration(call.duration)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, fontSize: 16, cursor: 'pointer' }}>
              {(!call.number || call.name === 'Unknown') && <FaUserPlus title="Add Contact" color="#2196f3" />}
              {call.number && <FaPhone title="Call" onClick={() => handleCall(call)} color="#4caf50" />}
            </div>
          </div>
        )
      }) : (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>No recent calls found</p>
      )}
    </div>
  )
}
