import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context'
import Login from './pages/Login'
import Home from './pages/Home'
import PreAssessment from './pages/PreAssessment'
import Session from './pages/Session'
import PostAssessment from './pages/PostAssessment'
import Complete from './pages/Complete'
import Admin from './pages/Admin'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { participantId } = useApp()
  
  if (!participantId) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/pre-assessment" element={
        <ProtectedRoute>
          <PreAssessment />
        </ProtectedRoute>
      } />
      <Route path="/session" element={
        <ProtectedRoute>
          <Session />
        </ProtectedRoute>
      } />
      <Route path="/post-assessment" element={
        <ProtectedRoute>
          <PostAssessment />
        </ProtectedRoute>
      } />
      <Route path="/complete" element={
        <ProtectedRoute>
          <Complete />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
        <AppRoutes />
      </div>
    </AppProvider>
  )
}
