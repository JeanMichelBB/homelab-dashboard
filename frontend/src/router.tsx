import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import OpnSensePage from './pages/OpnSensePage'

interface Props {
  dark: boolean
  toggleTheme: () => void
}

export default function Router({ dark, toggleTheme }: Props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="/opnsense" element={<OpnSensePage dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
