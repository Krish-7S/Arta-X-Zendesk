import { useState } from 'react'
import { addNoteToTicket } from '../store/commonSlice'
import { useDispatch } from 'react-redux'
export default function CreateNote({ client, onClose }) {
  const [ticketId, setTicketId] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    const dispatch=useDispatch();
    if (!ticketId || !note.trim()) {
      setMessage('Please enter both Ticket ID and Note')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      console.log("ticket details",ticketId,note)
        dispatch(addNoteToTicket(ticketId,note));
      setMessage(`✅ Note added successfully to ticket #${ticketId}`,note)
      setNote('')
      setTicketId('')
    } catch (err) {
      console.error('Error adding note:', err)
      setMessage('❌ Failed to add note. Check console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '16px',
        fontFamily: 'Segoe UI, sans-serif',
        width: '100%',
        background: '#f9f9f9'
      }}
    >
      <h3 style={{ marginBottom: '12px' }}>Add Note to Ticket</h3>

      {/* Ticket ID input */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600 }}>Ticket ID</label>
        <input
          type="text"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          placeholder="Enter Ticket ID"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            marginTop: '4px'
          }}
        />
      </div>

      {/* Note input */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600 }}>Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here..."
          rows={5}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            marginTop: '4px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            background: '#2196f3',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Note'}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Message */}
      {message && <p style={{ marginTop: '12px', fontSize: '14px', color: '#555' }}>{message}</p>}
    </div>
  )
}
