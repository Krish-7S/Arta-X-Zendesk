import { useState } from 'react'
import RecentCalls from '../../components/RecentCalls'
import ContactList from '../../components/ContactList'
import ListTickets from '../../components/ListTickets'
import { useAppContext } from '../contexts/AppContext'
import { useSelector } from 'react-redux'

export default function TopBar({ client }) {
  const { state } = useAppContext()
  const page_route = useSelector((state) => state.common.page_route)
  const calllogs = useSelector((state) => state.common.calllog)
  const [activeTab, setActiveTab] = useState('recent')

  const callsFromAPI = Array.isArray(calllogs) ? calllogs : calllogs ? [calllogs] : []

  if (page_route === 'call') {
    return <ListTickets client={client} />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, sans-serif',
        height: '100%',
        minHeight: 0,
        background: 'var(--background)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: '12px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'var(--surface)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => setActiveTab('recent')}
          style={tabButtonStyle(activeTab === 'recent')}
        >
          Recent Calls
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          style={tabButtonStyle(activeTab === 'contacts')}
        >
          Contact List
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {activeTab === 'recent' && <RecentCalls calls={callsFromAPI} client={client} />}
        {activeTab === 'contacts' && <ContactList client={client} />}
      </div>
    </div>
  )
}

// Enhanced tab style for both modes
const tabButtonStyle = (active) => ({
  flex: 1,
  padding: '12px',
  background: active ? 'var(--tab-button-active-bg)' : 'var(--tab-button-inactive-bg)',
  color: active ? '#fff' : 'var(--tab-button-inactive-color)',
  fontWeight: active ? 600 : 400,
  fontSize: '16px',
  outline: 'none',
  border: 'none',
  borderBottom: active ? '3px solid #0077ff' : '3px solid transparent', // thicker accent for active tab
  cursor: 'pointer',
  transition: 'background-color 0.3s, color 0.3s, border-bottom 0.3s',
  borderRadius: active ? '8px 8px 0 0' : '8px 8px 0 0',
  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
  zIndex: active ? 1 : 0
})
