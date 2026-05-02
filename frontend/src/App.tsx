import { useEffect, useState } from 'react'
import Router from './router'

export default function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return <Router dark={dark} toggleTheme={() => setDark(d => !d)} />
}
