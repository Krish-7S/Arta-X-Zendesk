import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaPhone, FaPhoneSlash } from 'react-icons/fa'

export default function IncomingCall() {
  const call = useSelector((state) => state.common.callData)
  const page_route = useSelector((state) => state.common.page_route)
  const darkMode = useSelector((state) => state.ui?.darkMode) || false

  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: 20 })
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const startDrag = (e) => {
    e.preventDefault()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    setOffset({ x: clientX - position.x, y: clientY - position.y })
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return

    const moveHandler = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      setPosition({
        x: Math.max(0, Math.min(clientX - offset.x, window.innerWidth - 320)),
        y: Math.max(0, Math.min(clientY - offset.y, window.innerHeight - 100)),
      })
    }

    const endHandler = () => {
      setDragging(false)
      setPosition((prev) => ({
        x: prev.x < window.innerWidth / 2 ? 10 : window.innerWidth - 330,
        y: prev.y < window.innerHeight / 2 ? 10 : window.innerHeight - 110,
      }))
    }

    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', endHandler)
    document.addEventListener('touchmove', moveHandler)
    document.addEventListener('touchend', endHandler)

    return () => {
      document.removeEventListener('mousemove', moveHandler)
      document.removeEventListener('mouseup', endHandler)
      document.removeEventListener('touchmove', moveHandler)
      document.removeEventListener('touchend', endHandler)
    }
  }, [dragging, offset])

  const acceptCall = () => window.togglePlatform()
  const declineCall = () => window.togglePlatform()

  if (page_route !== 'incoming') return null

  return (
    <div
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 340,
        height: 75,
        backgroundColor: 'var(--surface)', // uses CSS variable
        borderRadius: 20,
        boxShadow: darkMode
          ? '0 4px 24px rgba(0,0,0,0.7)'
          : '0 4px 16px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 14px',
        fontFamily: 'Segoe UI, sans-serif',
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: 9999,
        userSelect: 'none',
        color: 'var(--text-primary)', // uses CSS variable
        transition: 'background-color 0.3s, color 0.3s',
      }}
    >
      {/* Decline button */}
      <div style={{ minWidth: 50, marginRight: 12, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={declineCall}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            fontSize: 18,
            color: '#fff',
            backgroundColor: '#f44336',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Decline call"
          title="Decline"
          type="button"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* Caller info */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
          {call.callerName}
        </p>
        <p style={{ fontSize: 14, margin: 0, color: 'var(--text-secondary)' }}>{call.callerNumber}</p>
      </div>

      {/* Accept button */}
      <div style={{ minWidth: 50, marginLeft: 12, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={acceptCall}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            fontSize: 18,
            color: '#fff',
            backgroundColor: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Accept call"
          title="Accept"
          type="button"
        >
          <FaPhone />
        </button>
      </div>
    </div>
  )
}
