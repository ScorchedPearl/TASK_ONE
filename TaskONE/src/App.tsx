import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from '@/auth/auth';
import Error from '@/error/error';
import Home from '@/home/home';
import Layout from '@/layout/layout';
import EmailVerificationPage from './auth/emailverify';
import PasswordResetPage from './auth/passreset';
import FlowPage from './flow/flow';
import ProfilePage from './profile/profile';
function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="flow" element={<FlowPage />} />
          <Route path="verify-email" element={<EmailVerificationPage />} />
          <Route path="reset-password" element={<PasswordResetPage/>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Error/>} />
        </Route>

      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
