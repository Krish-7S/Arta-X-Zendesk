import { configureStore } from '@reduxjs/toolkit'
import contactsReducer from './commonSlice' // updated slice


const store = configureStore({
  reducer: {
    common: contactsReducer, // handles all contact-related state
  
  }
  // Optional: enable devTools in production if needed
  // devTools: process.env.NODE_ENV !== "production",
})

export default store
