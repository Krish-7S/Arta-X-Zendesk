import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ClientProvider } from './contexts/ClientProvider.jsx'
import '@zendeskgarden/css-bedrock'
import './index.css'
import { Provider } from 'react-redux'
import store  from '../store/store.js'



ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ClientProvider>
      <App />
    </ClientProvider>
  </Provider>
)
