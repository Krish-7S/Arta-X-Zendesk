import { useState, useEffect, lazy, Suspense } from 'react'
import { TranslationProvider } from './contexts/TranslationProvider'
import { DEFAULT_THEME ,ThemeProvider } from '@zendeskgarden/react-theming'
import { AppProvider, useAppContext } from './contexts/AppContext'
import { useLocation, useClient } from './hooks/useClient'
import IncomingCall from '../components/IncomingCall'
import { setCallData, setPageRoute, handleZoomEvent, setCallLog } from '../store/commonSlice'
import { useDispatch } from 'react-redux'
import { DARK_THEME } from '../components/Theme.js'
import DarkModeToggle from '../components/BulbToggle.jsx'

// Lazy load components
const TicketSideBar = lazy(() => import('./locations/TicketSideBar'))
const Modal = lazy(() => import('./locations/Modal'))
const Contacts = lazy(() => import('./locations/contacts'))
const TopBar = lazy(() => import('./locations/TopBar'))

const LOCATIONS = {
  ticket_sidebar: TicketSideBar,
  modal: Modal,
  top_bar: TopBar,
  contacts: Contacts,
  default: () => null
}

// Simulation Buttons
function SimButtons() {
  console.log('Wajhs')
  const dispatch = useDispatch()

  const simulateIncomingCall = () => {
    const callDetails = { callId: '068cba3db27ba0d08d2',
      callLogId: '8fe17897-0a17-45c2-9201-ee72ebcf8bec',
      callee: { number: '45654565', numberType: 2, didNumber: '1234567890' },
      caller: { name: 'sandeza zoom', callerNumber: '45654565', numberType: 1, didNumber: '+14708662627' },
      dateTime: '2025-09-18T06:16:59Z',
      direction: 'inbound',
      duration: 363,
      enableAutoLog: false,
      result: 'Call Connected'}
    dispatch(
      setCallData(callDetails)
    )
    dispatch(handleZoomEvent(callDetails))
    dispatch(setPageRoute('incoming'))
    console.log('hi')
  }

  const simulateCallConnected = () => {
    console.log('hiuu')
    dispatch(setPageRoute('call'))
    dispatch(
      setCallData({
        callerName: '800 Service',
        callerNumber: '45654565',
        direction: 'inbound',
        callId: '1001'
      })
    )
  }

  const simulateCallEnded = () => {
    const callDetails = {
      callId: '068cba3db27ba0d08d2',
      callLogId: '8fe17897-0a17-45c2-9201-ee72ebcf8bec',
      callee: { number: '+1234567890', numberType: 2, didNumber: '1234567890' },
      caller: { name: 'sandeza zoom', number: '800', numberType: 1, didNumber: '+14708662627' },
      dateTime: '2025-09-18T06:16:59Z',
      direction: 'inbound',
      duration: 363,
      enableAutoLog: false,
      result: 'Call Connected'
    }

    console.log('call log data', callDetails)
    let client = window.ZAFClient.init()

    function setKey(key, val) {
      return client.metadata().then(function (metadata) {
        localStorage.setItem(metadata.installationId + ':' + key, JSON.stringify(val))
      })
    }

    function getKey(key) {
      return client.metadata().then(function (metadata) {
        const stored = localStorage.getItem(metadata.installationId + ':' + key)
        return stored ? JSON.parse(stored) : null
      })
    }

    // First get existing logs
    getKey('ZOOMBYOT').then(function (logs) {
      let updatedLogs = []

      if (Array.isArray(logs)) {
        // Already some logs → append new one at start
        updatedLogs = [callDetails, ...logs]
      } else {
        // Nothing yet → create new array
        updatedLogs = [callDetails]
      }

      // Save updated logs
      setKey('ZOOMBYOT', updatedLogs)

      // Update redux state also
      console.log('Updated call logs:', updatedLogs)
      dispatch(setCallLog(updatedLogs))
    })
     dispatch(setPageRoute('home'))
  }
  

  const simButtonStyle = (bgColor) => ({
    padding: '6px 12px',
    background: bgColor,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  })

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
      <button onClick={simulateIncomingCall} style={simButtonStyle('#28a745')}>
        Incoming Call
      </button>
      <button onClick={simulateCallConnected} style={simButtonStyle('#0077ff')}>
        Call Connected
      </button>
      <button onClick={simulateCallEnded} style={simButtonStyle('#dc3545')}>
        Call Ended
      </button>
    </div>
  )
}

