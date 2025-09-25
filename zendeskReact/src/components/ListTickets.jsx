import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTicketsByPhone } from '../store/commonSlice'
import CreateTicket from './createTicket'

export default function ListTickets({ client }) {
  // Redux and local states
  const [tickets, setTickets] = useState([])
  const callData = useSelector((state) => state.common.callData)
  const callerNumber = callData?.callerNumber
  const callerName = callData?.callerName
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [noteTicketId, setNoteTicketId] = useState(null)
  const [noteText, setNoteText] = useState('')
  const dispatch = useDispatch()
  const [hoveredTicket, setHoveredTicket] = useState(null)
  const user = useSelector((state) => state.common.single_contact)
  const darkMode = useSelector((state) => state.ui?.darkMode) || false // assuming darkMode is here

  useEffect(() => {
    if (!client || !callerNumber) {
      setError('Missing client or caller number')
      setLoading(false)
      return
    }
    async function loadTickets() {
      setLoading(true)
      setError('')
      try {
        const resultAction = await dispatch(fetchTicketsByPhone(callerNumber))
        if (fetchTicketsByPhone.fulfilled.match(resultAction)) {
          setTickets(resultAction.payload)
        } else {
          throw new Error(resultAction.payload || 'Failed to fetch tickets')
        }
      } catch (err) {
        setError('Failed to load tickets: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    loadTickets()
  }, [client, callerNumber, dispatch])

  const createNote = async (ticketId) => {
    if (!noteText.trim()) return alert('Please enter a note before submitting.')
    try {
      await client.request({
        url: `/api/v2/tickets/${ticketId}.json`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ ticket: { comment: { body: noteText, public: false } } }),
      })
      alert('Note added successfully!')
      setNoteTicketId(null)
      setNoteText('')
    } catch (err) {
      alert('Failed to add note: ' + (err.message || 'Unknown error'))
    }
  }

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return '#28a745'
      case 'pending':
        return '#ffc107'
      case 'solved':
        return '#007bff'
      case 'closed':
        return '#6c757d'
      default:
        return '#17a2b8'
    }
  }

  const openTicketInBackground = (ticketId) => {
    if (!ticketId) return
    client.invoke('routeTo', 'ticket', ticketId)
  }

  const openContactInBackground = (contactId) => {
    if (!contactId) return
    console.log('Attempting to open contact:', contactId, user[0].id)
    client.invoke('routeTo', 'user', user[0].id)
  }

  if (loading) return <p style={{ padding: 12 }}>Loading tickets...</p>
  if (error)
    return (
      <p style={{ padding: 12, color: 'var(--danger)' }}>
        {error}
      </p>
    )
  if (showCreateTicket)
    return (
      <CreateTicket
        client={client}
        onClose={() => setShowCreateTicket(false)}
        onTicketCreated={(ticket) => setTickets([ticket, ...tickets])}
      />
    )

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        fontFamily: 'Segoe UI, sans-serif',
        background: 'var(--background)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Caller Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
          background: 'var(--surface)',
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
          width: '100%',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'var(--tab-button-active-bg)', // use theme primary color
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: 20,
          }}
        >
          {callerName ? callerName[0].toUpperCase() : '?'}
        </div>

        {/* Caller Details */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginLeft: 12,
            cursor: 'pointer',
          }}
          onClick={() => openContactInBackground('1')} // update with real ID
          title="Open Contact in Zendesk"
        >
          <span style={{ fontWeight: 600, fontSize: 16 }}>{callerName || 'Unknown Caller'}</span>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{callerNumber || '-'}</span>
          <span style={{ fontSize: 12, color: '#28a745', fontWeight: 500 }}>Connected</span>
        </div>

        {/* + Ticket button */}
        <button
          onClick={() => setShowCreateTicket(true)}
          style={{
            padding: '4px 10px',
            background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
          type="button"
        >
          + Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {tickets.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No tickets found</p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                style={{
                  position: 'relative',
                  background: 'var(--surface)',
                  borderRadius: 9,
                  padding: 16,
                  boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'var(--text-primary)',
                }}
                onClick={() => openTicketInBackground(ticket.id)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <strong
                    style={{
                      fontSize: 15,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    {ticket.subject}
                  </strong>
                  {/* Ticket Badges */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      fontSize: 11,
                      alignItems: 'center',
                      marginTop: 4,
                      flexWrap: 'wrap',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span
                      style={{
                        background:
                          ticket.status.toLowerCase() === 'open'
                            ? '#cce5ff'
                            : ticket.status.toLowerCase() === 'pending'
                            ? '#fff3cd'
                            : ticket.status.toLowerCase() === 'solved'
                            ? '#d4edda'
                            : '#e2e3e5',
                        color:
                          ticket.status.toLowerCase() === 'open'
                            ? '#004085'
                            : ticket.status.toLowerCase() === 'pending'
                            ? '#856404'
                            : ticket.status.toLowerCase() === 'solved'
                            ? '#155724'
                            : '#6c757d',
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        transition: 'all 0.2s ease',
                      }}
                      title={ticket.status}
                    >
                      {ticket.status}
                    </span>

                    <span
                      style={{
                        background:
                          ticket.priority?.toLowerCase() === 'high'
                            ? '#f8d7da'
                            : ticket.priority?.toLowerCase() === 'medium'
                            ? '#fff3cd'
                            : ticket.priority?.toLowerCase() === 'low'
                            ? '#d4edda'
                            : '#e2e3e5',
                        color:
                          ticket.priority?.toLowerCase() === 'high'
                            ? '#721c24'
                            : ticket.priority?.toLowerCase() === 'medium'
                            ? '#856404'
                            : ticket.priority?.toLowerCase() === 'low'
                            ? '#155724'
                            : '#6c757d',
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        transition: 'all 0.2s ease',
                      }}
                      title={`Priority: ${ticket.priority || 'Normal'}`}
                    >
                      {ticket.priority || 'Normal'}
                    </span>
                  </div>
                </div>

                {/* + Note button top-right */}
                {!noteTicketId && (
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setNoteTicketId(ticket.id)
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--tab-button-active-bg)',
                        fontSize: 18,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'color 0.2s ease',
                        userSelect: 'none',
                      }}
                      onMouseEnter={() => setHoveredTicket(ticket.id)}
                      onMouseLeave={() => setHoveredTicket(null)}
                      title="Add Note"
                      type="button"
                    >
                      +
                      <span
                        style={{
                          visibility: hoveredTicket === ticket.id ? 'visible' : 'hidden',
                          opacity: hoveredTicket === ticket.id ? 1 : 0,
                          backgroundColor: '#333',
                          color: '#fff',
                          textAlign: 'center',
                          borderRadius: 6,
                          padding: '4px 8px',
                          position: 'absolute',
                          zIndex: 1,
                          top: 28,
                          right: 0,
                          fontSize: 12,
                          transition: 'opacity 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Add Note
                      </span>
                    </button>
                  </div>
                )}

                {/* Note text area */}
                {noteTicketId === ticket.id && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write a note..."
                      style={{
                        width: '100%',
                        padding: 8,
                        borderRadius: 12,
                        fontSize: 13,
                        border: '1px solid var(--input-border)',
                        resize: 'none',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => createNote(ticket.id)}
                        style={{
                          padding: '4px 12px',
                          background: 'var(--success)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 20,
                          cursor: 'pointer',
                          fontSize: 13,
                          transition: 'all 0.2s ease',
                          userSelect: 'none',
                        }}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setNoteTicketId(null)
                          setNoteText('')
                        }}
                        style={{
                          padding: '4px 12px',
                          background: 'var(--surface)',
                          color: 'var(--text-secondary)',
                          border: 'none',
                          borderRadius: 20,
                          cursor: 'pointer',
                          fontSize: 13,
                          transition: 'all 0.2s ease',
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
