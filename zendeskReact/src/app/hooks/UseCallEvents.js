import { useEffect } from 'react'
import { useAppContext } from './AppContext'

export function useCallEvents(client) {
  const { dispatch } = useAppContext()

  useEffect(() => {
    if (!client) return

    const handleEvent = async (event) => {
      const { type, data } = event.data || {}

      switch (type) {
        case 'zp-call-ringing-event':
          // Show incoming call popup
          dispatch({
            type: 'SHOW_INCOMING_CALL',
            payload: {
              name: data.caller.name || 'Unknown',
              number: data.caller.number,
              direction: data.direction,
              callId: data.callId
            }
          })
          break

        case 'zp-call-connected-event':
          // Move to call page
          dispatch({
            type: 'SET_ACTIVE_CALL',
            payload: {
              name: data.caller.name || 'Unknown',
              number: data.caller.number,
              direction: data.direction,
              callId: data.callId
            }
          })
          break

        case 'zp-call-ended-event':
          // End the call and return to home
          dispatch({ type: 'END_CALL' })
          break

        default:
          break
      }
    }

    window.addEventListener('message', handleEvent)

    return () => {
      window.removeEventListener('message', handleEvent)
    }
  }, [client, dispatch])
}