function App() {
  const location = useLocation()
  const client = useClient()
  const Location = LOCATIONS[location] || LOCATIONS.default
  const dispatch = useDispatch()
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const [darkMode, setDarkMode] = useState(prefersDark)

  console.log('Wajhs')
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    const setupZoomListener = async () => {
      try {
        const zoom = document.getElementById('zoomCCP')
        if (zoom?.contentWindow) {
          zoom.contentWindow.postMessage(
            {
              type: 'zp-init-config',
              data: {
                enableSavingLog: true,
                enableAutoLog: true,
                enableContactSearching: true,
                enableContactMatching: true,
                notePageConfiguration: [
                  {
                    fieldName: 'Disposition',
                    fieldType: 'select',
                    selectOptions: [
                      { label: 'Interested', value: 'interested' },
                      { label: 'Not Interested', value: 'not_interested' },
                      { label: 'No Contact', value: 'no_contact' }
                    ],
                    placeholder: 'Select an option'
                  },
                  {
                    fieldName: 'Description',
                    fieldType: 'text',
                    placeholder: 'Enter notes'
                  }
                ]
              }
            },
            'https://applications.zoom.us'
          )
        }
        // ✅ Always load stored logs on app start
        let client = window.ZAFClient.init()

        function getKey(key) {
          return client.metadata().then(function (metadata) {
            const stored = localStorage.getItem(metadata.installationId + ':' + key)
            return stored ? JSON.parse(stored) : []
          })
        }

        getKey('ZOOMBYOT').then((logs) => {
          if (Array.isArray(logs) && logs.length > 0) {
            console.log('Fetched old logs on init:', logs)
            dispatch(setCallLog(logs)) // hydrate Redux immediately
          }
        })

        const handler = (event) => {
          // const dispatch=useDispatch;
          const { type } = event.data || {}
          // console.log('EVENT FROM ZOOM:', type, event.data)
          
          const callDetails = event.data.data
          // console.log('calldet', callDetails)
          //  console.log("callerdd",callDetails.callee.name)
          let callerName, callerNumber
          //  if(type!=undefined){

          //  }

          if (type === 'zp-call-ringing-event') {
        
            dispatch(handleZoomEvent(callDetails))
            const incoming = event.data.data.direction === 'inbound'
            callerName = incoming ? callDetails.caller.name : callDetails.callee.name || 'Unknown'
            callerNumber = incoming ? callDetails.caller.phoneNumber : callDetails.callee.phoneNumber || 'Unknown'
            console.log('call details from app.jsx',incoming, callerName, callerNumber)
            console.log('Incoming call came')
            dispatch(setPageRoute('incoming'))
            dispatch(
              setCallData({
                callerName: callerName,
                callerNumber: callerNumber.replace('+', ''),
                direction: callDetails.direction,
                callId: callDetails.callId
              })
            )
          }

          if (type === 'zp-call-connected-event') {
            console.log('call connected')
            dispatch(setPageRoute('call'))
          }

          if (type === 'zp-call-ended-event') {
            console.log('call ended')
            dispatch(setPageRoute('home'))
          }

          if (type === 'zp-notes-save-event') {
            console.log('Notes saved:', event.data)
          }

          if (type === 'zp-call-voicemail-received-event') {
            console.log('Voicemail received:', event.data)
          }
          if (type === 'zp-call-log-completed-event') {
            console.log('call log data', callDetails)
            let client = window.ZAFClient.init()

            function setKey(key, val) {
              return client.metadata().then(function (metadata) {
                localStorage.setItem(metadata.installationId + ':' + key, JSON.stringify(val))
              })
            }

            function getKey(key) {
              return client.metadata().then(function (metadata) {
                const stored = localStorage.getItem(metadata.installationId + ':' + key)
                return stored ? JSON.parse(stored) : null
              })
            }

            // First get existing logs
            getKey('ZOOMBYOT').then(function (logs) {
              let updatedLogs = []

              if (Array.isArray(logs)) {
                // Already some logs → append new one at start
                updatedLogs = [callDetails, ...logs]
              } else {
                // Nothing yet → create new array
                updatedLogs = [callDetails]
              }

              // Save updated logs
              setKey('ZOOMBYOT', updatedLogs)

              // Update redux state also
              console.log('Updated call logs:', updatedLogs)
              dispatch(setCallLog(updatedLogs))
            })
          }
        }

        window.addEventListener('message', handler)
        return () => window.removeEventListener('message', handler)
      } catch (err) {
        // console.error('Zoom listener setup failed:', err)
      }
    }

    setupZoomListener()
  }, [client, dispatch,darkMode])

  return (
    <AppProvider>
      <ThemeProvider theme={darkMode ? DARK_THEME : DEFAULT_THEME}>
        <TranslationProvider>
          {/* Dark mode toggle button */}
          <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

         {/* <SimButtons/> */}

          {/* Floating Incoming Call */}
          <IncomingCall />

          {/* Main Location */}
          <Suspense fallback={<span>Loading...</span>}>
            <Location client={client} />
          </Suspense>
        </TranslationProvider>
      </ThemeProvider>
    </AppProvider>
  )
}

export default App
