import { FaSun, FaMoon } from 'react-icons/fa'

export default function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 75,
        right: 20,
        zIndex: 9999,
      }}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: darkMode ? '#333' : 'transparent',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: darkMode ? '#ffd500' : '#222',
          fontSize: 22,
          transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
          filter: darkMode
            ? 'drop-shadow(0 0 8px #ffd500)'    // sun glows in dark mode
            : 'drop-shadow(0 0 8px #3366ff)',   // moon glows in light mode
        }}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  )
}
