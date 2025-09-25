import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { set } from 'mongoose'

// No global client - initialize inside thunks

// ---------------------------
// Fetch Contacts (end-users)
// ---------------------------
export const addNoteToTicket = createAsyncThunk(
  'common/addNoteToTicket',
  async ({ ticketId, noteText }, { rejectWithValue }) => {
    try {
      const cli = window.ZAFClient?.init()
      if (!cli) throw new Error('Zendesk ZAF client not available')
        console.log("commonslice",ticketId,noteText)
      // Update ticket with a public/private comment note
      // If you want the note to be private (agent only), set `public: false`
      const response = await cli.request({
        url: `/api/v2/tickets/${ticketId}.json`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          ticket: {
            comment: {
              body: noteText,
              public: true // Change to false if private note is needed
            }
          }
        })
      })

      console.log('Note added to ticket:', response.ticket)
      return response.ticket
    } catch (err) {
      console.error('Failed to add note:', err)
      return rejectWithValue(err.message || 'Failed to add note to ticket')
    }
  }
)
 
export const fetchZendeskContacts = createAsyncThunk('common/fetchZendeskContacts', async (_, { rejectWithValue }) => {
  try {
    const cli = window.ZAFClient?.init()
    if (!cli) throw new Error('Zendesk ZAF client not available')
    const response = await cli.request({
      url: '/api/v2/users.json?role[]=end-user',
      type: 'GET',
      dataType: 'json'
    })
    console.log('Fetched contacts:', response.users)
    const contacts = (response.users || []).map((u) => ({
      id: u.id,
      name: u.name || 'Unnamed',
      email: u.email || '',
      phone: u.phone || '',
      organization_id: u.organization_id || ''
    }))
    return response.users || []
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch contacts')
  }
})

// ---------------------------
// Find tickets by phone number
// ---------------------------
export const fetchTicketsByPhone = createAsyncThunk(
  'common/fetchTicketsByPhone',
  async (phone, { rejectWithValue }) => {
    try {
      const cli = window.ZAFClient?.init()
      if (!cli) throw new Error('Zendesk ZAF client not available')
      // Step 1: Search for user by phone
      const searchResp = await cli.request({
        url: `/api/v2/users/search.json?query=phone:${phone}`,
        type: 'GET',
        dataType: 'json'
      })
      console.log('Search response:', searchResp)
      if (!searchResp.users || searchResp.users.length === 0) {
        throw new Error('No user found with this phone number')
      }
      const userId = searchResp.users[0].id
      // Step 2: Get tickets requested by that user
      const ticketResp = await cli.request({
        url: `/api/v2/users/${userId}/tickets/requested.json`,
        type: 'GET',
        dataType: 'json'
      })
      console.log('Tickets response:', ticketResp)
      return ticketResp.tickets || [] // Return for extraReducers to handle
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch tickets by phone')
    }
  }
)

// ---------------------------
// Create or find User by phone
// ---------------------------
export const createZendeskUser = createAsyncThunk(
  'common/createZendeskUser',
  async ({ name, email, phone }, { rejectWithValue }) => {
    try {
      const cli = window.ZAFClient?.init()
      if (!cli) throw new Error('Zendesk ZAF client not available')
      // 1. Search for existing user by phone
      const searchResp = await cli.request({
        url: `/api/v2/users/search.json?query=phone:${phone}`,
        type: 'GET',
        dataType: 'json'
      })
      if (searchResp.users && searchResp.users.length > 0) {
        console.log('User already exists:', searchResp.users)
        return searchResp.users
      }
      // 2. Create new user if not found
      const createResp = await cli.request({
        url: '/api/v2/users.json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          user: {
            name,
            email,
            phone,
            role: 'end-user'
          }
        })
      })
      console.log('User created:', createResp.user)
      return createResp.user
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create user')
    }
  }
)

// ---------------------------
// Create Ticket by userId
// ---------------------------
export const createZendeskTicket = createAsyncThunk(
  'common/createZendeskTicket',
  async ({ userId, subject, comment, priority }, { rejectWithValue }) => {
    try {
      const cli = window.ZAFClient?.init()
      if (!cli) throw new Error('Zendesk ZAF client not available')
      const createResp = await cli.request({
        url: '/api/v2/tickets.json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          ticket: {
            requester_id: userId,
            subject,
            comment: { body: comment },
            priority // e.g., "low", "normal", "high", "urgent"
          }
        })
      })
      console.log('Ticket created:', createResp.ticket)
      return createResp.ticket
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create ticket')
    }
  }
)

