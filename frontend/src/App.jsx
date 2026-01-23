import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import TodoPage from './pages/TodoPage'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/get-todos" element={<TodoPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
