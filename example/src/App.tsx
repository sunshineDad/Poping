import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/home/HomePage'
import { ConversationPage } from './pages/conversation/ConversationPage'
import { ConversationsProvider } from './contexts/ConversationsContext'
import './App.css'

function App() {
  return (
    <ConversationsProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/c/:sessionId" element={<ConversationPage />} />
          </Routes>
        </div>
      </Router>
    </ConversationsProvider>
  )
}

export default App