// ---------------------------
// Handle Zoom Phone Event: check callState only
// ---------------------------
export const handleZoomEvent = createAsyncThunk(
  'common/handleZoomEvent',
  async (zoomEvent, { dispatch, rejectWithValue }) => {
  console.log('handleZoomEvent called with:', zoomEvent)

  const callDetails = zoomEvent
  const incoming = callDetails.direction === 'inbound'

  const callerName = incoming ? callDetails.caller?.name || 'Unknown' : callDetails.callee?.name || 'Unknown'

  const callerNumber = incoming
    ? callDetails.caller?.phoneNumber || callDetails.caller?.number
    : callDetails.callee?.phoneNumber 

  console.log('call details', callerName, callerNumber)

    try {
      // if (!zoomEvent || !zoomEvent.payload) {
      //   throw new Error('Invalid Zoom event')
      // }
      // const {  callerNumber, callerName} = zoomEvent
      let phone =  callerNumber.replace('+', '')
      
      console.log("cala",phone)
      // const phone = callerNumber || ''
      if (!phone) throw new Error('No phone number in Zoom event')

      console.log(`Searching user by phone: ${phone}`)

      const cli = window.ZAFClient?.init()
      if (!cli) throw new Error('Zendesk ZAF client not available')

      // Step 1: Search user by phone
      const searchResp = await cli.request({
        url: `/api/v2/users/search.json?query=phone:${phone}`,
        type: 'GET',
        dataType: 'json'
      })

      let user
      let userExists = false
      if (searchResp.users && searchResp.users.length > 0) {
        user = searchResp.users
        console.log('User found:', user)
        dispatch(setSingleContact(user))
        userExists = true
      }
      else {
        // Step 2: Create user if not found
        console.log('User not found, creating user...')
        const createResp = await cli.request({
          url: '/api/v2/users.json',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            user: {
              name: callerName || phone,
            
              phone,
              role: 'end-user'
            }
          })
        })
        user = createResp.user
        console.log('User created:', user)
        dispatch(setSingleContact(user))
      }

      // Step 3: Fetch tickets for the user
     
      try {
        // const response= fetchTicketsByPhone(phone)
        const response = await cli.request({
          url: `/api/v2/users/search.json?query=phone:${phone}`,
          type: 'GET',
          dataType: 'json'
        })
        const userId = response.users[0].id
        const ticketResp = await cli.request({
          url: `/api/v2/users/${userId}/tickets/requested.json`,
          type: 'GET',
          dataType: 'json'
        })
        console.log(`Fetched tickets for user :`, ticketResp.tickets|| [])
        const tickets = ticketResp.tickets|| []
        dispatch(setTickets(tickets))
        if (tickets.length === 0) {
          console.log(`No tickets found for user with phone ${phone}`)
        } else {
          console.log(`Found ${tickets.length} tickets for user with phone ${phone}`)
        }

        return { user, tickets, userExists, phone }
      } catch (ticketErr) {
        console.error('Error fetching tickets:', ticketErr)
        throw ticketErr
      }
    
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to handle Zoom event')
    }
  
  }
)

const initialState = {
  contact_list: [],
  single_contact: null, // Changed to null for single object
  tickets: [],
  page_route: 'home',
  loading: false,
  error: null,
  ticketLoading: false,
  ticketError: null,
  callData: "", // Store call data from Zoom event
  showCreateTicket:"",
  calllog:""
}

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setContactList: (state, action) => {
      state.contact_list = action.payload
    },
    pushContactList: (state, action) => {
      state.contact_list.unshift(action.payload)
    },
    setSingleContact: (state, action) => {
      state.single_contact = action.payload
      console.log('Single contact set to:', action.payload)
    },
    setPageRoute: (state, action) => {
      console.log('the page route', action.payload)
      state.page_route = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setCallData: (state, action) => {
      state.callData = action.payload
      console.log('Call data set to:', action.payload)
    },
    setShowCreateTicket: (state, action) => {
      state.showCreateTicket = action.payload
      console.log('Call data set to:', action.payload)
    },
    setCallLog: (state, action) => {
      state.calllog = action.payload
      console.log('call log set to', action.payload)

      
    },
    setTickets: (state, action) => {
      state.tickets = action.payload
      console.log('Tickets set to:', action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZendeskContacts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchZendeskContacts.fulfilled, (state, action) => {
        state.loading = false
        state.contact_list = action.payload
      })
      .addCase(fetchZendeskContacts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch contacts'
      })
      .addCase(fetchTicketsByPhone.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTicketsByPhone.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(fetchTicketsByPhone.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch tickets'
      })
      .addCase(createZendeskUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createZendeskUser.fulfilled, (state, action) => {
        state.loading = false
        const exists = state.contact_list.find((c) => c.id === action.payload.id)
        if (!exists) state.contact_list.unshift(action.payload)
      })
      .addCase(createZendeskUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create user'
      })
      .addCase(createZendeskTicket.pending, (state) => {
        state.ticketLoading = true
        state.ticketError = null
      })
      .addCase(createZendeskTicket.fulfilled, (state, action) => {
        state.ticketLoading = false
        state.tickets.unshift(action.payload) // Add new ticket to state
      })
      .addCase(createZendeskTicket.rejected, (state, action) => {
        state.ticketLoading = false
        state.ticketError = action.payload || 'Failed to create ticket'
      })
      .addCase(handleZoomEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(handleZoomEvent.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload
        if (!payload) return
        if (!payload.userExists && payload.user) {
          // Fixed userExists logic
          const exists = state.contact_list.find((c) => c.id === payload.user.id)
          if (!exists) state.contact_list.unshift(payload.user)
        }
        if (payload.tickets) {
          state.tickets = payload.tickets
          console.log('Tickets updated from Zoom event:', payload.tickets)
        }
      })
      .addCase(handleZoomEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to handle Zoom event'
      })
  }
})

export const { setContactList, pushContactList, setSingleContact, setPageRoute, setLoading,setCallData,setCallLog,setTickets

 } = commonSlice.actions

export default commonSlice.reducer
