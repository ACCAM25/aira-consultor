import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Projects from '@/pages/Projects';
import NewProject from '@/pages/NewProject';
import ProjectLayout from '@/pages/project/ProjectLayout';
import Overview from '@/pages/project/Overview';
import Journey from '@/pages/project/Journey';
import Settings from '@/pages/project/Settings';
import People from '@/pages/project/People';
import RegisterPage from '@/pages/project/RegisterPage';
import Dossier from '@/pages/project/Dossier';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/" element={<Projects />} />
              <Route path="/novo" element={<NewProject />} />
              <Route path="/projetos/:id" element={<ProjectLayout />}>
                <Route index element={<Overview />} />
                <Route path="jornada" element={<Journey />} />
                <Route path="configuracao" element={<Settings />} />
                <Route path="pessoas" element={<People />} />
                <Route path="dossie" element={<Dossier />} />
                <Route path=":register" element={<RegisterPage />} />
              </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
