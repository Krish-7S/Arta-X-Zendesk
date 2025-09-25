import { useState } from 'react'
import Contacts from '../../components/ContactList'

function TicketSideBar({ client }) {
  const [activeTab, setActiveTab] = useState('zoom')

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '1rem' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('zoom')}
          style={{
            flex: 1,
            padding: '0.5rem',
            background: activeTab === 'zoom' ? '#f0f0f0' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'zoom' ? 'bold' : 'normal'
          }}
        >
          Zoom Phone
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          style={{
            flex: 1,
            padding: '0.5rem',
            background: activeTab === 'contacts' ? '#f0f0f0' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'contacts' ? 'bold' : 'normal'
          }}
        >
          Contacts & Calls
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'zoom' && (
          <div>
           
            <iframe
              src="https://applications.zoom.us/integration/phone/embeddablephone/home"
              id="zoom-embeddable-phone-iframe"
              allow="clipboard-read; clipboard-write https://applications.zoom.us"
              style={{
                width: '100%',
                height: '400px',
                border: 'none'
              }}
              scrolling="no"
              title="Zoom Phone"
            />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <h3>Contacts</h3>
            <Contacts client={client} />

            <h3 style={{ marginTop: '1rem' }}>Recent Calls</h3>
            <p>No recent calls yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketSideBar
