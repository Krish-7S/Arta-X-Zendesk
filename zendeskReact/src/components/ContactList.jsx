import { useEffect, useState } from 'react'
import { FaPhone } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { fetchZendeskContacts } from '../store/commonSlice'

const Contacts = ({ client }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.common.loading)
  const error = useSelector((state) => state.common.error)
  const contactsList = useSelector((state) => state.common.contact_list) || []

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredContacts, setFilteredContacts] = useState([])

  useEffect(() => {
    if (client) {
      dispatch(fetchZendeskContacts())
    }
  }, [client, dispatch])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contactsList)
    } else {
      const lower = searchTerm.toLowerCase()
      setFilteredContacts(
        contactsList.filter(
          (contact) =>
            (contact.name && contact.name.toLowerCase().includes(lower)) ||
            (contact.phone && contact.phone.toLowerCase().includes(lower)) ||
            (contact.email && contact.email.toLowerCase().includes(lower))
        )
      )
    }
  }, [searchTerm, contactsList])

  const openContact = (contactId) => {
    if (!client) return
    client.invoke('routeTo', 'user', contactId)
  }

  const handleCall = (contact) => {
    const zoom = document.getElementById('zoomCCP')
    if (!zoom?.contentWindow) return
    zoom.contentWindow.postMessage(
      { type: 'zp-make-call', data: { number: contact.phone || '' } },
      'https://applications.zoom.us'
    )
    if (typeof window.togglePlatform === 'function') {
      window.togglePlatform()
    }
  }

  if (loading) return <p style={{ color: 'var(--text-primary)' }}>Loading contacts...</p>
  if (error) return <p style={{ color: 'var(--text-primary)' }}>{error}</p>

  return (
    <div
      style={{
        padding: '8px',
        fontFamily: 'Segoe UI, sans-serif',
        flex: 1,
        overflowY: 'auto',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name, number or email..."
        style={{
          marginBottom: '12px',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid var(--input-border)',
          fontSize: '14px',
          background: 'var(--input-bg)',
          color: 'var(--text-primary)',
          outline: 'none'
        }}
      />

      {filteredContacts.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No contacts found</p>
      ) : (
        filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => openContact(contact.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#2196f3',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {contact.name ? contact.name[0].toUpperCase() : '?'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>
                  {contact.name || 'Unknown'}
                </span>
                {contact.email && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {contact.email}
                  </span>
                )}
                {contact.phone && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {contact.phone}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '16px', color: '#4caf50' }}>
              {contact.phone && (
                <FaPhone
                  title="Call"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCall(contact)
                  }}
                  style={{ cursor: 'pointer', color: '#4caf50' }}
                />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Contacts
