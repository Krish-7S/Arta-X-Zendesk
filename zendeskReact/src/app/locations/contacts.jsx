import { useEffect, useState } from 'react'

const Contacts = ({ client }) => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('📞 Contacts mounted, client:', client)

    if (!client) {
      console.warn('❌ Client is not ready yet')
      return
    }

    const fetchContacts = async () => {
      try {
        setLoading(true)
        console.log('➡️ Fetching /api/v2/users.json')
        const response = await client.request({
          url: '/api/v2/users.json',
          type: 'GET',
          contentType: 'application/json'
        })
        console.log('✅ Contacts response:', response)
        setContacts(response.users || [])
      } catch (err) {
        console.error('❌ Error fetching contacts:', err)
        setError('Failed to fetch contacts')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [client])

  if (loading) return <p>Loading contacts...</p>
  if (error) return <p>{error}</p>

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Contacts</h2>
      {contacts.length === 0 ? (
        <p>No contacts found</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {contacts.map((contact) => (
            <li
              key={contact.id}
              style={{
                border: '1px solid #ccc',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px'
              }}
            >
              <strong>{contact.name}</strong>
              <br />
              <small>{contact.email}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Contacts
