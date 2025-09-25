import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createZendeskTicket, fetchTicketsByPhone } from '../store/commonSlice'

export default function CreateTicket({ client, onClose, onTicketCreated }) {
  const callData = useSelector((state) => state.common.callData)
  const callerNumber = callData?.callerNumber || ''
  const callerName = callData?.callerName || ''
  const user = useSelector((state) => state.common.single_contact)
  const darkMode = useSelector((state) => state.ui?.darkMode) || false

  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('normal')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim()) {
      alert('Subject is required')
      return
    }
    try {
      setLoading(true)
      const payload = {
        ticket: {
          requester_id: user[0]?.id,
          subject: subject.trim(),
          priority: priority.toLowerCase(),
          comment: { body: description.trim() },
        },
      }
      const response = await client.request({
        url: '/api/v2/tickets.json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
      })
      const createdTicket = response?.ticket || null
      if (callerNumber) {
        await dispatch(fetchTicketsByPhone(callerNumber)).unwrap()
      }
      if (onTicketCreated && createdTicket) {
        onTicketCreated(createdTicket)
        onClose()
      }
    } catch (err) {
      alert('Failed to create ticket: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (value) => {
    switch (value.toLowerCase()) {
      case 'low':
        return '#28a745'
      case 'normal':
        return '#007bff'
      case 'high':
        return '#ffc107'
      case 'urgent':
        return '#dc3545'
      default:
        return '#007bff'
    }
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        fontFamily: 'Segoe UI, sans-serif',
        background: 'var(--surface)',
        borderRadius: '12px',
        boxShadow: darkMode
          ? '0 4px 16px rgba(0,0,0,0.28)'
          : '0 4px 12px rgba(0,0,0,0.08)',
        color: 'var(--text-primary)',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Create Ticket</h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >✕</button>
      </div>

      {/* Caller Info */}
      <div
        style={{
          marginBottom: '20px',
          padding: '12px',
          background: 'var(--input-bg)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>Caller:</strong> {callerName || 'Unknown'} <br />
        <strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> {callerNumber || 'N/A'}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex', flexDirection: 'column', gap: '14px', flex: 1
      }}>
        {/* Subject */}
        <div>
          <label style={{
            display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500,
            color: 'var(--text-secondary)'
          }}>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter ticket subject"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: '0.2s border'
            }}
            onFocus={e => e.target.style.border = '1px solid #0077ff'}
            onBlur={e => e.target.style.border = `1px solid ${darkMode ? '#555' : '#ccc'}`}
          />
        </div>

        {/* Priority */}
        <div>
          <label style={{
            display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500,
            color: 'var(--text-secondary)'
          }}>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${getPriorityColor(priority)}`,
              background: 'var(--input-bg)',
              color: getPriorityColor(priority),
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'capitalize'
            }}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Description */}
        <div style={{ flex: 1 }}>
          <label style={{
            display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500,
            color: 'var(--text-secondary)'
          }}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="4"
            placeholder="Provide details about the issue..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none'
            }}
            onFocus={e => e.target.style.border = '1px solid #0077ff'}
            onBlur={e => e.target.style.border = `1px solid ${darkMode ? '#555' : '#ccc'}`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 16px',
            background: loading ? '#aaa' : '#0077ff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            marginTop: '4px',
            transition: '0.2s background'
          }}
        >
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  )
}
