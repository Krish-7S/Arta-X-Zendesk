import { createContext, useReducer, useContext } from 'react'

const AppContext = createContext()

const initialState = {
  pageRoute: 'home', // home / call / new-contact / ticket etc
  showIncomingCall: false, // floating popup
  activeCall: null // details of current call
}

function reducer(state, action) {
  switch (action.type) {
    case 'SHOW_INCOMING_CALL':
      return {
        ...state,
        showIncomingCall: true,
        activeCall: action.payload,
        pageRoute: 'listtickets' // auto-switch to ListTickets
      }
    case 'HIDE_INCOMING_CALL':
      return { ...state, showIncomingCall: false }
    case 'SET_ACTIVE_CALL':
      return {
        ...state,
        pageRoute: 'call',
        activeCall: action.payload,
        showIncomingCall: false
      }
    case 'END_CALL':
      return { ...state, pageRoute: 'home', activeCall: null, showIncomingCall: false }
    case 'SET_PAGE_ROUTE':
      console.log("action.payload",action.payload)  
      return { ...state, pageRoute: 'call' }
    default:
      return state
  }
}


export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
