import { useEffect, useState } from 'react'
import Home from './pages/Home'

export default function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return <Home toggleTheme={() => setDark(d => !d)} dark={dark} />
}
